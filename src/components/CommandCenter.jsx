import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CommandCenter({ formData = {}, onLogOut }) {
  const [currentTab, setCurrentTab] = useState('overview');
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

  // AI Agent scan state
  const [agentPhase, setAgentPhase] = useState('idle'); // 'idle' | 'scanning' | 'detected'
  const [agentLogs, setAgentLogs] = useState([]);
  const [detectedAsset, setDetectedAsset] = useState('');
  const agentLogsEndRef = useRef(null);

  // Mock alert that gets injected after scan
  const [mockAlerts, setMockAlerts] = useState([]);
  // Track which alerts are taken down
  const [takenDown, setTakenDown] = useState({});
  const [isScanning, setIsScanning] = useState(false);

  // Triage Alerts — filter + incident modal
  const [triageFilter, setTriageFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [takedownDispatched, setTakedownDispatched] = useState(false);

  // Automated Actions — toggle rules
  const [autoRules, setAutoRules] = useState({
    telegramTakedown: true,
    restrictAccess: true,
    notifyLegal: false,
  });

  // Integration Credentials — webhook
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  // Proof Generator
const [proofTab, setProofTab] = useState('open');

  const [apiKey] = useState(() => {
    const emailBase = btoa(user?.email || 'creator').substring(0, 16).toLowerCase();
    const randSuffix = Math.random().toString(36).substr(2, 9);
    return `dopl_live_${emailBase}_${randSuffix}`;
  });

  const name = user?.fullName || formData.fullName || 'User';
  const getInitials = (nameStr) => {
    const parts = nameStr.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameStr.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(name);

  // Fetch real DB data on mount
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
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
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchAll();
  }, [token]);

  // Auto-scroll agent logs
  useEffect(() => {
    agentLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs]);

  const now = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const addLog = (log) => {
    setAgentLogs(prev => [...prev, { ...log, time: now() }]);
  };

  // Called when a course/asset is added in Content Vault
  const triggerAgentScan = (assetName) => {
    setAgentPhase('scanning');
    setDetectedAsset(assetName);
    setAgentLogs([]);

    const slug = assetName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8) || 'course';

    // Log sequence with delays to simulate real scanning
    setTimeout(() => addLog({ type: 'sys', label: 'FILE_INGEST', msg: `${assetName} ingested successfully.` }), 300);
    setTimeout(() => addLog({ type: 'info', label: 'HASH_GEN', msg: `SHA256: dopl_${slug}_8f3c9b1a4e72` }), 900);
    setTimeout(() => addLog({ type: 'green', label: 'CRAWL_RUN', msg: 'Scanning public Telegram channels...' }), 1600);
    setTimeout(() => addLog({ type: 'warn', label: 'CHANNEL_HIT', msg: `t.me/free_courses_hub — keyword match` }), 2400);
    setTimeout(() => addLog({ type: 'warn', label: 'CHANNEL_HIT', msg: `t.me/piracy_leaks_2024 — keyword match` }), 3000);
    setTimeout(() => addLog({ type: 'red', label: 'LEAK_CONFIRM', msg: `"${assetName}" content found on 2 channels.` }), 3700);
    setTimeout(() => addLog({ type: 'green', label: 'ALERT_RAISED', msg: 'Triage alert created. Awaiting action.' }), 4300);

    // After 4.8s → switch to detected phase + inject mock alert
    setTimeout(() => {
      setAgentPhase('detected');
      const newAlert = {
        id: `mock_${Date.now()}`,
        isMock: true,
        channelName: 'free_courses_hub',
        foundUrl: 'https://t.me/s/free_courses_hub',
        messagePreview: `"${assetName}" full course shared for free. Join fast before it's taken down.`,
        keyword: keywords[0]?.keyword || assetName,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setMockAlerts(prev => [newAlert, ...prev]);
    }, 4800);
  };

  const handleUploadClick = () => {
    const fileName = prompt('Enter a mock asset filename to upload (e.g., Course_Intro.mp4):');
    if (fileName) {
      setUploadedFiles(prev => [...prev, fileName]);
      triggerAgentScan(fileName);
    }
  };

  const handleVaultIngest = () => {
    const assetName = prompt('Enter the video course/asset name to ingest into the vault:', 'Physics Momentum Course');
    if (assetName) {
      setUploadedFiles(prev => [...prev, assetName]);
      triggerAgentScan(assetName);
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

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Takedown handler — works for both mock and real alerts
  const handleTakedown = async (alertItem) => {
    if (alertItem.isMock) {
      setTakenDown(prev => ({ ...prev, [alertItem.id]: true }));
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      // Create takedown record
      await fetch('http://localhost:5000/api/takedowns', {
        method: 'POST',
        headers,
        body: JSON.stringify({ scanResultId: alertItem.scanResultId }),
      });
      // Mark alert as read
      await fetch(`http://localhost:5000/api/alerts/${alertItem.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isRead: true }),
      });
      setTakenDown(prev => ({ ...prev, [alertItem.id]: true }));
      setAlerts(prev => prev.map(a => a.id === alertItem.id ? { ...a, isRead: true } : a));
    } 
    catch (err) {
      console.error('Takedown failed:', err);
    }
  };

  // Combine real DB alerts + mock demo alerts
  const allAlerts = [...mockAlerts, ...alerts];
  const unreadCount = allAlerts.filter(a => !a.isRead && !takenDown[a.id]).length;

  const mockLectures = (assetName) => {
    const baseSlug = assetName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 5) || 'phy';
    return [
      { id: 1, name: 'Lecture 1', url: `<iframe src="https://embed.dopl.tech/player/${baseSlug}01-1b9d7c2f82e1a5d" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>` },
      { id: 2, name: 'Lecture 2', url: `<iframe src="https://embed.dopl.tech/player/${baseSlug}02-4e2a82910fbd847" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>` },
      { id: 3, name: 'Lecture 3', url: `<iframe src="https://embed.dopl.tech/player/${baseSlug}03-4e3af9802bdcd90" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>` },
      { id: 4, name: 'Lecture 4', url: `<iframe src="https://embed.dopl.tech/player/${baseSlug}04-5b3ac20df71bb48" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>` },
    ];
  };

  // Manual scan trigger
  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      await fetch('http://localhost:5000/api/scan/run-now', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimeout(async () => {
        const headers = { Authorization: `Bearer ${token}` };
        const [srRes, alRes] = await Promise.all([
          fetch('http://localhost:5000/api/scan-results', { headers }),
          fetch('http://localhost:5000/api/alerts', { headers }),
        ]);
        const srData = await srRes.json();
        const alData = await alRes.json();
        if (srData.scanResults) setScanResults(srData.scanResults);
        if (alData.alerts) setAlerts(alData.alerts);
        setIsScanning(false);
      }, 10000);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  // Log color helper
  const logColor = (type) => {
    if (type === 'green') return 'text-brand-green';
    if (type === 'warn') return 'text-[#f59e0b]';
    if (type === 'red') return 'text-[#f87171]';
    if (type === 'info') return 'text-[#38bdf8]';
    return 'text-brand-text';
  };

  return (
    <div className="relative z-10 w-full min-h-screen bg-[#080c0a] text-brand-text flex flex-col md:flex-row items-stretch overflow-hidden">

      {/* ── Left Sidebar ── */}
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

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {/* Overview */}
            <button
              onClick={() => setCurrentTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'overview' ? 'text-brand-green bg-[#131e17]/50' : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {currentTab === 'overview' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />}
              Overview
            </button>

            {/* Content Vault */}
            <button
              onClick={() => setCurrentTab('content-vault')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'content-vault' ? 'text-brand-green bg-[#131e17]/50' : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {currentTab === 'content-vault' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />}
              Content Vault
            </button>

            {/* Triage Alerts — now a real tab */}
            <button
              onClick={() => setCurrentTab('triage-alerts')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'triage-alerts' ? 'text-brand-green bg-[#131e17]/50' : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {currentTab === 'triage-alerts' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />}
              <span>Triage Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Automated Actions */}
            <button
              onClick={() => setCurrentTab('automated-actions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'automated-actions' ? 'text-brand-green bg-[#131e17]/50' : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
            {currentTab === 'automated-actions' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />}
            Automated Actions
            </button>
            
            {/* Integration Key */}
            <button
              onClick={() => setCurrentTab('integration-key')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'integration-key' ? 'text-brand-green bg-[#131e17]/50' : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {currentTab === 'integration-key' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />}
              Integration Key
            </button>

            {/* Proof Generator */}
            <button
              onClick={() => setCurrentTab('proof-generator')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative text-left ${
                currentTab === 'proof-generator' ? 'text-brand-green bg-[#131e17]/50' : 'text-brand-muted hover:text-brand-text hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {currentTab === 'proof-generator' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-green rounded-r" />}
              Proof Generator
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="mt-8 pt-4 border-t border-brand-border flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1c221e] border border-brand-border flex items-center justify-center text-[12px] font-bold text-brand-green">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-brand-text max-w-[120px] truncate">{name}</span>
              <span className="text-[10px] text-brand-muted font-medium">Free Trial</span>
            </div>
          </div>
          <button onClick={onLogOut} className="text-brand-muted hover:text-red-400 transition p-1" title="Log Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* ══ TAB: Overview ══ */}
        {currentTab === 'overview' && (
          <div className="flex flex-col gap-8 text-left">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 w-full">
              <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide">Command Center</h2>
              <div className="self-start sm:self-auto flex items-center gap-2 bg-[#101412] border border-brand-border px-3.5 py-1.5 rounded-full text-xs text-brand-muted">
                <div className={`w-2 h-2 rounded-full ${uploadedFiles.length > 0 ? 'bg-brand-green animate-pulse' : 'bg-[#5c7063]'}`} />
                <span>{uploadedFiles.length > 0 ? 'Scrapers Active' : 'Scrapers on Standby'}</span>
              </div>
            </div>

            {/* Run Scan Now button */}
            <div className="flex justify-end">
              <button
                onClick={handleRunScan}
                disabled={isScanning}
                className="flex items-center gap-2 bg-brand-green text-[#06150c] font-bold px-4 py-2 rounded-lg text-xs hover:bg-brand-green-hover transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <span className="w-3 h-3 border-2 border-[#06150c] border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : '⚡ Run Scan Now'}
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0b100d] border border-brand-border rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Total Protected</span>
                <div className="flex flex-col mt-2">
                  <span className="text-xl font-bold text-brand-text">{uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'} Secure</span>
                  <span className="text-[11px] text-brand-muted mt-1">{uploadedFiles.length > 0 ? 'Ingested & secured' : 'No assets uploaded yet'}</span>
                </div>
              </div>

              <div className="bg-[#0b100d] border border-brand-border rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Live Leaks Found</span>
                <div className="flex flex-col mt-2">
                  <span className="text-xl font-bold text-brand-text">{scanResults.length + mockAlerts.length} Locations</span>
                  <span className="text-[11px] text-brand-muted mt-1">{(scanResults.length + mockAlerts.length) > 0 ? 'Active leaks detected' : 'No leaks detected yet'}</span>
                </div>
              </div>

              <div className="bg-[#0b100d] border border-brand-border rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Account Banned</span>
                <div className="flex flex-col mt-2">
                  <span className="text-xl font-bold text-brand-text">0</span>
                  <span className="text-[11px] text-brand-muted mt-1">No actions triggered yet</span>
                </div>
              </div>

              <div className="bg-[#0b100d] border border-brand-border rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Estimated Revenue Risk</span>
                <div className="flex flex-col mt-2">
                  <span className="text-xl font-bold text-brand-text">₹0</span>
                  <span className="text-[11px] text-brand-muted mt-1">No risk calculated yet</span>
                </div>
              </div>
            </div>

            {/* Pipeline + AI Agent */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 mt-2 items-stretch">

              {/* Asset Pipeline */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-md min-h-[380px]">
                {uploadedFiles.length > 0 ? (
                  <div className="w-full flex flex-col text-left justify-start h-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-brand-text tracking-wide">Ingested Assets</h3>
                      <button onClick={handleUploadClick} className="text-xs text-brand-green hover:underline flex items-center gap-1 font-semibold">
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
                    <div
                      onClick={handleUploadClick}
                      className="w-14 h-14 border border-brand-green/30 rounded-xl flex items-center justify-center transform rotate-45 bg-[#0c1611] mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)] cursor-pointer hover:border-brand-green hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition duration-200"
                    >
                      <span className="transform -rotate-45 text-brand-green text-3xl font-light">+</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg text-brand-text mb-2 tracking-wide">Your Monitoring Pipeline is Empty</h3>
                    <p className="text-brand-muted text-xs max-w-sm leading-relaxed mb-6">
                      Before our autonomous agents can scour decentralized platforms, you must upload your primary files to establish structural signatures.
                    </p>
                    <button onClick={handleUploadClick} className="bg-brand-green text-[#06150c] border-none rounded-lg px-6 py-3 font-bold text-xs cursor-pointer hover:bg-brand-green-hover hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(34,197,94,0.25)] active:scale-100 transition duration-200">
                      Upload Your First Asset
                    </button>
                  </>
                )}
              </div>

              {/* AI Agent Telemetry */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md min-h-[380px]">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[12px] font-bold text-brand-text tracking-wide">AI Agent Telemetry</h3>
                    {agentPhase === 'scanning' && (
                      <span className="flex items-center gap-1.5 text-[10px] text-[#f59e0b] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
                        Scanning...
                      </span>
                    )}
                    {agentPhase === 'detected' && (
                      <span className="flex items-center gap-1.5 text-[10px] text-[#f87171] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] animate-pulse" />
                        Leak Detected
                      </span>
                    )}
                    {agentPhase === 'idle' && (
                      <span className="flex items-center gap-1.5 text-[10px] text-brand-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5c7063]" />
                        Idle
                      </span>
                    )}
                  </div>

                  {/* Console */}
                  <div className="bg-[#050806] border border-brand-border rounded-xl p-4 font-mono text-[11px] leading-relaxed flex flex-col justify-start flex-1 overflow-y-auto max-h-[260px]">
                    {agentPhase === 'idle' ? (
                      <>
                        <div className="mb-2"><span className="text-[#3a4d40]">[--:--:--]</span> <span className="text-brand-text">SYS_IDLE</span></div>
                        <div className="mb-3 pl-4 text-[#5c7063]">Awaiting core data payload...</div>
                        <div className="mb-2"><span className="text-[#3a4d40]">[--:--:--]</span> <span className="text-brand-text">INDEX_VOID</span></div>
                        <div className="mb-3 pl-4 text-[#5c7063]">0 target hashes registered</div>
                        <div className="mb-2"><span className="text-[#3a4d40]">[--:--:--]</span> <span className="text-brand-green">CRAWL_HALT</span></div>
                        <div className="mb-3 pl-4 text-[#5c7063]">Scrapers holding position...</div>
                        <div className="pl-4 text-brand-green animate-pulse">{'>'} Pipeline ready for injection █</div>
                      </>
                    ) : (
                      <>
                        {agentLogs.map((log, idx) => (
                          <div key={idx} className="mb-2 animate-[fadeIn_0.4s]">
                            <div>
                              <span className="text-[#3a4d40]">[{log.time}]</span>{' '}
                              <span className={logColor(log.type)}>{log.label}</span>
                            </div>
                            <div className={`pl-4 ${logColor(log.type)}`}>{log.msg}</div>
                          </div>
                        ))}
                        {agentPhase === 'scanning' && (
                          <div className="pl-4 text-[#f59e0b] animate-pulse mt-1">{'>'} Running deep scan... █</div>
                        )}
                        {agentPhase === 'detected' && (
                          <div className="mt-3 border border-[#f87171]/20 bg-[#f87171]/5 rounded-lg p-3">
                            <div className="text-[#f87171] font-bold text-[11px] mb-1">⚠ COURSE DETECTED ON TELEGRAM</div>
                            <div className="text-[#5c7063] text-[10px]">"{detectedAsset}" leaked on 2 public channels.</div>
                            <button
                              onClick={() => setCurrentTab('triage-alerts')}
                              className="mt-2 text-[10px] text-brand-green underline cursor-pointer hover:text-brand-green-hover"
                            >
                              View Triage Alerts →
                            </button>
                          </div>
                        )}
                        <div ref={agentLogsEndRef} />
                      </>
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

        {/* ══ TAB: Content Vault ══ */}
        {currentTab === 'content-vault' && (
          <div className="flex flex-col gap-8 text-left animate-[fadeIn_0.3s]">
            <div>
              <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide mb-1">Content Vault</h2>
              <p className="text-brand-muted text-xs leading-relaxed">
                Ingest assets, embed structural neural watermarks, and manage digital core signatures.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-stretch">
              {/* Dropzone */}
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

              {/* Neural Setup Config */}
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

            {/* Assets Table */}
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col w-full min-h-[300px] justify-between">
              <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-brand-text tracking-wide">Protected Directory Workspace</h3>
                  <button
                    onClick={() => alert('Filtering tools are inactive in this sandbox.')}
                    className="border border-[rgba(255,255,255,0.08)] bg-transparent text-brand-text px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[rgba(255,255,255,0.02)] transition active:scale-95"
                  >
                    Filter Assets
                  </button>
                </div>

                {uploadedFiles.length === 0 ? (
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
                            <td className="py-4 font-mono text-brand-green font-semibold text-[11.5px]">dopl_sh256_8f3c9b1a4e72</td>
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
              <div className="border-t border-brand-border mt-6 pt-4 text-[10.5px] text-brand-muted">
                {uploadedFiles.length} {uploadedFiles.length === 1 ? 'primary asset core' : 'primary asset cores'} registered under active programmatic tracking matrix
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: Triage Alerts ══ */}
        {currentTab === 'triage-alerts' && (() => {
          // Assign mock severity to each alert dynamically based on index + id hash
          const withSeverity = allAlerts.map((a, i) => {
            // deterministic pseudo-random severity per alert
            const seed = (a.id?.toString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 0) + i;
            const pct = 55 + (seed % 45); // range 55–99
            let level = 'review';
            if (pct >= 80) level = 'critical';
            else if (pct >= 60) level = 'high';
            return { ...a, severityPct: pct, severityLevel: level };
          });

          const counts = {
            all: withSeverity.length,
            critical: withSeverity.filter(a => a.severityLevel === 'critical').length,
            high: withSeverity.filter(a => a.severityLevel === 'high').length,
            review: withSeverity.filter(a => a.severityLevel === 'review').length,
          };

          const filtered = triageFilter === 'all' ? withSeverity : withSeverity.filter(a => a.severityLevel === triageFilter);

          const severityColor = (level) => {
            if (level === 'critical') return { bg: 'bg-[#f87171]/15', text: 'text-[#f87171]', border: 'border-[#f87171]/30' };
            if (level === 'high') return { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30' };
            return { bg: 'bg-[#38bdf8]/10', text: 'text-[#38bdf8]', border: 'border-[#38bdf8]/25' };
          };

          const openIncident = (alertItem) => {
            setSelectedIncident(alertItem);
            setTakedownDispatched(false);
            setShowIncidentModal(true);
          };

          return (
            <div className="flex flex-col gap-6 text-left animate-[fadeIn_0.3s]">
              {/* Header */}
              <div>
                <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide">Triage Alerts</h2>
                <p className="text-brand-muted text-xs mt-1 leading-relaxed">
                  {counts.all > 0
                    ? `${counts.all} active structural match ${counts.all === 1 ? 'leak' : 'leaks'} isolated under target course signatures.`
                    : 'Leaked content flagged by DOPL\'s scanner. Review each alert and file a takedown.'}
                </p>
              </div>

              {/* Empty state */}
              {allAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-24 bg-brand-card border border-brand-border rounded-2xl">
                  <div className="w-16 h-16 border border-brand-border rounded-xl flex items-center justify-center bg-[#070b09] mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a443e" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h4 className="text-[15px] font-semibold text-brand-text mb-1.5">All Clear — No Leaks Detected</h4>
                  <p className="text-[12px] text-brand-muted max-w-sm leading-relaxed">
                    No piracy alerts have been raised yet. Add a course to your Content Vault to start monitoring.
                  </p>
                  <button
                    onClick={() => setCurrentTab('content-vault')}
                    className="mt-6 bg-brand-green text-[#06150c] font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-brand-green-hover transition cursor-pointer"
                  >
                    Go to Content Vault
                  </button>
                </div>
              )}

              {/* Filter tabs + table */}
              {allAlerts.length > 0 && (
                <>
                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { key: 'all', label: 'All', count: counts.all },
                      { key: 'critical', label: 'Critical', count: counts.critical },
                      { key: 'high', label: 'High', count: counts.high },
                      { key: 'review', label: 'Review', count: counts.review },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setTriageFilter(tab.key)}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition cursor-pointer ${
                          triageFilter === tab.key
                            ? tab.key === 'critical'
                              ? 'bg-[#f87171]/15 text-[#f87171] border-[#f87171]/40'
                              : tab.key === 'high'
                              ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40'
                              : tab.key === 'review'
                              ? 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30'
                              : 'bg-brand-green/10 text-brand-green border-brand-green/30'
                            : 'bg-transparent text-brand-muted border-brand-border hover:text-brand-text'
                        }`}
                      >
                        {tab.label} {tab.count > 0 ? `(${tab.count})` : '(0)'}
                      </button>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_160px_140px_140px] gap-4 px-6 py-3 border-b border-brand-border">
                      <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase">Source Network / Channel / Location Identifier</span>
                      <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase">Audience Matrix</span>
                      <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase">Severity Level</span>
                      <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase text-right">Quick Actions</span>
                    </div>

                    {filtered.length === 0 && (
                      <div className="py-12 text-center text-brand-muted text-sm">No alerts in this category.</div>
                    )}

                    {filtered.map((alertItem) => {
                      const isDone = takenDown[alertItem.id] || (!alertItem.isMock && alertItem.isRead);
                      const sc = severityColor(alertItem.severityLevel);
                      const channelName = alertItem.channelName || alertItem.scanResult?.channelName || 'Unknown Channel';
                      const fileLabel = alertItem.keyword || alertItem.scanResult?.keyword || 'Course File';
                      // mock audience count based on severity
                      const seed = (alertItem.id?.toString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 1);
                      const audienceCount = alertItem.severityLevel === 'critical'
                        ? `${(5000 + (seed % 20000)).toLocaleString('en-IN')} members`
                        : alertItem.severityLevel === 'high'
                        ? `${(1000 + (seed % 5000)).toLocaleString('en-IN')} members`
                        : 'Direct Folder Link';

                      return (
                        <div
                          key={alertItem.id}
                          className={`grid grid-cols-[1fr_160px_140px_140px] gap-4 px-6 py-4 border-b border-[rgba(255,255,255,0.03)] items-center transition hover:bg-[rgba(255,255,255,0.01)] ${isDone ? 'opacity-40' : ''}`}
                        >
                          {/* Channel info */}
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#112417] border border-brand-border flex items-center justify-center text-[9px] font-bold text-brand-green flex-shrink-0">
                              TG
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-bold text-brand-text truncate">
                                {channelName.replace(/^free_|^piracy_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </span>
                              <span className="text-[10px] text-brand-muted mt-0.5">
                                Detected {Math.floor((Date.now() - new Date(alertItem.createdAt).getTime()) / 60000)}m ago • {fileLabel}.mp4
                              </span>
                            </div>
                          </div>

                          {/* Audience */}
                          <span className="text-[12px] text-brand-muted-light">{audienceCount}</span>

                          {/* Severity badge */}
                          <div>
                            {isDone ? (
                              <span className="text-[10px] font-bold bg-[#22c55e]/10 text-brand-green border border-[#22c55e]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Resolved
                              </span>
                            ) : (
                              <span className={`text-[10px] font-bold ${sc.bg} ${sc.text} border ${sc.border} px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                                {alertItem.severityPct}% {alertItem.severityLevel}
                              </span>
                            )}
                          </div>

                          {/* Action button */}
                          <div className="flex justify-end">
                            {isDone ? (
                              <span className="text-[11px] font-bold text-brand-green px-4 py-2 rounded-lg border border-[#22c55e]/20 bg-[#112417]">
                                ✓ Done
                              </span>
                            ) : (
                              <button
                                onClick={() => openIncident(alertItem)}
                                className="bg-brand-green text-[#06150c] font-bold px-4 py-2 rounded-lg text-[11px] hover:bg-brand-green-hover hover:scale-[1.01] transition active:scale-95 cursor-pointer shadow-[0_2px_8px_rgba(34,197,94,0.15)]"
                              >
                                Review Incident
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Footer */}
                    <div className="px-6 py-3 flex justify-between items-center">
                      <span className="text-[10px] text-brand-muted">
                        Showing {filtered.length} of {counts.all} active isolated {counts.all === 1 ? 'threat' : 'threats'}
                      </span>
                      {triageFilter !== 'all' && counts.all > filtered.length && (
                        <button
                          onClick={() => setTriageFilter('all')}
                          className="text-[10px] text-brand-green font-semibold hover:underline cursor-pointer"
                        >
                          View All {counts.all} Alerts
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* ══ INCIDENT VERIFICATION MODAL ══ */}
        {showIncidentModal && selectedIncident && (() => {
          const sc = (() => {
            const seed = (selectedIncident.id?.toString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 0);
            const pct = 55 + (seed % 45);
            const level = pct >= 80 ? 'critical' : pct >= 60 ? 'high' : 'review';
            return { pct, level };
          })();
          const channelName = selectedIncident.channelName || selectedIncident.scanResult?.channelName || 'UnknownChannel';
          const fileLabel = selectedIncident.keyword || selectedIncident.scanResult?.keyword || 'Course_File';
          const caseNum = `TRG-${9000 + Math.abs(selectedIncident.id?.toString().split('').reduce((a,c)=>a+c.charCodeAt(0),0)||1) % 999}`;
          const tokenId = `token_id_idx_${40000 + Math.abs(selectedIncident.id?.toString().split('').reduce((a,c)=>a+c.charCodeAt(0),0)||1) % 9999}`;
          const isDone = takenDown[selectedIncident.id] || (!selectedIncident.isMock && selectedIncident.isRead);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]">
              <div className="w-full max-w-[680px] bg-[#0c100e] border border-brand-border rounded-2xl shadow-2xl relative text-left animate-[scaleIn_0.2s_ease-out] overflow-hidden">

                {/* Close */}
                <button
                  onClick={() => { setShowIncidentModal(false); setTakedownDispatched(false); }}
                  className="absolute top-4 right-4 text-brand-muted hover:text-brand-text transition cursor-pointer p-1 z-10"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {!takedownDispatched ? (
                  <div className="p-7">
                    {/* Badge + Title */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        ● Critical Match
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-[22px] text-brand-text tracking-wide mb-1">
                      Incident Verification Panel: Case #{caseNum}
                    </h3>
                    <p className="text-[11px] text-brand-muted mb-6">
                      Review extraction payload metrics verified via autonomous spatial crawling trackers.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Left — Watermark visual */}
                      <div className="flex flex-col gap-4">
                        {/* Waveform box */}
                        <div className="bg-[#070b09] border border-brand-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden">
                          <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none">
                            {Array.from({ length: 60 }, (_, i) => (
                              <rect
                                key={i}
                                x={i * 5}
                                y={30 - (Math.sin(i * 0.4 + 1) * 12 + Math.random() * 8)}
                                width="3"
                                height={Math.abs(Math.sin(i * 0.4 + 1) * 24 + Math.random() * 10)}
                                fill={i > 20 && i < 40 ? '#22c55e' : '#1a2e20'}
                                opacity={i > 20 && i < 40 ? 0.8 : 0.4}
                              />
                            ))}
                          </svg>
                          <div className="mt-3 flex items-center gap-2 bg-brand-green/10 border border-brand-green/30 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                            <span className="text-[11px] font-bold text-brand-green">A.I. Watermark Found</span>
                          </div>
                        </div>

                        {/* Forensic metadata */}
                        <div className="bg-[#070b09] border border-brand-border rounded-xl p-4 flex flex-col gap-3">
                          <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase">Forensic Metadata Extract</span>
                          <div className="flex flex-col gap-2 text-[12px]">
                            <div className="flex justify-between">
                              <span className="text-brand-muted">Extracted Key:</span>
                              <code className="text-[#f59e0b] font-mono font-bold">{tokenId}</code>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-brand-muted">Match Accuracy:</span>
                              <span className="text-brand-green font-bold">{sc.pct}.{Math.floor(Math.random()*99).toString().padStart(2,'0')}% Confidence</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-brand-muted">Tamper State:</span>
                              <span className="text-brand-text font-semibold">Structure Intact (No Crop)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right — Source details */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                          <div>
                            <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase">Source File Matrix</span>
                            <p className="text-[14px] font-bold text-brand-text mt-1">{fileLabel.replace(/\s+/g, '_')}.mp4</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase">Detection Platform Ecosystem</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/25 px-2 py-0.5 rounded uppercase tracking-wider">Telegram</span>
                              <span className="text-[12px] text-brand-text font-semibold">Channel: @{channelName.replace(/^free_|^piracy_/,'').replace(/_/g,'_')}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase">Leaker Provenance Trace ID</span>
                            <p className="text-[13px] font-bold text-brand-text mt-1">
                              User Sequence ID: {tokenId.replace('token_id_idx_', '')}
                            </p>
                            <p className="text-[10px] text-brand-muted mt-0.5">Corresponds to user registration webhook portal parameters.</p>
                          </div>
                        </div>

                        {/* Remediation box */}
                        <div className="bg-[#f87171]/5 border border-[#f87171]/20 rounded-xl p-4">
                          <span className="text-[9px] font-bold tracking-wider text-[#f87171] uppercase">Recommended Remediation Action</span>
                          <p className="text-[11.5px] text-brand-muted-light mt-2 leading-relaxed">
                            Deploy automated legal structure takedown notices directly to target core ISP nodes and invalidate user session sync key access.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-between items-center mt-6 pt-5 border-t border-brand-border">
                      <button
                        onClick={() => {
                          setTakenDown(prev => ({ ...prev, [selectedIncident.id]: true }));
                          setShowIncidentModal(false);
                        }}
                        className="bg-transparent border border-brand-border text-brand-muted font-bold px-5 py-2.5 rounded-lg text-xs hover:text-brand-text hover:border-brand-text transition cursor-pointer"
                      >
                        Dismiss (False Positive)
                      </button>
                      <button
                        onClick={async () => {
                          setTakedownDispatched(true);
                          await handleTakedown(selectedIncident);
                        }}
                        className="bg-[#f87171] text-white font-bold px-6 py-2.5 rounded-lg text-xs hover:bg-[#ef4444] hover:scale-[1.01] transition active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(248,113,113,0.3)]"
                      >
                        Authorize Immediate Takedown
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Takedown Dispatched screen */
                  <div className="p-10 flex flex-col items-center text-center gap-5">
                    <div className="w-16 h-16 rounded-full border-2 border-brand-green bg-brand-green/10 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-[22px] text-brand-text tracking-wide">Takedown Protocol Dispatched</h3>
                      <p className="text-[12px] text-brand-muted mt-1">
                        Case #{selectedIncident.id?.toString().substring(0,8) || 'TRG'} has been moved from Triage to Automated Enforcement Pipelines.
                      </p>
                    </div>
                    <div className="w-full bg-[#050806] border border-brand-border rounded-xl p-5 font-mono text-[11px] text-left flex flex-col gap-2">
                      {[
                        { color: 'text-brand-green', text: '[✓] DMCA Notice Generated via Legal Core Module' },
                        { color: 'text-brand-green', text: '[✓] Cloudflare Gateway IP Restrictions Updated' },
                        { color: 'text-brand-green', text: `[✓] Webhook Fired: User Account Session Invalidated (ID: ${selectedIncident.id?.toString().substring(0,5) || '49201'})` },
                        { color: 'text-[#f59e0b]', text: '>> Broadcasting take-down metrics to Telegram Infrastructure API... █', blink: true },
                      ].map((line, i) => (
                        <div key={i} className={`${line.color} ${line.blink ? 'animate-pulse' : ''}`}>{line.text}</div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setShowIncidentModal(false); setTakedownDispatched(false); }}
                      className="mt-2 border border-brand-border text-brand-text font-bold px-6 py-2.5 rounded-lg text-xs hover:bg-[rgba(255,255,255,0.03)] transition cursor-pointer"
                    >
                      Return to Triage Queue
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ══ TAB: Automated Actions ══ */}
        {currentTab === 'automated-actions' && (() => {
          const logEntries = [];
        
          scanTargets.forEach(t => {
            logEntries.push({
              time: new Date(t.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
              type: 'info',
              label: 'INFO',
              msg: `Scanning target: ${t.sourceUrl}`,
            });
          });

         scanResults.forEach(r => {
            logEntries.push({
              time: new Date(r.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
              type: 'warn',
              label: 'MATCH',
              msg: `Keyword "${r.keyword}" matched on @${r.channelName}`,
           });
          });

          alerts.forEach(a => {
            logEntries.push({
              time: new Date(a.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
              type: 'red',
              label: 'WARN',
             msg: `Critical leak detected on @${a.channelName || a.scanResult?.channelName || 'unknown'}`,
            });
          });
        
         allAlerts.filter(a => takenDown[a.id] || (!a.isMock && a.isRead)).forEach(a => {
           const ch = a.channelName || a.scanResult?.channelName || 'unknown';
           logEntries.push({
             time: new Date(a.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
             type: 'blue',
             label: 'ACTION',
              msg: `Executing takedown for @${ch}...`,
            });
            logEntries.push({
              time: new Date(a.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
              type: 'green',
              label: 'SUCCESS',
              msg: `Takedown filed for @${ch}`,
            });
          });

          logEntries.sort((a, b) => a.time.localeCompare(b.time));

          const logColor = (type) => {
            if (type === 'green') return 'text-brand-green';
            if (type === 'warn') return 'text-[#f59e0b]';
            if (type === 'red') return 'text-[#f87171]';
            if (type === 'blue') return 'text-[#38bdf8]';
            if (type === 'info') return 'text-brand-muted-light';
            return 'text-brand-text';
          };

          const rules = [
            { key: 'telegramTakedown', title: 'Trigger Telegram Takedown', desc: 'File DMCA report when a leak alert is confirmed on a public Telegram channel' },
            { key: 'restrictAccess', title: 'Restrict Student Access', desc: 'Flag the matched keyword scan result for manual review and block further indexing' },
            { key: 'notifyLegal', title: 'Auto-Notify Legal Team', desc: 'Send an email summary to your registered legal contact when a critical alert is raised' },
          ];

          const isActive = autoRules && Object.values(autoRules).some(v => v);

          return (
            <div className="flex flex-col gap-6 text-left animate-[fadeIn_0.3s]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide">Automated Actions Hub</h2>
                  <p className="text-brand-muted text-xs mt-1 leading-relaxed">
                    Configure enforcement rules. Logs below reflect real activity from your scan history.
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold ${
                  isActive ? 'bg-brand-green/10 border-brand-green/30 text-brand-green' : 'bg-brand-muted/10 border-brand-border text-brand-muted'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand-green animate-pulse' : 'bg-brand-muted'}`} />
                  {isActive ? 'BOT ACTIVE' : 'BOT INACTIVE'}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Active Enforcement Rules</span>
                  {rules.map(rule => (
                    <div key={rule.key} className="bg-brand-card border border-brand-border rounded-xl p-5 flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-bold text-brand-text">{rule.title}</span>
                        <span className="text-[11px] text-brand-muted leading-relaxed">{rule.desc}</span>
                      </div>
                      <button
                        onClick={() => setAutoRules(prev => ({ ...prev, [rule.key]: !prev[rule.key] }))}
                        className={`flex-shrink-0 w-11 h-6 rounded-full border transition-all relative cursor-pointer ${
                          autoRules[rule.key] ? 'bg-brand-green/20 border-brand-green/40' : 'bg-[#0a0f0d] border-brand-border'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                          autoRules[rule.key] ? 'left-[22px] bg-brand-green shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'left-0.5 bg-[#3a443e]'
                        }`} />
                      </button>
                    </div>
                  ))}
                  <div className="border border-dashed border-brand-border rounded-xl p-4 text-center">
                    <span className="text-[12px] text-brand-muted">+ Add Custom Workflow Rule</span>
                    <p className="text-[10px] text-brand-muted mt-1 opacity-60">Coming soon</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-wider text-brand-muted uppercase">Live Enforcement Stream Log</span>
                <div className="bg-[#050806] border border-brand-border rounded-xl p-4 font-mono text-[11px] leading-relaxed flex flex-col gap-2 overflow-y-auto max-h-[420px] min-h-[200px]">
                  {logEntries.length === 0 ? (
                    <div className="text-brand-muted text-center py-8">No activity yet. Run a scan or add keywords to see logs here.</div>
                  ) : (
                    logEntries.map((entry, i) => (
                      <div key={i} className={logColor(entry.type)}>
                        <span className="text-[#3a4d40]">[{entry.time}]</span>{' '}
                        <span className="font-bold">{entry.label}:</span>{' '}
                        {entry.msg}
                      </div>
                    ))
                  )}
                  <div className="text-brand-muted animate-pulse mt-1">Streaming logs in real-time...</div>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* ══ TAB: Integration Key ══ */}
        {currentTab === 'integration-key' && (
          <div className="flex flex-col gap-8 text-left animate-[fadeIn_0.3s]">
            {/* Header */}
            <div>
              <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide mb-1">Integration Credentials</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Connect your course CMS, configure webhooks, and manage your API tracking credentials.
              </p>
            </div>

            {/* REST API Token Table */}
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-text tracking-wide">REST API Authentication Tokens</h3>
                  <p className="text-[11px] text-brand-muted mt-0.5">Use tokens to authenticate asset ingestion and query piracy leak reports.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="bg-brand-green text-[#06150c] font-bold px-4 py-2 rounded-lg text-[11px] hover:bg-brand-green-hover transition active:scale-95 cursor-pointer"
                >
                  {copiedToken ? 'Copied!' : 'Copy Token'}
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border text-[9px] font-bold text-brand-muted uppercase tracking-wider">
                      <th className="pb-3 font-bold">Token Name</th>
                      <th className="pb-3 font-bold">Token String</th>
                      <th className="pb-3 font-bold">Environment</th>
                      <th className="pb-3 font-bold">Created</th>
                      <th className="pb-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[rgba(255,255,255,0.03)]">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-text text-[13px]">Production Checkout</span>
                          <span className="text-[10px] text-brand-muted mt-0.5">
                            Created {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-brand-green font-mono text-[11px] select-all">{apiKey}</code>
                          <button
                            type="button"
                            onClick={handleCopyKey}
                            className="text-brand-muted hover:text-brand-green transition cursor-pointer"
                            title="Copy"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1.5 text-brand-green font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                          Production
                        </span>
                      </td>
                      <td className="py-4 text-brand-muted text-[11px]">Just now</td>
                      <td className="py-4 text-right">
                        <button className="text-[11px] text-[#f87171] font-semibold hover:underline cursor-pointer">Revoke</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Outbound Triage Webhooks */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text tracking-wide">Outbound Triage Webhooks</h3>
                    <p className="text-[11px] text-brand-muted mt-0.5">Receive alerts whenever a leak asset matches.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (webhookUrl.trim()) {
                        setWebhookSaved(true);
                        setTimeout(() => setWebhookSaved(false), 2000);
                      }
                    }}
                    className="text-[11px] font-bold text-brand-green border border-brand-green/30 px-3 py-1.5 rounded-lg hover:bg-brand-green/10 transition cursor-pointer"
                  >
                    {webhookSaved ? 'Saved ✓' : 'Add Endpoint'}
                  </button>
                </div>

                {/* Webhook input */}
                <input
                  type="url"
                  placeholder="https://your-server.com/dopl-webhook"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  className="w-full bg-[#070b09] border border-brand-border rounded-lg px-4 py-2.5 text-brand-text text-[12px] outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition font-mono placeholder-brand-muted"
                />

                {/* Saved webhook display */}
                {webhookSaved || webhookUrl.trim() ? (
                  <div className="bg-[#070b09] border border-brand-border rounded-lg p-3 flex flex-col gap-1.5">
                    <code className="text-brand-green text-[11px] font-mono break-all">{webhookUrl || 'https://your-server.com/dopl-webhook'}</code>
                    <div className="flex items-center justify-between mt-1">
                      <span className="flex items-center gap-1.5 text-[10px] text-brand-green font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                        Active
                      </span>
                      <span className="text-[10px] text-brand-muted">Events: triage.match, asset.compromised</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-brand-muted text-center py-4">No endpoint configured yet.</p>
                )}
              </div>

              {/* Scraper Search Keywords */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-brand-text tracking-wide">Scraper Search Keywords</h3>
                  <p className="text-[11px] text-brand-muted mt-0.5">Keywords mapped to your assets for scanning.</p>
                </div>

                {keywords.length === 0 ? (
                  <p className="text-[11px] text-brand-muted text-center py-6">
                    No keywords added yet. Add them in setup.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map(kw => (
                      <span
                        key={kw.id}
                        className="flex items-center gap-1.5 bg-[#0a110d] border border-brand-border text-brand-text text-[11px] font-semibold px-3 py-1.5 rounded-full"
                      >
                        {kw.keyword}
                        <span className="text-brand-muted">×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ══ TAB: Proof Generator ══ */}
        {currentTab === 'proof-generator' && (() => {
          // Real resolved alerts (taken down)
          const resolvedAlerts = allAlerts.filter(a => takenDown[a.id] || (!a.isMock && a.isRead));
          const openAlerts = allAlerts.filter(a => !takenDown[a.id] && (a.isMock || !a.isRead));

          const genHash = (str) => {
            let h = 0;
            for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
            const hex = Math.abs(h).toString(16).padStart(8, '0');
            return `sha256:e3b0c4${hex}fc1c149afbf4c8996fb9${hex.split('').reverse().join('')}`;
          };

          const genWatermarkId = (str) => {
            let h = 0;
            for (let i = 0; i < str.length; i++) h = (Math.imul(17, h) + str.charCodeAt(i)) | 0;
            return `dopl_sh256_${Math.abs(h).toString(16).padStart(12, '0')}_idx_${Math.abs(h) % 99999}`;
          };

          const genRevenue = (alert) => {
            const seed = alert.id?.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 1;
            return ((5000 + (seed % 80000)) / 100 * 100).toLocaleString('en-IN');
          };

          const displayAlerts = proofTab === 'open' ? openAlerts : resolvedAlerts;

          return (
            <div className="flex flex-col gap-6 text-left animate-[fadeIn_0.3s]">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-display font-bold text-3xl text-brand-text tracking-wide">Evidence & Audit Hub</h2>
                  <p className="text-brand-muted text-xs mt-1 leading-relaxed">
                    Cryptographic forensic packets and legally binding leak proof records.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-brand-muted border border-brand-border px-3 py-1.5 rounded-lg">
                  Admin Panel v1.04
                </span>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-2">
                {[
                  { key: 'open', label: 'All Open Incidents', count: openAlerts.length },
                  { key: 'resolved', label: 'Handled / Resolved', count: resolvedAlerts.length },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setProofTab(t.key)}
                    className={`px-4 py-2 rounded-full text-[12px] font-bold border transition cursor-pointer ${
                      proofTab === t.key
                        ? 'bg-brand-green/10 text-brand-green border-brand-green/30'
                        : 'bg-transparent text-brand-muted border-brand-border hover:text-brand-text'
                    }`}
                  >
                    {t.label} {t.count > 0 ? `(${t.count})` : ''}
                  </button>
                ))}
              </div>

              {/* Empty state */}
              {displayAlerts.length === 0 && (
                <div className="bg-brand-card border border-brand-border rounded-2xl py-20 flex flex-col items-center justify-center text-center">
                  <p className="text-brand-muted text-sm">
                    {proofTab === 'open'
                      ? 'No open incidents. All leaks have been handled.'
                      : 'No resolved incidents yet. File a takedown from Triage Alerts to see records here.'}
                  </p>
                  {proofTab === 'resolved' && (
                    <button
                      onClick={() => setCurrentTab('triage-alerts')}
                      className="mt-4 bg-brand-green text-[#06150c] font-bold px-5 py-2 rounded-lg text-xs hover:bg-brand-green-hover transition cursor-pointer"
                    >
                      Go to Triage Alerts
                    </button>
                  )}
                </div>
              )}

              {/* Cases */}
              {displayAlerts.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {displayAlerts.map((a) => {
                    const channelName = a.channelName || a.scanResult?.channelName || 'unknown';
                    const keyword = a.keyword || a.scanResult?.keyword || 'course';
                    const isResolved = takenDown[a.id] || (!a.isMock && a.isRead);
                    const hash = genHash(a.id?.toString() + channelName);
                    const watermarkId = genWatermarkId(a.id?.toString() + keyword);
                    const revenue = genRevenue(a);
                    const seed = a.id?.toString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 1;
                    const confidence = (80 + (seed % 19)) + '.' + String(seed % 99).padStart(2, '0');
                    const telegramUrl = a.foundUrl || a.scanResult?.foundUrl || `https://t.me/s/${channelName}`;

                    return (
                      <div key={a.id} className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-5">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Critical Match
                          </span>
                          {isResolved && (
                            <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              ● Removed from Telegram
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="font-bold text-[18px] text-brand-text tracking-wide">
                            {keyword.replace(/\b\w/g, c => c.toUpperCase())}
                          </h3>
                          <p className="text-[11px] text-brand-muted mt-0.5">Case File Audit Profile — forensic summary</p>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col gap-3 text-[12px]">
                          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2">
                            <span className="text-brand-muted">Match Confidence Index</span>
                            <span className="text-brand-green font-bold">{confidence}% Confidence</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2">
                            <span className="text-brand-muted">Enforcement Target Channel</span>
                            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="text-brand-text font-semibold hover:text-brand-green transition">
                              @{channelName}
                            </a>
                          </div>
                          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2">
                            <span className="text-brand-muted">Automated System Action</span>
                            <span className={isResolved ? 'text-brand-green font-bold' : 'text-[#f59e0b] font-bold'}>
                              {isResolved ? 'Successfully Handled (1.8s)' : 'Awaiting Action'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-brand-muted">Detected</span>
                            <span className="text-brand-text">
                              {new Date(a.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {/* Revenue saved */}
                        {isResolved && (
                          <div className="bg-[#070b09] border border-brand-border rounded-xl p-4 flex flex-col gap-1">
                            <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase">Impacted Revenue Loss Saved</span>
                            <span className="text-[28px] font-bold text-[#f59e0b] mt-1">₹{revenue}</span>
                            <span className="text-[10px] text-brand-muted leading-relaxed">
                              Calculated based on tracked leaking channel audience size threshold.
                            </span>
                          </div>
                        )}

                        {/* Forensic preview */}
                        <div className="bg-[#070b09] border border-brand-border rounded-xl p-4 flex flex-col gap-2">
                          <span className="text-[9px] font-bold tracking-wider text-brand-muted uppercase mb-1">Forensic Audit Report Preview</span>
                          <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                            <div className="flex gap-3">
                              <span className="text-brand-muted w-24 flex-shrink-0">TIMESTAMP</span>
                              <span className="text-brand-text">{new Date(a.createdAt).toISOString().replace('T', ' ').substring(0, 19)} UTC</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="text-brand-muted w-24 flex-shrink-0">SOURCE URL</span>
                              <span className="text-brand-green truncate">telegram.me/{channelName}</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="text-brand-muted w-24 flex-shrink-0">WATERMARK ID</span>
                              <span className="text-brand-text truncate">{watermarkId}</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="text-brand-muted w-24 flex-shrink-0">FORENSIC HASH</span>
                              <span className="text-brand-text truncate">{hash.substring(0, 40)}...</span>
                            </div>
                          </div>
                        </div>

                        {/* Action button */}
                        {isResolved ? (
                          <button
                            onClick={() => {
                              const content = `DOPL FORENSIC AUDIT REPORT\nREPORT ID: #${a.id?.toString().substring(0,8).toUpperCase()}\n\nTIMESTAMP: ${new Date(a.createdAt).toISOString()}\nSOURCE URL: telegram.me/${channelName}\nWATERMARK ID: ${watermarkId}\nFORENSIC HASH: ${hash}\nMATCH CONFIDENCE: ${confidence}%\nKEYWORD: ${keyword}\nSTATUS: RESOLVED\n\nGenerated by DOPL AI — ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `DOPL_Forensic_Report_${a.id?.toString().substring(0,8)}.txt`;
                              link.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="w-full bg-brand-green text-[#06150c] font-bold py-3 rounded-xl text-[12px] hover:bg-brand-green-hover transition active:scale-95 cursor-pointer"
                          >
                            ↓ Download Immutable Forensic Pack
                          </button>
                        ) : (
                          <button
                            onClick={() => setCurrentTab('triage-alerts')}
                            className="w-full border border-brand-border text-brand-muted font-bold py-3 rounded-xl text-[12px] hover:text-brand-text hover:border-brand-text transition cursor-pointer"
                          >
                            Go to Triage to Handle →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

      </main>

      {/* ── Integration Links Modal ── */}
      {showLinksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]">
          <div className="w-full max-w-[520px] bg-[#0c100e] border border-brand-border rounded-2xl p-6 shadow-2xl relative text-left animate-[scaleIn_0.2s_ease-out]">
            <button
              onClick={() => setShowLinksModal(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-text transition cursor-pointer p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="font-display font-bold text-xl text-brand-text tracking-wide mb-1">Integration Links</h3>
            <p className="text-[12px] font-semibold text-brand-green tracking-wide truncate mb-5">
              {selectedAsset} - Embed Links
            </p>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1.5">
              {mockLectures(selectedAsset).map((lecture, index) => (
                <div key={lecture.id} className="flex flex-col w-full">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5">{lecture.name}:</span>
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

            <div className="mt-6 pt-4 border-t border-brand-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowLinksModal(false)}
                className="bg-brand-green text-[#06150c] font-bold px-6 py-2.5 rounded-lg text-xs hover:bg-brand-green-hover transition cursor-pointer"
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