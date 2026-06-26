// Yeh file scan results (jab koi violation/leak detect hota hai) ka logic handle karti hai

import express from 'express';
import prisma from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// ADD SCAN RESULT - Naya violation record karne ke liye
// POST /api/scan-results (protected)
// ============================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { keywordId, foundUrl, channelName, messagePreview } = req.body;

    if (!keywordId || !foundUrl || !channelName) {
      return res.status(400).json({ error: 'keywordId, foundUrl aur channelName zaroori hain' });
    }

    // Confirm karo yeh keyword isi user ka hai
    const keyword = await prisma.monitoredKeyword.findUnique({ where: { id: keywordId } });
    if (!keyword || keyword.userId !== req.userId) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    const result = await prisma.scanResult.create({
      data: {
        userId: req.userId,
        keywordId,
        foundUrl,
        channelName,
        messagePreview: messagePreview || null,
      },
    });

    res.status(201).json({
      message: 'Scan result added',
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// LIST SCAN RESULTS - Sab violations dekhne ke liye
// GET /api/scan-results (protected)
// ============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const results = await prisma.scanResult.findMany({
      where: { userId: req.userId },
      orderBy: { detectedAt: 'desc' },
      include: { keyword: true },
    });

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

// ============================================
// DELETE SCAN RESULT
// DELETE /api/scan-results/:id (protected)
// ============================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.scanResult.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Scan result noy found' });
    }

    await prisma.scanResult.delete({ where: { id } });

    res.json({ message: 'Scan result deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong, try again' });
  }
});

export default router;