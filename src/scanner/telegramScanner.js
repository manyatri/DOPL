// telegramScanner.js
//
// Yeh file DOPL ka core scanning engine hai.
// Sirf PUBLIC Telegram channels/groups scan karta hai (t.me/s/{channel} preview pages).
// Koi private group infiltration, koi bot login, koi unauthorized access NAHI hai —
// yeh boundary project ke shuru se fixed hai aur isi file mein bhi maintained hai.
//
// Flow:
// 1. DB se sab active scan targets (sourceType = 'public_telegram') fetch karo
// 2. Har target ke liye channel username URL se nikaalo
// 3. joinchat/ ya invite links (+xxxx) ko skip karo — wo scrape nahi ho sakte
// 4. https://t.me/s/{channelUsername} scrape karo (axios + cheerio)
// 5. Us target ke owner (userId) ke active keywords se match karo
// 6. Match mila aur duplicate nahi hai to ScanResult + Alert create karo
// 7. Har channel request ke beech 2 second ka gap (rate limiting se bachne ke liye)
// 8. Pura process node-cron se har 30 minute mein repeat hota hai

import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';
import prisma from '../db.js';

// ------------------------------------------------------------------
// Helper: thoda rukne ke liye (rate limiting se bachne ke liye)
// ------------------------------------------------------------------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------------------------------------------------------------------
// Helper: scan target ke sourceUrl se Telegram channel username nikalo
// Examples handle kiye gaye:
//   https://t.me/somechannel        -> "somechannel"
//   https://t.me/s/somechannel      -> "somechannel"
//   t.me/somechannel/               -> "somechannel"
//   https://t.me/joinchat/AbCdEfGh  -> null (skip — private invite link)
//   https://t.me/+AbCdEfGhIjK       -> null (skip — naya invite link format)
// ------------------------------------------------------------------
function extractChannelUsername(sourceUrl) {
  if (!sourceUrl) return null;

  // Private invite links — yeh scrape nahi ho sakte, skip karo
  if (sourceUrl.includes('joinchat') || sourceUrl.includes('t.me/+')) {
    return null;
  }

  // URL se path nikaalo, query params/trailing slash hata ke
  const match = sourceUrl.match(/t\.me\/(?:s\/)?([a-zA-Z0-9_]+)\/?/i);
  if (!match || !match[1]) return null;

  return match[1];
}

// ------------------------------------------------------------------
// Helper: ek public channel ke recent messages scrape karo
// Returns: array of message text strings (lowercase nahi kiya, raw text)
// ------------------------------------------------------------------
async function scrapeChannelMessages(channelUsername) {
  const url = `https://t.me/s/${channelUsername}`;

  try {
    const response = await axios.get(url, {
      headers: {
        // Kuch sites bina user-agent ke block kar deti hain
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const messages = [];

    // Telegram public preview page structure:
    // har message ek div.tgme_widget_message_text ke andar hota hai
    $('.tgme_widget_message_text').each((_, el) => {
      const text = $(el).text().trim();
      if (text) messages.push(text);
    });

    return messages;
  } catch (error) {
    // Channel exist nahi karta, ya private hai, ya page structure change ho gaya —
    // is target ko skip karo, pura scanner crash mat karo
    console.error(`[scanner] Failed to scrape channel "${channelUsername}":`, error.message);
    return [];
  }
}

// ------------------------------------------------------------------
// Main scan function — ek baar pura cycle chalata hai
// ------------------------------------------------------------------
async function runScan() {
  console.log('[scanner] Scan cycle started:', new Date().toISOString());

  // Step 1: Sab active, public_telegram scan targets fetch karo
  const targets = await prisma.scanTarget.findMany({
    where: {
      sourceType: 'public_telegram',
      isActive: true,
    },
  });

  if (targets.length === 0) {
    console.log('[scanner] No active scan targets found. Skipping cycle.');
    return;
  }

  // Step 2: Un sab targets ke owners ke active keywords ek saath fetch karo
  // (har target ke liye alag query maarne se better hai)
  const userIds = [...new Set(targets.map((t) => t.userId))];

  const allKeywords = await prisma.monitoredKeyword.findMany({
    where: {
      userId: { in: userIds },
      isActive: true,
    },
  });

  // userId -> [keywords] map banao taaki lookup fast ho
  const keywordsByUser = {};
  for (const kw of allKeywords) {
    if (!keywordsByUser[kw.userId]) keywordsByUser[kw.userId] = [];
    keywordsByUser[kw.userId].push(kw);
  }

  // Step 3: Har target ko process karo, ek-ek karke (sequential — rate limit ke liye)
  for (const target of targets) {
    const channelUsername = extractChannelUsername(target.sourceUrl);

    if (!channelUsername) {
      console.log(`[scanner] Skipping invalid/private target: ${target.sourceUrl}`);
      continue;
    }

    const userKeywords = keywordsByUser[target.userId] || [];
    if (userKeywords.length === 0) {
      // Is user ka koi active keyword nahi hai, scrape karne ka koi fayda nahi
      continue;
    }

    console.log(`[scanner] Scanning channel: ${channelUsername}`);
    const messages = await scrapeChannelMessages(channelUsername);

    // Step 4: Har keyword ko har message ke against check karo
    for (const kw of userKeywords) {
      const matchedMessage = messages.find((msg) =>
        msg.toLowerCase().includes(kw.keyword.toLowerCase())
      );

      if (!matchedMessage) continue;

      const foundUrl = `https://t.me/s/${channelUsername}`;

      // Step 5: Duplicate check — same keyword + same channel combo pehle se hai?
      const existing = await prisma.scanResult.findFirst({
        where: {
          keywordId: kw.id,
          channelName: channelUsername,
        },
      });

      if (existing) {
        // Already record hai, dobara create mat karo
        continue;
      }

      // Step 6: Naya ScanResult create karo
      const scanResult = await prisma.scanResult.create({
        data: {
          userId: target.userId,
          keywordId: kw.id,
          foundUrl,
          channelName: channelUsername,
          messagePreview: matchedMessage.slice(0, 200),
        },
      });

      // Step 7: Usi ke saath linked Alert bhi create karo
      await prisma.alert.create({
        data: {
          scanResultId: scanResult.id,
          userId: target.userId,
          isRead: false,
        },
      });

      console.log(
        `[scanner] MATCH FOUND -> keyword "${kw.keyword}" in channel "${channelUsername}". ScanResult + Alert created.`
      );
    }

    // Step 8: Agle channel se pehle 2 second ruko (rate limiting se bachne ke liye)
    await sleep(2000);
  }

  console.log('[scanner] Scan cycle finished:', new Date().toISOString());
}

// ------------------------------------------------------------------
// Cron job setup — har 30 minute mein scanner chalao
// index.js se startTelegramScanner() call karna hai
// ------------------------------------------------------------------
function startTelegramScanner() {
  console.log('[scanner] Telegram scanner initialized. Will run every 30 minutes.');

  // Cron expression: har 30 minute pe ('*/30 * * * *')
  cron.schedule('*/30 * * * *', () => {
    runScan().catch((err) => {
      console.error('[scanner] Unexpected error during scan cycle:', err);
    });
  });

  // Optional: server start hote hi ek baar turant scan kar lo
  // (agar nahi chahiye to ye line comment kar dena)
  runScan().catch((err) => {
    console.error('[scanner] Unexpected error during initial scan:', err);
  });
}

export default startTelegramScanner;
