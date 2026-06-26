import { useState, useEffect } from 'react';

export default function SuccessPage({ data = {}, onGoToSetup }) {
  const [initStage, setInitStage] = useState(0);

  useEffect(() => {
    // Phase in steps to create a beautiful live initialization effect
    const timers = [
      setTimeout(() => setInitStage(1), 800),
      setTimeout(() => setInitStage(2), 1600),
      setTimeout(() => setInitStage(3), 2400),
      setTimeout(() => setInitStage(4), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative z-10 w-full max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center justify-center text-center min-h-[85vh]">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(34,197,94,0.06)_0%,transparent_75%)] pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full bg-brand-card border border-brand-border rounded-2xl p-8 md:p-12 flex flex-col items-center backdrop-blur-md relative overflow-hidden">
        
        {/* Glow corner */}
        <div className="absolute -top-12 -right-12 w-[120px] h-[120px] bg-[radial-gradient(circle,rgba(34,197,94,0.04)_0%,transparent_70%)] pointer-events-none" />

        {/* Dynamic circular loader or final big checkmark */}
        <div className="mb-8 relative flex items-center justify-center">
          {initStage < 4 ? (
            <div className="w-20 h-20 rounded-full border-[3px] border-[rgba(34,197,94,0.15)] border-t-brand-green animate-spin" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#112417] border border-[rgba(34,197,94,0.3)] flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.25)] animate-[bounce_0.6s_ease-out]">
              <svg className="w-10 h-10 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-3xl text-brand-text mb-3 tracking-wide">
          {initStage < 4 ? 'Deploying Security Nodes...' : 'Scrapers Fully Initialized!'}
        </h1>
        <p className="text-brand-muted text-sm max-w-[480px] leading-relaxed mb-10">
          {initStage < 4 
            ? 'We are setting up your programmatic userbots and linking content protection API credentials.' 
            : 'Your content pipeline is now actively monitored. Anti-piracy scrapers are crawling and tracking seed leak sources.'}
        </p>

        {/* Initialization Steps status list */}
        <div className="w-full max-w-[420px] flex flex-col gap-4 text-left border border-[rgba(255,255,255,0.03)] bg-[#0a0f0d] p-6 rounded-xl mb-10">
          {/* Step 1 */}
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-brand-muted-light font-medium">1. Creator Profile Registered</span>
            {initStage >= 0 ? (
              <span className="text-[12px] font-bold text-brand-green flex items-center gap-1.5">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Done
              </span>
            ) : (
              <span className="text-[12px] font-bold text-brand-muted">Pending</span>
            )}
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-brand-muted-light font-medium">2. Ecosystem Integration Established</span>
            {initStage >= 1 ? (
              <span className="text-[12px] font-bold text-brand-green flex items-center gap-1.5 animate-[fadeIn_0.3s]">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Connected
              </span>
            ) : (
              <span className="text-[12px] font-bold text-brand-muted animate-pulse">Connecting...</span>
            )}
          </div>

          {/* Step 3 */}
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-brand-muted-light font-medium">3. Seed Leak Source Targets Configured</span>
            {initStage >= 2 ? (
              <span className="text-[12px] font-bold text-brand-green flex items-center gap-1.5 animate-[fadeIn_0.3s]">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Targeted
              </span>
            ) : initStage === 1 ? (
              <span className="text-[12px] font-bold text-brand-muted animate-pulse">Targeting...</span>
            ) : (
              <span className="text-[12px] font-bold text-[#323f37]">Waiting</span>
            )}
          </div>

          {/* Step 4 */}
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] text-brand-muted-light font-medium">4. Keywords & Automated Crawlers Active</span>
            {initStage >= 3 ? (
              <span className="text-[12px] font-bold text-brand-green flex items-center gap-1.5 animate-[fadeIn_0.3s]">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Active
              </span>
            ) : initStage === 2 ? (
              <span className="text-[12px] font-bold text-brand-muted animate-pulse">Activating...</span>
            ) : (
              <span className="text-[12px] font-bold text-[#323f37]">Waiting</span>
            )}
          </div>
        </div>

        {/* Configuration Review summary */}
        {initStage >= 4 && (
          <div className="w-full max-w-[420px] mb-8 text-left text-xs bg-[#0b100e] border border-[rgba(255,255,255,0.02)] p-4 rounded-lg flex flex-col gap-2 animate-[fadeIn_0.4s]">
            <div className="text-[10px] font-bold tracking-wider text-brand-muted uppercase mb-1">Configuration Overview</div>
            <div><span className="text-brand-muted">Name:</span> <span className="text-brand-muted-light font-medium">{data.fullName || 'User'}</span></div>
            <div><span className="text-brand-muted">Email:</span> <span className="text-brand-muted-light font-medium">{data.workEmail || 'user@company.com'}</span></div>
            <div><span className="text-brand-muted">Ecosystem Target:</span> <span className="text-brand-muted-light font-bold capitalize">{data.hostType?.replace('-', ' ') || 'Webhooks'}</span></div>
            <div className="truncate"><span className="text-brand-muted">API Endpoint:</span> <span className="text-brand-muted-light font-mono text-[11px]">{data.endpointUrl || 'N/A'}</span></div>
            <div className="truncate"><span className="text-brand-muted">Keywords Tracked:</span> <span className="text-brand-green font-medium">{data.keywords || 'N/A'}</span></div>
          </div>
        )}

        {/* CTA to complete */}
        <button
          type="button"
          onClick={onGoToSetup}
          disabled={initStage < 4}
          className={`w-full max-w-[320px] text-[#06150c] border-none rounded-lg py-4 font-bold text-sm transition duration-200 ${
            initStage >= 4 
              ? 'bg-brand-green hover:bg-brand-green-hover hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(34,197,94,0.25)] cursor-pointer active:scale-100' 
              : 'bg-[#22c55e]/30 text-[#06150c]/50 cursor-not-allowed'
          }`}
        >
          {initStage < 4 ? 'Processing Setup...' : 'Go to Setup'}
        </button>

      </div>
    </div>
  );
}
