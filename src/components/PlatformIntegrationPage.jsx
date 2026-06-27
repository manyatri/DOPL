import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PlatformIntegrationPage({ onBack, onContinue, initialData = {} }) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hostType, setHostType] = useState(initialData.hostType || 'custom-lms');
  const [endpointUrl, setEndpointUrl] = useState(
    initialData.endpointUrl !== undefined ? initialData.endpointUrl : 'https://academy.yourdomain.com/api/v1'
  );

  const handleSubmit = async (e) => 
    {
  e.preventDefault();
  setError('');
  setIsLoading(true);

    try {
    const response = await fetch('https://dopl-backend.onrender.com/api/platform/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ hostType, endpointUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Could not save platform details, try again.');
      setIsLoading(false);
      return;
    }

    onContinue({ hostType, endpointUrl });
    } 
    catch (err) {
      console.error(err);
      setError('Could not reach server. Is the backend running?');
      setIsLoading(false);
    }
  };

  const options = [
    {
      id: 'custom-lms',
      title: 'Custom LMS Application / Webhooks',
      description: 'Direct server-to-server webhook infrastructure architecture',
    },
    {
      id: 'standard-lms',
      title: 'Standard LMS Platforms',
      description: 'Teachable, Thinkific, Classplus, Graphy native plug-ins',
    },
    {
      id: 'video-hosting',
      title: 'Video Hosting Providers Only',
      description: 'Vimeo Enterprise, Wistia, Private YouTube integration paths',
    },
  ];

  return (
    <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="w-full">
        <div className="text-[11px] font-bold tracking-[1.5px] text-brand-muted uppercase mb-2">STEP 2 OF 3</div>
        <h1 className="font-display font-bold text-3xl text-brand-text">Platform Integration Setup</h1>
        <div className="flex gap-2 w-full h-1 mt-4">
          <div className="flex-1 h-full bg-brand-green rounded-[2px]" />
          <div className="flex-1 h-full bg-brand-green rounded-[2px]" />
          <div className="flex-1 h-full bg-[#1c221e] rounded-[2px]" />
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 items-stretch mt-2">
        {/* Left Panel (Diagram & Copy) */}
        <div className="bg-brand-card border border-brand-border rounded-2xl px-8 py-12 md:px-12 flex flex-col justify-between min-h-[520px] relative overflow-hidden backdrop-blur-md">
          {/* Subtle green glow accent in the top corner */}
          <div className="absolute -top-12 -left-12 w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(34,197,94,0.05)_0%,transparent_70%)] pointer-events-none" />

          {/* Visual Diagram */}
          <div className="w-full flex items-center justify-center py-8 relative">
            <div className="flex items-center justify-between w-full max-w-[280px]">
              {/* Left Dot Node */}
              <div className="w-12 h-12 rounded-xl border border-brand-border bg-[#0d120f] flex items-center justify-center relative">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3a443e]" />
              </div>

              {/* Dotted Line */}
              <div className="flex-1 border-t-2 border-dashed border-[#1f2823] mx-1" />

              {/* Center Glowing DOPL API Node */}
              <div className="px-5 py-4 rounded-xl border border-brand-green bg-[#0d1611] shadow-[0_0_20px_rgba(34,197,94,0.15)] flex items-center justify-center z-10">
                <span className="text-brand-green text-[11px] font-bold tracking-wider">DOPL API</span>
              </div>

              {/* Dotted Line */}
              <div className="flex-1 border-t-2 border-dashed border-[#1f2823] mx-1" />

              {/* Right Dot Node */}
              <div className="w-12 h-12 rounded-xl border border-brand-border bg-[#0d120f] flex items-center justify-center relative">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3a443e]" />
              </div>
            </div>
          </div>

          <div className="my-auto">
            <h2 className="font-display font-bold text-3xl md:text-[38px] leading-tight text-brand-text mb-5">
              Connect Your<br />Ecosystem.
            </h2>
            <p className="text-brand-muted-light text-sm md:text-base leading-relaxed max-w-[440px]">
              DOPL seamlessly links with your existing video hosts and learning platforms. No migrations required—just secure, automated security.
            </p>
          </div>

          {/* Spacer to align with step 1 layout height */}
          <div className="h-7 mt-auto" />
        </div>

        {/* Right Panel (Form) */}
        <div className="flex flex-col justify-center">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label className="text-[11px] font-bold tracking-wider text-brand-muted uppercase mb-4">
              Where do you host your premium content?
            </label>

            {/* Hosting Options */}
            <div className="flex flex-col gap-3.5 mb-6">
              {options.map((option) => {
                const isSelected = hostType === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setHostType(option.id)}
                    className={`group cursor-pointer flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-green bg-[#0b1610] shadow-[0_0_15px_rgba(34,197,94,0.06)]'
                        : 'border-[rgba(255,255,255,0.06)] bg-[#0c100e] hover:border-[rgba(255,255,255,0.12)] hover:bg-[#0e1411]'
                    }`}
                  >
                    {/* Radio circle */}
                    <div className="mt-1 flex items-center justify-center">
                      <div
                        className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-brand-green'
                            : 'border-brand-muted group-hover:border-brand-muted-light'
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-green" />}
                      </div>
                    </div>

                    {/* Text block */}
                    <div className="flex flex-col">
                      <span className={`text-[14.5px] font-semibold transition-colors ${
                        isSelected ? 'text-brand-text' : 'text-brand-muted-light group-hover:text-brand-text'
                      }`}>
                        {option.title}
                      </span>
                      <span className="text-[12px] text-brand-muted mt-0.5 leading-normal">
                        {option.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Webhook/URL Input */}
            <div className="flex flex-col mb-8">
              <label className="text-[11px] font-bold tracking-wider text-brand-muted uppercase mb-2" htmlFor="endpoint-url">
                Content Portal URL / API Endpoint
              </label>
              <input
                type="text"
                id="endpoint-url"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3.5 text-brand-text text-[14.5px] outline-none transition duration-200 placeholder-[#4b5550] focus:border-brand-green focus:bg-[#131916] focus:ring-4 focus:ring-[rgba(34,197,94,0.15)]"
                placeholder="https://academy.yourdomain.com/api/v1"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-[12.5px] font-medium mb-4">{error}</div>
            )}

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
                {isLoading ? 'Saving...' : 'Continue to Step 3'}
              </button>
            </div>

            {/* Help link */}
            <div className="text-center mt-6">
              <span className="text-xs text-brand-muted">
                Need help setting up custom webhooks?{' '}
                <a
                  href="#"
                  className="text-brand-green font-semibold no-underline hover:underline hover:text-brand-green-hover transition"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Redirecting to DOPL Webhook integration documentation...');
                  }}
                >
                  Read Documentation.
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
