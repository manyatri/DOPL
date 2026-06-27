import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage({ setView, onContinue, initialData = {} }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [workEmail, setWorkEmail] = useState(initialData.workEmail || '');
  const [password, setPassword] = useState(initialData.password || 'doplcreator');

  // Password strength check
  const getPasswordStrength = (val) => {
    if (!val) {
      return {
        score: 0,
        text: "Password must include 1 special character and 8+ digits.",
        colorClass: "text-brand-muted"
      };
    }
    
    let score = 0;
    if (val.length >= 8) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[A-Z]/.test(val) || /[a-z]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    const hasSpecial = /[^A-Za-z0-9]/.test(val);
    const hasLength = val.length >= 8;

    if (!hasSpecial || !hasLength) {
      return {
        score: 1, // Cap score at 1 if critical requirements are not met
        text: "Password must include 1 special character and 8+ digits.",
        colorClass: "text-brand-warning"
      };
    }

    if (score === 3) {
      return {
        score: 3,
        text: "Strong password.",
        colorClass: "text-brand-green"
      };
    } else if (score >= 4) {
      return {
        score: 4,
        text: "Excellent secure password.",
        colorClass: "text-brand-green"
      };
    } else {
      return {
        score: 2,
        text: "Good password, but could be stronger.",
        colorClass: "text-yellow-500"
      };
    }
  };

  const { score, text, colorClass } = getPasswordStrength(password);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const response = await fetch('https://dopl-backend.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email: workEmail, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Signup failed, try again.');
      setIsLoading(false);
      return;
    }

    login(data.token, data.user);
    onContinue({ fullName, workEmail, password });
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
        <div className="text-[11px] font-bold tracking-[1.5px] text-brand-muted uppercase mb-2">STEP 1 OF 3</div>
        <h1 className="font-display font-bold text-3xl text-brand-text">Creator Profile Setup</h1>
        <div className="flex gap-2 w-full h-1 mt-4">
          <div className="flex-1 h-full bg-brand-green rounded-[2px]" />
          <div className="flex-1 h-full bg-[#1c221e] rounded-[2px]" />
          <div className="flex-1 h-full bg-[#1c221e] rounded-[2px]" />
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 items-stretch mt-2">
        
        {/* Left Panel (Social Proof) */}
        <div className="bg-brand-card border border-brand-border rounded-2xl px-8 py-14 md:px-12 flex flex-col justify-between min-h-[520px] relative overflow-hidden backdrop-blur-md">
          {/* Subtle green glow accent in the top corner */}
          <div className="absolute -top-12 -left-12 w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(34,197,94,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="my-auto">
            <h2 className="font-display font-bold text-3xl md:text-[38px] leading-tight text-brand-text mb-5">
              Defend Your<br />Digital Livelihood.
            </h2>
            <p className="text-brand-muted-light text-sm md:text-base leading-relaxed max-w-[440px]">
              Join over 5,000+ independent educators, developers, and studios securing their revenue pipelines from automated piracy leakage.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full border-2 border-[#141916] bg-gradient-to-br from-[#1b2621] to-[#0f1613] shadow-md z-30" />
              <div className="w-7 h-7 rounded-full border-2 border-[#141916] bg-gradient-to-br from-[#2c3c34] to-[#1b2621] shadow-md -ml-2.5 z-20" />
              <div className="w-7 h-7 rounded-full border-2 border-[#141916] bg-gradient-to-br from-[#3d5448] to-[#26382f] shadow-md -ml-2.5 z-10" />
            </div>
            <span className="text-[13.5px] font-semibold text-brand-green tracking-[0.2px]">
              Protected ₹4.2Cr in assets this month.
            </span>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="flex flex-col justify-center">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div className="flex flex-col mb-5">
              <label className="text-[11px] font-bold tracking-wider text-brand-muted uppercase mb-2" htmlFor="full-name">
                Full Name
              </label>
              <input 
                type="text" 
                id="full-name" 
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3.5 text-brand-text text-[14.5px] outline-none transition duration-200 placeholder-[#4b5550] focus:border-brand-green focus:bg-[#131916] focus:ring-4 focus:ring-[rgba(34,197,94,0.15)]"
                placeholder="e.g., Rohan Sharma" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            {/* Work Email */}
            <div className="flex flex-col mb-5">
              <label className="text-[11px] font-bold tracking-wider text-brand-muted uppercase mb-2" htmlFor="work-email">
                Work Email
              </label>
              <input 
                type="email" 
                id="work-email" 
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3.5 text-brand-text text-[14.5px] outline-none transition duration-200 placeholder-[#4b5550] focus:border-brand-green focus:bg-[#131916] focus:ring-4 focus:ring-[rgba(34,197,94,0.15)]"
                placeholder="you@company.com" 
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col mb-5">
              <label className="text-[11px] font-bold tracking-wider text-brand-muted uppercase mb-2" htmlFor="password">
                Password
              </label>
              <input 
                type="password" 
                id="password" 
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3.5 text-brand-text text-[14.5px] outline-none transition duration-200 placeholder-[#4b5550] focus:border-brand-green focus:bg-[#131916] focus:ring-4 focus:ring-[rgba(34,197,94,0.15)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              
              {/* Password Strength Meter */}
              <div className="flex flex-col mt-2">
                <div className="flex gap-1.5 w-full h-1 mb-2">
                  <div className={`flex-1 h-full rounded-[2px] transition-colors duration-300 ${
                    score >= 1 ? (score === 1 ? 'bg-brand-warning' : score === 2 ? 'bg-yellow-500' : 'bg-brand-green') : 'bg-[#1c221e]'
                  }`} />
                  <div className={`flex-1 h-full rounded-[2px] transition-colors duration-300 ${
                    score >= 2 ? (score === 2 ? 'bg-yellow-500' : 'bg-brand-green') : 'bg-[#1c221e]'
                  }`} />
                  <div className={`flex-1 h-full rounded-[2px] transition-colors duration-300 ${
                    score >= 3 ? 'bg-brand-green' : 'bg-[#1c221e]'
                  }`} />
                  <div className={`flex-1 h-full rounded-[2px] transition-colors duration-300 ${
                    score >= 4 ? 'bg-brand-green' : 'bg-[#1c221e]'
                  }`} />
                </div>
                <div className={`text-[11.5px] font-medium flex items-center gap-1 transition-colors duration-300 ${colorClass}`}>
                  {text}
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-[12.5px] font-medium mb-3">{error}</div>
            )}

            
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-brand-green text-[#06150c] border-none rounded-lg py-4 font-bold text-sm cursor-pointer hover:bg-brand-green-hover hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(34,197,94,0.25)] active:scale-100 transition duration-200 mt-2.5 text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
              </button>

            {/* Divider */}
            <div className="flex items-center text-center text-[#4b5550] text-[11px] font-semibold my-6 uppercase before:content-[''] before:flex-1 before:border-b before:border-brand-border before:mr-4 after:content-[''] after:flex-1 after:border-b after:border-brand-border after:ml-4">
              or register via
            </div>

            {/* Google Workspace */}
            <button 
              type="button" 
              className="flex items-center justify-center gap-2.5 bg-transparent text-brand-text border border-[rgba(255,255,255,0.12)] rounded-lg py-3.5 font-semibold text-sm cursor-pointer hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.25)] active:bg-[rgba(255,255,255,0.05)] transition duration-200"
              onClick={() => alert("Redirecting to Google Workspace authentication portal...")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.56-5.17 3.56-8.56z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.32 14.24A7.16 7.16 0 0 1 5 12c0-.79.13-1.57.32-2.34V6.51H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.49l4.11-3.25z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.49l4.11 3.25c.94-2.85 3.57-4.99 6.68-4.99z"/>
              </svg>
              Sign Up with Google Workspace
            </button>

            {/* Footer link */}
            <div className="text-center text-xs text-brand-muted mt-6">
              Already have a DOPL account?
              <a 
                href="#" 
                className="text-brand-green no-underline font-semibold ml-1 hover:underline hover:text-brand-green-hover transition"
                onClick={(e) => { e.preventDefault(); setView('signin'); }}
              >
                Sign In.
              </a>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
