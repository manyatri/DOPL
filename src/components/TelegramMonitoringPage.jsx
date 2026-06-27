import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TelegramMonitoringPage({ onBack, onFinish, initialData = {} }) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [seedSources, setSeedSources] = useState(
    initialData.seedSources !== undefined
      ? initialData.seedSources
      : `https://t.me/joinchat/pirated_course_group_alpha\nhttps://t.me/free_educational_materials_hub\nexample_competitor_forum_url.com/leaks`
  );
  const [keywords, setKeywords] = useState(
    initialData.keywords !== undefined ? initialData.keywords : 'Advanced Python, Rohan Sharma, Architecture Boot Camp'
  );

  const [scanPublicTelegram, setScanPublicTelegram] = useState(
    initialData.scanPublicTelegram !== undefined ? initialData.scanPublicTelegram : true
  );
  const [scanPrivateLink, setScanPrivateLink] = useState(
    initialData.scanPrivateLink !== undefined ? initialData.scanPrivateLink : true
  );
  const [scanCloudStorage, setScanCloudStorage] = useState(
    initialData.scanCloudStorage !== undefined ? initialData.scanCloudStorage : false
  );

  const handleSubmit = async (e) => {
    setError('');
    e.preventDefault();
    setIsLoading(true);

    try {
      // Seed sources: newline se split, empty lines hatao
      const sourceUrls = seedSources
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Keywords: comma se split, empty entries hatao
      const keywordList = keywords
      .split(',')
       .map((k) => k.trim())
      .filter((k) => k.length > 0);

      // Har scan target ko ek-ek karke save karo (hamesha public_telegram)
      for (const sourceUrl of sourceUrls) {
        const res = await fetch('https://dopl-backend.onrender.com/api/scan-targets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ sourceUrl, sourceType: 'public_telegram' }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to save a scan target.');
          setIsLoading(false);
          return;
        }
      }

        // Har keyword ko ek-ek karke save karo
      for (const keyword of keywordList) {
        const res = await fetch('https://dopl-backend.onrender.com/api/keywords', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ keyword }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to save a keyword.');
          setIsLoading(false);
          return;
        }
      }

      onFinish({
        seedSources,
        keywords,
        scanPublicTelegram,
        scanPrivateLink,
        scanCloudStorage,
      });
    } catch (err) {
      console.error(err);
      setError('Could not reach server. Is the backend running?');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="w-full">
        <div className="text-[11px] font-bold tracking-[1.5px] text-brand-muted uppercase mb-2">STEP 3 OF 3</div>
        <h1 className="font-display font-bold text-3xl text-brand-text">Telegram Monitoring Scope</h1>
        <div className="flex gap-2 w-full h-1 mt-4">
          <div className="flex-1 h-full bg-brand-green rounded-[2px]" />
          <div className="flex-1 h-full bg-brand-green rounded-[2px]" />
          <div className="flex-1 h-full bg-brand-green rounded-[2px]" />
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 items-stretch mt-2">
        {/* Left Panel (Radar Visual & Copy) */}
        <div className="bg-brand-card border border-brand-border rounded-2xl px-8 py-12 md:px-12 flex flex-col justify-between min-h-[520px] relative overflow-hidden backdrop-blur-md">
          {/* Subtle green glow accent in the top corner */}
          <div className="absolute -top-12 -left-12 w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(34,197,94,0.05)_0%,transparent_70%)] pointer-events-none" />

          {/* Animated Radar Visual */}
          <div className="w-full flex items-center justify-center py-6 relative">
            <div className="relative w-44 h-44 rounded-full border border-[rgba(34,197,94,0.15)] flex items-center justify-center bg-[#070e0a] overflow-hidden">
              {/* Concentric rings */}
              <div className="absolute w-32 h-32 rounded-full border border-[rgba(34,197,94,0.1)]" />
              <div className="absolute w-20 h-20 rounded-full border border-[rgba(34,197,94,0.08)]" />
              <div className="absolute w-8 h-8 rounded-full border border-[rgba(34,197,94,0.05)]" />

              {/* Grid lines */}
              <div className="absolute w-full h-[1px] bg-[rgba(34,197,94,0.06)]" />
              <div className="absolute w-[1px] h-full bg-[rgba(34,197,94,0.06)]" />

              {/* Radar sweep rotation */}
              <div className="absolute w-full h-full animate-[spin_4s_linear_infinite] pointer-events-none">
                {/* Visual sweep hand */}
                <div
                  className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
                  style={{
                    background: 'linear-gradient(45deg, rgba(34,197,94,0.2) 0%, transparent 70%)',
                    transform: 'rotate(-90deg)',
                  }}
                />
              </div>

              {/* Blip 1 */}
              <div className="absolute top-[28%] left-[28%] w-2 h-2 bg-brand-green rounded-full shadow-[0_0_8px_#22c55e] animate-pulse" />

              {/* Blip 2 */}
              <div className="absolute bottom-[35%] right-[22%] w-1.5 h-1.5 bg-[#f59e0b] rounded-full shadow-[0_0_8px_#f59e0b] animate-pulse" style={{ animationDelay: '1.2s' }} />

              {/* Blip 3 */}
              <div className="absolute top-[20%] right-[32%] w-2 h-2 bg-brand-green rounded-full shadow-[0_0_8px_#22c55e] animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>

          <div className="my-auto">
            <h2 className="font-display font-bold text-3xl md:text-[38px] leading-tight text-brand-text mb-5">
              Infiltrate Leak<br />Networks.
            </h2>
            <p className="text-brand-muted-light text-sm md:text-base leading-relaxed max-w-[440px]">
              DOPL auto-deploys programmatic userbots into pirated hubs. Seeding known groups triggers deep OSINT crawling across decentralized target layers.
            </p>
          </div>

          {/* Spacer to align with step 1 layout height */}
          <div className="h-7 mt-auto" />
        </div>

        {/* Right Panel (Form) */}
        <div className="flex flex-col justify-center">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* Seed sources */}
            <div className="flex flex-col mb-5">
              <label className="text-[11px] font-bold tracking-wider text-brand-muted uppercase mb-2" htmlFor="seed-sources">
                Seed Leak Sources / Channels (Optional)
              </label>
              <textarea
                id="seed-sources"
                rows="3"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text text-[14.5px] outline-none transition duration-200 placeholder-[#4b5550] focus:border-brand-green focus:bg-[#131916] focus:ring-4 focus:ring-[rgba(34,197,94,0.15)] font-mono resize-none leading-relaxed"
                placeholder="https://t.me/joinchat/your_group"
                value={seedSources}
                onChange={(e) => setSeedSources(e.target.value)}
              />
            </div>

            {/* Core monitoring keywords */}
            <div className="flex flex-col mb-6">
              <label className="text-[11px] font-bold tracking-wider text-brand-muted uppercase mb-2" htmlFor="keywords">
                Core Monitoring Keywords
              </label>
              <input
                type="text"
                id="keywords"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3.5 text-brand-text text-[14.5px] outline-none transition duration-200 placeholder-[#4b5550] focus:border-brand-green focus:bg-[#131916] focus:ring-4 focus:ring-[rgba(34,197,94,0.15)]"
                placeholder="Keywords separated by commas"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-[12.5px] font-medium mb-4">{error}</div>
            )}

            {/* Automated scanning parameters */}
            <div className="flex flex-col mb-8">
              <label className="text-[11px] font-bold tracking-wider text-brand-muted uppercase mb-3.5">
                Automated Scanning Parameters
              </label>

              <div className="flex flex-col gap-3">
                {/* Parameter 1 */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={scanPublicTelegram}
                    onChange={(e) => setScanPublicTelegram(e.target.checked)}
                  />
                  <div
                    className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${
                      scanPublicTelegram
                        ? 'border-brand-green bg-[#14291c]'
                        : 'border-brand-border group-hover:border-brand-muted'
                    }`}
                  >
                    {scanPublicTelegram && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13.5px] font-semibold text-brand-text select-none">
                    Public Telegram Group & Channel Indexers
                  </span>
                </label>

                {/* Parameter 2 */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={scanPrivateLink}
                    onChange={(e) => setScanPrivateLink(e.target.checked)}
                  />
                  <div
                    className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${
                      scanPrivateLink
                        ? 'border-brand-green bg-[#14291c]'
                        : 'border-brand-border group-hover:border-brand-muted'
                    }`}
                  >
                    {scanPrivateLink && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13.5px] font-semibold text-brand-text select-none">
                    Private Link Discovery via Crowdsourced Bounties
                  </span>
                </label>

                {/* Parameter 3 */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={scanCloudStorage}
                    onChange={(e) => setScanCloudStorage(e.target.checked)}
                  />
                  <div
                    className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${
                      scanCloudStorage
                        ? 'border-brand-green bg-[#14291c]'
                        : 'border-brand-border group-hover:border-brand-muted'
                    }`}
                  >
                    {scanCloudStorage && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13.5px] font-semibold text-brand-muted-light group-hover:text-brand-text select-none">
                    Global Cloud Storage Index Matching (Mega, GDrive)
                  </span>
                </label>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 items-center">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 bg-transparent text-brand-text border border-[rgba(255,255,255,0.12)] rounded-lg py-3.5 font-semibold text-sm cursor-pointer hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.25)] active:bg-[rgba(255,255,255,0.05)] transition duration-200 text-center"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-brand-green text-[#06150c] border-none rounded-lg py-3.5 font-bold text-sm cursor-pointer hover:bg-brand-green-hover hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(34,197,94,0.25)] active:scale-100 transition duration-200 text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Initializing...' : 'Finish Setup & Initialize Scrapers'}
              </button>
            </div>

            {/* Footer notice */}
            <div className="text-center mt-6">
              <span className="text-[11.5px] text-brand-muted leading-relaxed">
                By initializing, you authorize userbot nodes to index content matching your criteria.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
