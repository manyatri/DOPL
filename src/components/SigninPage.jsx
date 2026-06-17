import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SigninPage({ setView, onLoginSuccess }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed, try again.');
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
      onLoginSuccess({
        fullName: data.user.fullName,
        workEmail: data.user.email,
      });
    } catch (err) {
      console.error(err);
      setError('Could not reach server. Is the backend running?');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[480px] mx-auto px-6 py-12 flex flex-col justify-center items-center min-h-[85vh]">
      
      {/* Glow highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(34,197,94,0.04)_0%,transparent_75%)] pointer-events-none -z-10" />

      {/* Main card box */}
      <div className="w-full bg-brand-card border border-brand-border rounded-2xl p-8 flex flex-col items-center backdrop-blur-md shadow-lg relative">
        {/* Subtle green glow accent in the top corner */}
        <div className="absolute -top-12 -left-12 w-[120px] h-[120px] bg-[radial-gradient(circle,rgba(34,197,94,0.03)_0%,transparent_70%)] pointer-events-none" />

        {/* Logo Shield */}
        <div className="w-12 h-12 rounded-xl border-2 border-brand-green flex items-center justify-center mb-4 bg-[#0a0f0c] shadow-[0_0_12px_rgba(34,197,94,0.1)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h4a8 8 0 0 1 0 16H6z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-2xl text-brand-text mb-1.5 tracking-wide text-center">Welcome Back</h1>
        <p className="text-brand-muted text-[12px] mb-8 text-center leading-relaxed">
          Enter your credentials to access the command center
        </p>

        {/* Form */}
        <form className="w-full flex flex-col" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="flex flex-col mb-4">
            <label className="text-[10px] font-bold tracking-wider text-brand-muted uppercase mb-2" htmlFor="login-email">
              Email Address
            </label>
            <input 
              type="email" 
              id="login-email" 
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text text-[14px] outline-none transition duration-200 placeholder-[#4b5550] focus:border-brand-green focus:bg-[#131916] focus:ring-4 focus:ring-[rgba(34,197,94,0.15)]"
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col mb-5">
            <label className="text-[10px] font-bold tracking-wider text-brand-muted uppercase mb-2" htmlFor="login-password">
              Password
            </label>
            <div className="relative w-full">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="login-password" 
                className="w-full bg-brand-bg border border-brand-border rounded-lg pl-4 pr-11 py-3 text-brand-text text-[14px] outline-none transition duration-200 placeholder-[#4b5550] focus:border-brand-green focus:bg-[#131916] focus:ring-4 focus:ring-[rgba(34,197,94,0.15)]"
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              
              {/* Show/Hide eye button */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition cursor-pointer p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex justify-between items-center w-full mb-6">
            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <div 
                className={`w-[17px] h-[17px] rounded border flex items-center justify-center transition-all ${
                  rememberMe 
                    ? 'border-brand-green bg-[#14291c]' 
                    : 'border-brand-border group-hover:border-brand-muted'
                }`}
              >
                {rememberMe && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-[12.5px] font-medium text-brand-muted group-hover:text-brand-text select-none transition-colors">
                Remember me
              </span>
            </label>

            {/* Forgot Password */}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert("Redirecting to password reset flow..."); }}
              className="text-[12.5px] font-semibold text-brand-green hover:underline hover:text-brand-green-hover transition-colors"
            >
              Forgot Password?
            </a>
          </div>
          
          {error && (
            <div className="text-red-500 text-[12.5px] font-medium mb-4">{error}</div>
          )}

          {/* Sign In CTA */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-green text-[#06150c] border-none rounded-lg py-3.5 font-bold text-sm cursor-pointer hover:bg-brand-green-hover hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(34,197,94,0.25)] active:scale-100 transition duration-200 text-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="flex items-center text-center text-[#4b5550] text-[10px] font-semibold my-6 uppercase before:content-[''] before:flex-1 before:border-b before:border-brand-border before:mr-4 after:content-[''] after:flex-1 after:border-b after:border-brand-border after:ml-4">
            or continue with
          </div>

          {/* Google SSO */}
          <button 
            type="button" 
            className="flex items-center justify-center gap-2.5 bg-transparent text-brand-text border border-[rgba(255,255,255,0.12)] rounded-lg py-3 font-semibold text-[13.5px] cursor-pointer hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.25)] active:bg-[rgba(255,255,255,0.05)] transition duration-200 w-full"
            onClick={() => alert("Redirecting to Google Workspace authentication portal...")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.56-5.17 3.56-8.56z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.32 14.24A7.16 7.16 0 0 1 5 12c0-.79.13-1.57.32-2.34V6.51H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.49l4.11-3.25z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.49l4.11 3.25c.94-2.85 3.57-4.99 6.68-4.99z"/>
            </svg>
            Sign In with Google Workspace
          </button>
        </form>
      </div>

      {/* Footer redirection link */}
      <div className="text-center text-xs text-brand-muted mt-6">
        New to the platform?{' '}
        <a 
          href="#" 
          className="text-brand-green no-underline font-semibold ml-1 hover:underline hover:text-brand-green-hover transition"
          onClick={(e) => { e.preventDefault(); setView('signup'); }}
        >
          Create an account here.
        </a>
      </div>
    </div>
  );
}
