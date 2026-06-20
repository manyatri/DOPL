import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CommandCenter({ formData = {}, onLogOut }) {
  const [currentTab, setCurrentTab] = useState('overview'); // 'overview' | 'content-vault' | 'integration-key'
  const { token, user } = useAuth();
  const [keywords, setKeywords] = useState([]);
  const [scanTargets, setScanTargets] = useState([]);
  const [scanResults, setScanResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [copiedLinkIndex, setCopiedLinkIndex] = useState(null);

  // Generate dynamic client integration key based on workspace details inside useState to avoid impurity during render
  const [apiKey] = useState(() => {
    const emailBase = btoa(user?.email || 'creator').substring(0, 16).toLowerCase();
    const randSuffix = Math.random().toString(36).substr(2, 9);
    return `dopl_live_${emailBase}_${randSuffix}`;
  });

  // Parse initials from name
  const name = user?.fullName || formData.fullName || 'User';
  const getInitials = (nameStr) => {
    const parts = nameStr.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(name);

// ← YAHAN ADD KARO useEffect
  useEffect(() => {
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` } ;

    const fetchAll = async () => {
      try {
        const [kwRes, stRes, srRes, alRes] = await Promise.all([
          fetch('http://localhost:5000/api/keywords', { headers }),
          fetch('http://localhost:5000/api/scan-targets', { headers }),
          fetch('http://localhost:5000/api/scan-results', { headers }),
          fetch('http://localhost:5000/api/alerts', { headers }),
        ]);

        const kwData = await kwRes.json();
        const stData = await stRes.json();
        const srData = await srRes.json();
        const alData = await alRes.json();

        if (kwData.keywords) setKeywords(kwData.keywords);
        if (stData.targets) setScanTargets(stData.targets);
        if (srData.scanResults) setScanResults(srData.scanResults);
        if (alData.alerts) setAlerts(alData.alerts);
      } 
      catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchAll();
  }, [token]);

  // Copy API key to clipboard simulation
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleUploadClick = () => {
    const fileName = prompt('Enter a mock asset filename to upload (e.g., Course_Intro.mp4):');
    if (fileName) {
      setUploadedFiles(prev => [...prev, fileName]);
    }
  };

  const handleVaultIngest = () => {
    const assetName = prompt('Enter the video course/asset name to ingest into the vault:', 'physic momentum course');
    if (assetName) {
      setUploadedFiles(prev => [...prev, assetName]);
    }
  };

  const handleOpenLinks = (asset) => {
    setSelectedAsset(asset);
    setShowLinksModal(true);
  };

  const handleCopyLink = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkIndex(index);
    setTimeout(() => setCopiedLinkIndex(null), 2000);
  };

  const mockLectures = (assetName) => {
    const baseSlug = assetName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 5) || 'phy';
    return [
      { id: 1, name: 'Lecture 1', url: `<iframe src="https://embed.dopl.tech/player/${baseSlug}01-1b9d7c2f82e1a5d" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>` },
      { id: 2, name: 'Lecture 2', url: `<iframe src="https://embed.dopl.tech/player/${baseSlug}02-4e2a82910fbd847" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>` },
      { id: 3, name: 'Lecture 3', url: `<iframe src="https://embed.dopl.tech/player/${baseSlug}03-4e3af9802bdcd90" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>` },
      { id: 4, name: 'Lecture 4', url: `<iframe src="https://embed.dopl.tech/player/${baseSlug}04-5b3ac20df71bb48" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>` },
    ];
  };

  return (
    <div className="relative z-10 w-full min-h-screen bg-[#080c0a] text-brand-text flex flex-col md:flex-row items-stretch overflow-hidden">
      
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-[#0c100e] border-b md:border-b-0 md:border-r border-brand-border flex flex-col justify-between py-6 px-4">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 mb-8">
            <div className="w-[30px] h-[30px] rounded-lg border-2 border-brand-green bg-[#0d1611] flex items-center justify-center shadow-[0_0_8px_rgba(34,197,94,0.15)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h4a8 8 0 0 1 0 16H6z" />
              </svg>
            </div>
            <span className="font-display font-bold text-[18px] tracking-[0.5px] text-brand-text">DOPL</span>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1">
            {/* Overview */}
            <button
              onClick={() => setCurrentTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'overview'
                  ? 'text-brand-green bg-[#131e17]/50'
                  : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {currentTab === 'overview' && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />
              )}
              Overview
            </button>

            {/* Content Vault */}
            <button
              onClick={() => setCurrentTab('content-vault')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'content-vault'
                  ? 'text-brand-green bg-[#131e17]/50'
                  : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {currentTab === 'content-vault' && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />
              )}
              Content Vault
            </button>

            {/* Triage Alerts */}
            <button
              onClick={() => {
                const unreadAlerts = alerts.filter(a => !a.isRead);
                if (unreadAlerts.length === 0) {
                  alert('No triage alerts detected. All pipelines secure.');
                } else {
                  const summary = unreadAlerts
                    .map(a => `• ${a.scanResult?.channelName || 'Unknown channel'} — ${a.scanResult?.messagePreview || 'No preview'}`)
                    .join('\n');
                  alert(`${unreadAlerts.length} triage alert(s) detected:\n\n${summary}`);
                }
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)] text-left transition-all"
            >
              <span>Triage Alerts</span>
              <span className="bg-[#19211c] text-brand-muted border border-brand-border px-2 py-0.5 rounded-full text-[10px]">
                {alerts.length}
              </span>
            </button>

            {/* Automated Action */}
            <button
              onClick={() => alert('Automated mitigation rules are active.')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)] text-left transition-all"
            >
              Automated Actions
            </button>

            {/* Integration Key */}
            <button
              onClick={() => setCurrentTab('integration-key')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'integration-key'
                  ? 'text-brand-green bg-[#131e17]/50'
                  : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {currentTab === 'integration-key' && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />
              )}
              Integration Key
            </button>

            {/* Proof Generator */}
            <button
              onClick={() => alert('Proof Generator is active. Uploaded assets will populate cryptographic hashes here.')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)] text-left transition-all"
            >
              Proof Generator
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="mt-8 pt-4 border-t border-brand-border flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            {/* Initials avatar bubble */}
            <div className="w-9 h-9 rounded-full bg-[#1c221e] border border-brand-border flex items-center justify-center text-[12px] font-bold text-brand-green">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-brand-text max-w-[120px] truncate">{name}</span>
              <span className="text-[10px] text-brand-muted font-medium">Free Trial</span>
            </div>
          </div>

          {/* Log Out option */}
          <button 
            onClick={onLogOut}
            className="text-brand-muted hover:text-red-400 transition p-1"
            title="Log Out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Tab 1: Overview Dashboard */}
        {currentTab === 'overview' && (
          <div className="flex flex-col gap-8 text-left">
            
            {/* Header row */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 w-full">
              <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide">Command Center</h2>
              
              {/* Standby/Active Status badge */}
              <div className="self-start sm:self-auto flex items-center gap-2 bg-[#101412] border border-brand-border px-3.5 py-1.5 rounded-full text-xs text-brand-muted">
                <div className={`w-2 h-2 rounded-full ${uploadedFiles.length > 0 ? 'bg-brand-green animate-pulse' : 'bg-[#5c7063]'}`} />
                <span>{uploadedFiles.length > 0 ? 'Scrapers Active' : 'Scrapers on Standby'}</span>
              </div>
            </div>

            {/* Grid stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Protected */}
              <div className="bg-[#0b100d] border border-brand-border rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Total Protected</span>
                <div className="flex flex-col mt-2">
                  <span className="text-xl font-bold text-brand-text">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'} Secure
                  </span>
                  <span className="text-[11px] text-brand-muted mt-1">
                    {uploadedFiles.length > 0 ? 'Ingested & secured' : 'No assets uploaded yet'}
                  </span>
                </div>
              </div>

              {/* Card 2: Leaks */}
              <div className="bg-[#0b100d] border border-brand-border rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Live Leaks Found</span>
                <div className="flex flex-col mt-2">
                  <span className="text-xl font-bold text-brand-text">{scanResults.length} Locations</span>
                  <span className="text-[11px] text-brand-muted mt-1">
                    {scanResults.length > 0 ? 'Active leaks detected' : 'No leaks detected yet'}
                  </span>
                </div>
              </div>

              {/* Card 3: Account Banned */}
              <div className="bg-[#0b100d] border border-brand-border rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Account Banned</span>
                <div className="flex flex-col mt-2">
                  <span className="text-xl font-bold text-brand-text">0</span>
                  <span className="text-[11px] text-brand-muted mt-1">No actions triggered yet</span>
                </div>
              </div>

              {/* Card 4: Revenue Risk */}
              <div className="bg-[#0b100d] border border-brand-border rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Estimated Revenue Risk</span>
                <div className="flex flex-col mt-2">
                  <span className="text-xl font-bold text-brand-text">₹0</span>
                  <span className="text-[11px] text-brand-muted mt-1">
                    {uploadedFiles.length > 0 ? 'Protected assets secure' : 'Monitoring pipelines inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pipeline and Telemetry layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 mt-2 items-stretch">
              
              {/* Left Column (Asset Pipeline Upload Card) */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-md min-h-[380px]">
                
                {/* Upload status view */}
                {uploadedFiles.length > 0 ? (
                  <div className="w-full flex flex-col text-left justify-start h-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-brand-text tracking-wide">Ingested Assets</h3>
                      <button 
                        onClick={handleUploadClick}
                        className="text-xs text-brand-green hover:underline flex items-center gap-1 font-semibold"
                      >
                        + Add Asset
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[260px] pr-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-[#0a100d] border border-brand-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#112417] flex items-center justify-center text-brand-green font-bold text-xs">
                              {file.split('.').pop()?.toUpperCase().substring(0, 3) || 'CORE'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-brand-text">{file}</span>
                              <span className="text-[10px] text-brand-muted mt-0.5">SHA256: dopl_sh256_... Ingested</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-brand-green bg-[#122b1a] border border-[#22c55e]/20 px-2.5 py-0.5 rounded-full">
                            Secured
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Empty Pipeline card */}
                    <div 
                      onClick={handleUploadClick}
                      className="w-14 h-14 border border-brand-green/30 rounded-xl flex items-center justify-center transform rotate-45 bg-[#0c1611] mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)] cursor-pointer hover:border-brand-green hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition duration-200"
                    >
                      <span className="transform -rotate-45 text-brand-green text-3xl font-light">+</span>
                    </div>

                    <h3 className="font-display font-semibold text-lg text-brand-text mb-2 tracking-wide">
                      Your Monitoring Pipeline is Empty
                    </h3>
                    
                    <p className="text-brand-muted text-xs max-w-sm leading-relaxed mb-6">
                      Before our autonomous agents can scour decentralized platforms, you must upload your primary files to establish structural signatures.
                    </p>

                    <button 
                      onClick={handleUploadClick}
                      className="bg-brand-green text-[#06150c] border-none rounded-lg px-6 py-3 font-bold text-xs cursor-pointer hover:bg-brand-green-hover hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(34,197,94,0.25)] active:scale-100 transition duration-200"
                    >
                      Upload Your First Asset
                    </button>
                  </>
                )}
              </div>

              {/* Right Column (AI Telemetry Log) */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md min-h-[380px]">
                <div>
                  <h3 className="text-[12px] font-bold text-brand-text tracking-wide mb-4">AI Agent Telemetry</h3>
                  
                  {/* Console Logs */}
                  <div className="bg-[#050806] border border-brand-border rounded-xl p-4 font-mono text-[11px] leading-relaxed text-[#5c7063] flex flex-col justify-start min-h-[220px]">
                    <div className="mb-2"><span className="text-[#3a4d40]">[15:11:55]</span> <span className="text-brand-text">SYS_IDLE</span></div>
                    <div className="mb-3 pl-4">Awaiting core data payload...</div>
                    
                    <div className="mb-2"><span className="text-[#3a4d40]">[15:11:55]</span> <span className="text-brand-text">INDEX_VOID</span></div>
                    <div className="mb-3 pl-4">0 target hashes registered</div>
                    
                    <div className="mb-2"><span className="text-[#3a4d40]">[15:11:55]</span> <span className="text-[#22c55e]">CRAWL_HALT</span></div>
                    <div className="mb-3 pl-4">Scrapers holding position...</div>
                    <div className="mb-4 pl-4 text-brand-green">&gt; Pipeline ready for injection</div>

                    {uploadedFiles.length > 0 ? (
                      <>
                        <div className="mb-2 animate-[fadeIn_0.3s]"><span className="text-[#3a4d40]">[15:13:02]</span> <span className="text-[#38bdf8]">FILE_INGEST</span></div>
                        <div className="mb-3 pl-4 text-brand-text animate-[fadeIn_0.3s]">{uploadedFiles[uploadedFiles.length - 1]} ingested successfully.</div>
                        <div className="mb-2 animate-[fadeIn_0.3s]"><span className="text-[#3a4d40]">[15:13:03]</span> <span className="text-[#22c55e]">CRAWL_RUN</span></div>
                        <div className="pl-4 text-brand-green animate-[fadeIn_0.3s]">&gt; Scraping channels... Active</div>
                      </>
                    ) : (
                      <div className="text-brand-green animate-pulse">Awaiting asset... █</div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-brand-muted mt-4 text-center leading-normal">
                  Monitoring <strong>{keywords.length}</strong> keywords across <strong>{scanTargets.length}</strong> public Telegram targets.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Content Vault Panel */}
        {currentTab === 'content-vault' && (
          <div className="flex flex-col gap-8 text-left animate-[fadeIn_0.3s]">
            <div>
              <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide mb-1">Content Vault</h2>
              <p className="text-brand-muted text-xs leading-relaxed">
                Ingest assets, embed structural neural watermarks, and manage digital core signatures.
              </p>
            </div>

            {/* Top row: Dropzone and Setup Config cards */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-stretch">
              
              {/* Ingestion Dropzone */}
              <div 
                onClick={handleVaultIngest}
                className="border-2 border-dashed border-[#22c55e]/30 bg-[#070c09]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-green hover:bg-[#0c1611]/30 transition duration-200 min-h-[160px]"
              >
                <svg className="w-8 h-8 text-brand-green mb-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-[14px] font-semibold text-brand-text">
                  {uploadedFiles.length > 0 ? 'Click to browse or drag more video files here' : 'Click to browse or drag video files here'}
                </span>
                <span className="text-[11px] text-brand-muted mt-1.5 max-w-sm">
                  {uploadedFiles.length > 0 
                    ? 'Add supplementary modules or lectures. Supports MP4, MKV, MOV up to 15GB.' 
                    : 'Upload files to initiate spatial-temporal fingerprint sequencing. Supports MP4, MKV, MOV up to 15GB.'}
                </span>
              </div>

              {/* Neural Setup Config Card */}
              <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col justify-between text-xs">
                <div>
                  <div className="text-[9px] font-bold tracking-wider text-brand-muted uppercase mb-3.5">Neural Fingerprint Setup</div>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-brand-muted-light">Spatial Mask Robustness</span>
                      <span className={uploadedFiles.length > 0 ? 'text-brand-green font-bold' : 'text-brand-muted'}>Ready</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-brand-muted-light">Temporal Frame Spreading</span>
                      <span className={uploadedFiles.length > 0 ? 'text-brand-green font-bold' : 'text-brand-muted'}>Ready</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-brand-border mt-3.5 pt-3 flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${uploadedFiles.length > 0 ? 'bg-brand-green animate-pulse' : 'bg-[#5c7063]'}`} />
                  <span className={`text-[11px] font-semibold ${uploadedFiles.length > 0 ? 'text-brand-green' : 'text-brand-muted'}`}>
                    {uploadedFiles.length > 0 ? 'A.I. Watermark Engine: Active' : 'A.I. Watermark Engine: Standby'}
                  </span>
                </div>
              </div>
            </div>

            {/* Workspace Assets Table card */}
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col w-full min-h-[300px] justify-between">
              
              <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-brand-text tracking-wide">Protected Directory Workspace</h3>
                  <button 
                    onClick={() => alert('Filtering tools are inactive in this sandbox.')}
                    className="border border-[rgba(255,255,255,0.08)] bg-transparent text-brand-text px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[rgba(255,255,255,0.02)] transition active:scale-95"
                  >
                    Filter Assets
                  </button>
                </div>

                {/* Main Table Area */}
                {uploadedFiles.length === 0 ? (
                  /* Empty state layout */
                  <div className="flex flex-col items-center justify-center text-center py-14">
                    <div className="w-16 h-16 border border-brand-border rounded-xl flex items-center justify-center bg-[#070b09] mb-5">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a443e" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>

                    <h4 className="text-[14px] font-semibold text-brand-text mb-1.5">No Fingerprinted Assets Found</h4>
                    <p className="text-[11.5px] text-brand-muted max-w-sm leading-relaxed">
                      Your registered asset index is blank. Use the dropzone above to generate unique cryptographic trackable cores.
                    </p>
                  </div>
                ) : (
                  /* Ingested assets table list */
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border text-[9px] font-bold text-brand-muted uppercase tracking-wider">
                          <th className="pb-3.5 font-bold">Asset Name / Metadata</th>
                          <th className="pb-3.5 font-bold">Cryptographic Fingerprint</th>
                          <th className="pb-3.5 font-bold">Watermark</th>
                          <th className="pb-3.5 font-bold">Monitoring</th>
                          <th className="pb-3.5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                        {uploadedFiles.map((asset, index) => (
                          <tr key={index} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-brand-text text-[13px]">{asset}</span>
                                <span className="text-[10px] text-brand-muted mt-0.5">Video Bundle (42 files) • 14.2 GB</span>
                              </div>
                            </td>
                            <td className="py-4 font-mono text-brand-green font-semibold text-[11.5px]">
                              dopl_sh256_8f3c9b1a4e72
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-brand-text">3-Step Flow</span>
                                <span className="text-[10px] text-brand-muted mt-0.5">Buyers Linked</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="flex items-center gap-2 font-semibold text-brand-green text-[12px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                                Scanning
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenLinks(asset)}
                                className="bg-brand-green text-[#06150c] font-bold px-4 py-2 rounded-lg text-xs hover:bg-brand-green-hover hover:scale-[1.01] transition active:scale-95 cursor-pointer shadow-[0_2px_8px_rgba(34,197,94,0.15)]"
                              >
                                Get Links
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Ingestion Matrix Footer info */}
              <div className="border-t border-brand-border mt-6 pt-4 text-[10.5px] text-brand-muted">
                {uploadedFiles.length} {uploadedFiles.length === 1 ? 'primary asset core' : 'primary asset cores'} registered under active programmatic tracking matrix
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Integration Key Manager */}
        {currentTab === 'integration-key' && (
          <div className="flex flex-col gap-8 max-w-[700px] text-left animate-[fadeIn_0.3s]">
            <div>
              <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide mb-1">API Integrations</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Configure your server credentials to automatically register content assets and query piracy leak reports.
              </p>
            </div>

            {/* API Key Box */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col gap-4">
              <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Your Client API Key</span>
              
              <div className="flex items-center justify-between bg-[#070b09] border border-brand-border rounded-lg p-3 w-full">
                <code className="text-brand-green text-xs font-mono select-all break-all pr-4">
                  {apiKey}
                </code>
                
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="flex-shrink-0 bg-[#122b1a] border border-[#22c55e]/25 text-brand-green px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer hover:bg-brand-green hover:text-[#06150c] transition active:scale-95"
                >
                  {copiedKey ? 'Copied!' : 'Copy Key'}
                </button>
              </div>

              <div className="text-[11.5px] text-brand-muted leading-relaxed">
                Keep this key highly secret. Anyone possessing it can upload core files and view vulnerability leak logs on your domain.
              </div>
            </div>

            {/* Setup instructions block */}
            <div className="flex flex-col gap-4 bg-[#0a0f0d] border border-[rgba(255,255,255,0.02)] p-6 rounded-xl">
              <h3 className="text-sm font-bold text-brand-text tracking-wide">Developer Integration Guidelines</h3>
              
              <div className="flex flex-col gap-3 text-xs text-brand-muted-light leading-relaxed">
                <div>
                  <strong>1. Register Assets programmatically:</strong>
                  <pre className="bg-[#050806] border border-brand-border text-brand-muted p-3 rounded-lg font-mono text-[10.5px] mt-1.5 overflow-x-auto">
                    {`curl -X POST "https://api.dopl.org/v1/assets" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "file=@/path/to/content.mp4"`}
                  </pre>
                </div>

                <div className="mt-2">
                  <strong>2. Webhook payload verification:</strong>
                  <p className="mt-1">
                    Incoming notification webhooks sent from DOPL are signed with a digital HMAC signature using your integration key as the secret key. Verify signatures using SHA256 hashes to guarantee provenance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Integration Links Modal popup */}
      {showLinksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]">
          <div className="w-full max-w-[520px] bg-[#0c100e] border border-brand-border rounded-2xl p-6 shadow-2xl relative text-left animate-[scaleIn_0.2s_ease-out]">
            
            {/* Close X icon */}
            <button
              onClick={() => setShowLinksModal(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-text transition cursor-pointer p-1"
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Headings */}
            <h3 className="font-display font-bold text-xl text-brand-text tracking-wide mb-1">Integration Links</h3>
            <p className="text-[12px] font-semibold text-brand-green tracking-wide truncate mb-5">
              {selectedAsset} - Embed Links
            </p>

            {/* Scrollable list */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1.5 scrollbar-thin">
              {mockLectures(selectedAsset).map((lecture, index) => (
                <div key={lecture.id} className="flex flex-col w-full">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                    {lecture.name}:
                  </span>
                  
                  <div className="flex items-center justify-between bg-[#050806] border border-brand-border rounded-lg p-2.5 w-full">
                    <code className="text-brand-green text-[10.5px] font-mono select-all truncate pr-3 max-w-[340px]">
                      {lecture.url}
                    </code>
                    
                    <button
                      type="button"
                      onClick={() => handleCopyLink(lecture.url, index)}
                      className="flex-shrink-0 text-brand-green hover:text-brand-green-hover text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      {copiedLinkIndex === index ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Close CTA at the bottom */}
            <div className="mt-6 pt-4 border-t border-brand-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowLinksModal(false)}
                className="bg-brand-green text-[#06150c] font-bold px-6 py-2.5 rounded-lg text-xs hover:bg-brand-green-hover transition cursor-pointer font-sans"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
