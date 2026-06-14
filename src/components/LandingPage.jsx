
export default function LandingPage({ setView }) {
  return (
    <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6">
      {/* Header */}
      <header className="flex justify-between items-center py-6">
        <div className="flex items-center gap-2.5 font-display font-bold text-xl tracking-[0.5px]">
          <span className="w-[30px] height-[30px] h-[30px] bg-brand-green rounded-lg flex items-center justify-center text-[#06150c] font-extrabold text-base">D</span>
          DOPL
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-brand-text text-sm font-semibold hover:text-brand-green transition" onClick={(e) => { e.preventDefault(); setView('signin'); }}>Sign In</a>
          <button 
            onClick={() => setView('signup')} 
            className="bg-brand-green text-[#06150c] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-green-hover hover:scale-[1.02] active:scale-100 transition shadow-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center max-w-[780px] mx-auto pt-16 pb-8 px-4">
        <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-tight">
          Stop Losing Revenue to Piracy.<br />
          <span className="text-brand-green">Take Back Control.</span>
        </h1>
        <p className="text-brand-muted-light text-base md:text-[17px] leading-relaxed mt-5">
          DOPL helps independent course creators detect, disrupt, and reduce large-scale piracy across platforms like Telegram, Discord, and file-hosting sites.
        </p>
        <p className="font-bold text-brand-text text-base mt-4">
          Protect your content. Protect your income. Without complex legal battles.
        </p>
        <button 
          onClick={() => setView('signup')}
          className="inline-block mt-8 bg-brand-green text-[#06150c] px-8 py-4 rounded-lg font-bold text-base hover:bg-brand-green-hover hover:scale-[1.02] active:scale-100 transition shadow-md"
        >
          Get Started in Minutes
        </button>
      </section>

      {/* Highlight Box */}
      <section className="mt-12">
        <div className="bg-brand-card border border-brand-border rounded-2xl p-9 md:p-10 text-center backdrop-blur-md">
          <h2 className="font-display font-bold text-xl md:text-2xl leading-snug">
            We don't promise to eliminate piracy —
            <span className="text-brand-green block">we make it unscalable and unprofitable.</span>
          </h2>
          <p className="text-brand-muted text-sm md:text-base leading-relaxed mt-4 max-w-[720px] mx-auto">
            DOPL focuses on stopping mass distribution and monetization channels used by pirates, so your content doesn't spread uncontrollably.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mt-16">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl">How DOPL Works</h2>
          <p className="text-brand-muted text-sm md:text-base mt-2.5">
            A simple, ongoing process that runs quietly in the background while you focus on creating.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.12)] text-brand-green flex items-center justify-center font-bold font-display mb-3.5">1</div>
            <h3 className="font-display font-bold text-base mb-2.5">Connect your content</h3>
            <p className="text-brand-muted text-[13px] md:text-sm leading-relaxed">Add your course links, files, or brand assets so DOPL knows exactly what to look for.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.12)] text-brand-green flex items-center justify-center font-bold font-display mb-3.5">2</div>
            <h3 className="font-display font-bold text-base mb-2.5">Continuous monitoring</h3>
            <p className="text-brand-muted text-[13px] md:text-sm leading-relaxed">DOPL scans Telegram channels, Discord servers, and file-hosting sites around the clock.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.12)] text-brand-green flex items-center justify-center font-bold font-display mb-3.5">3</div>
            <h3 className="font-display font-bold text-base mb-2.5">Automated disruption</h3>
            <p className="text-brand-muted text-[13px] md:text-sm leading-relaxed">Verified leaks trigger takedown requests and access-blocking actions automatically.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.12)] text-brand-green flex items-center justify-center font-bold font-display mb-3.5">4</div>
            <h3 className="font-display font-bold text-base mb-2.5">Track your impact</h3>
            <p className="text-brand-muted text-[13px] md:text-sm leading-relaxed">Get clear reports showing how piracy reach shrinks over time.</p>
          </div>
        </div>
      </section>

      {/* Two Column details */}
      <section className="mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <h3 className="font-display font-bold text-lg mb-2.5">Built for Independent Creators</h3>
            <p className="text-brand-muted text-sm mb-4">DOPL is designed for:</p>
            <ul className="flex flex-col gap-3.5">
              <li className="flex gap-2.5 items-start font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-green mt-1.5 flex-shrink-0"></span>
                <span>Course creators selling via their own platforms</span>
              </li>
              <li className="flex gap-2.5 items-start font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-green mt-1.5 flex-shrink-0"></span>
                <span>
                  High-ticket EdTech platforms &amp; studios
                  <span className="block text-brand-muted font-normal text-xs mt-0.5">losing direct revenue to encrypted channels</span>
                </span>
              </li>
              <li className="flex gap-2.5 items-start font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-green mt-1.5 flex-shrink-0"></span>
                <span>Digital product sellers tired of content leaks</span>
              </li>
            </ul>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <h3 className="font-display font-bold text-lg text-brand-green mb-4">Why Choose DOPL</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex gap-2.5 items-start text-sm font-medium">
                <span className="text-brand-green font-bold flex-shrink-0">✓</span>
                <span>Focused on real piracy channels (Telegram, Discord)</span>
              </li>
              <li className="flex gap-2.5 items-start text-sm font-medium">
                <span className="text-brand-green font-bold flex-shrink-0">✓</span>
                <span>Targets large-scale distribution, not just leaks</span>
              </li>
              <li className="flex gap-2.5 items-start text-sm font-medium">
                <span className="text-brand-green font-bold flex-shrink-0">✓</span>
                <span>Reduces piracy reach instead of chasing elimination</span>
              </li>
              <li className="flex gap-2.5 items-start text-sm font-medium">
                <span className="text-brand-green font-bold flex-shrink-0">✓</span>
                <span>Smart monitoring + action system (not just alerts)</span>
              </li>
              <li className="flex gap-2.5 items-start text-sm font-medium">
                <span className="text-brand-green font-bold flex-shrink-0">✓</span>
                <span>Built specifically for independent creators</span>
              </li>
            </ul>
            <p className="border-t border-brand-border mt-4.5 pt-3.5 text-brand-muted text-xs leading-relaxed">
              DOPL doesn't fight piracy blindly — it strategically limits its impact.
            </p>
          </div>
        </div>
      </section>

      {/* Everything You Need */}
      <section className="mt-16">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Everything You Need to Limit Piracy</h2>
          <p className="text-brand-muted text-sm md:text-base mt-2.5">
            DOPL combines monitoring, disruption, and reporting into one streamlined system.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <h3 className="font-display font-bold text-base mb-2.5">Telegram &amp; Discord monitoring</h3>
            <p className="text-brand-muted text-[13px] leading-relaxed">Track channels and servers known for distributing pirated course content.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <h3 className="font-display font-bold text-base mb-2.5">File-host scanning</h3>
            <p className="text-brand-muted text-[13px] leading-relaxed">Detect re-uploads across popular file-sharing and cloud storage platforms.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <h3 className="font-display font-bold text-base mb-2.5">Smart action queue</h3>
            <p className="text-brand-muted text-[13px] leading-relaxed">Review flagged leaks and trigger takedown requests with a single click.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <h3 className="font-display font-bold text-base mb-2.5">Mass distribution alerts</h3>
            <p className="text-brand-muted text-[13px] leading-relaxed">Get notified when a leak starts spreading at scale, not for every single copy.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <h3 className="font-display font-bold text-base mb-2.5">Reach reduction reports</h3>
            <p className="text-brand-muted text-[13px] leading-relaxed">See how quickly pirated copies are removed and how reach drops over time.</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <h3 className="font-display font-bold text-base mb-2.5">No legal expertise needed</h3>
            <p className="text-brand-muted text-[13px] leading-relaxed">DOPL handles the technical disruption process so you don't need a lawyer on retainer.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mt-16">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Simple Pricing for Independent Creators</h2>
          <p className="text-brand-muted text-sm md:text-base mt-2.5 font-medium">Start small, scale as your catalog grows.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Starter */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-8 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-lg">Starter</h3>
              <p className="text-brand-muted text-[13px] mt-1.5">For solo creators just getting started</p>
              <div className="font-display font-extrabold text-4xl my-4">
                $39<span className="text-sm font-medium text-brand-muted">/month</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-brand-muted text-sm my-5">
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Monitor up to 5 products</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Telegram &amp; Discord monitoring</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Monthly reach report</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Email alerts</li>
              </ul>
            </div>
            <button 
              onClick={() => setView('signup')}
              className="w-full text-center py-3 rounded-lg font-bold text-sm bg-transparent border border-brand-border text-brand-text hover:bg-[rgba(255,255,255,0.03)] hover:border-brand-muted transition"
            >
              Get Started
            </button>
          </div>

          {/* Growth */}
          <div className="bg-brand-card border-2 border-brand-green rounded-2xl p-8 backdrop-blur-md relative flex flex-col justify-between shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            <span className="absolute -top-3 left-7 bg-[rgba(34,197,94,0.15)] text-[#4ade80] text-[11px] font-bold px-3 py-1 rounded-full border border-[rgba(34,197,94,0.25)]">
              Most popular
            </span>
            <div>
              <h3 className="font-display font-bold text-lg">Growth</h3>
              <p className="text-brand-muted text-[13px] mt-1.5">For creators with an active piracy problem</p>
              <div className="font-display font-extrabold text-4xl my-4">
                $99<span className="text-sm font-medium text-brand-muted">/month</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-brand-muted text-sm my-5">
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Monitor up to 25 products</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Daily scans across all channels</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Automated takedown requests</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Weekly reach reports</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Priority support</li>
              </ul>
            </div>
            <button 
              onClick={() => setView('signup')}
              className="w-full text-center py-3 rounded-lg font-bold text-sm bg-brand-green text-[#06150c] hover:bg-brand-green-hover transition shadow-sm"
            >
              Get Started
            </button>
          </div>

          {/* Studio */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-8 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-lg">Studio</h3>
              <p className="text-brand-muted text-[13px] mt-1.5">For EdTech platforms and studios</p>
              <div className="font-display font-extrabold text-4xl my-4">Custom</div>
              <ul className="flex flex-col gap-2.5 text-brand-muted text-sm my-5">
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Unlimited products</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Dedicated monitoring setup</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Custom integrations</li>
                <li className="flex gap-2 items-center"><span className="text-brand-green font-bold">✓</span> Dedicated account manager</li>
              </ul>
            </div>
            <button 
              onClick={() => alert("Connecting with Sales team...")}
              className="w-full text-center py-3 rounded-lg font-bold text-sm bg-transparent border border-brand-border text-brand-text hover:bg-[rgba(255,255,255,0.03)] hover:border-brand-muted transition"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-16">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Creators Are Taking Back Control</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <p className="text-brand-text text-[13.5px] leading-relaxed mb-4">
              "Within a month, the number of active leak channels for my course dropped by more than half. I finally feel like I'm not fighting this alone."
            </p>
            <p className="text-brand-muted text-[12px] font-semibold">Online course creator, Marketing</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <p className="text-brand-text text-[13.5px] leading-relaxed mb-4">
              "I used to spend hours every week sending takedown requests myself. DOPL handles it now, and I just review the weekly summary."
            </p>
            <p className="text-brand-muted text-[12px] font-semibold">Independent instructor, Design</p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 backdrop-blur-md">
            <p className="text-brand-text text-[13.5px] leading-relaxed mb-4">
              "We rolled DOPL out across our catalog and saw mass-distribution channels shut down faster than our internal team ever could."
            </p>
            <p className="text-brand-muted text-[12px] font-semibold">Operations lead, EdTech studio</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16 max-w-[760px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Frequently Asked Questions</h2>
        </div>
        <div className="flex flex-col gap-3">
          <details className="group bg-brand-card border border-brand-border rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="font-semibold text-[15px] cursor-pointer list-none select-none flex justify-between items-center pr-1">
              <span>Will DOPL completely stop piracy of my content?</span>
              <span className="text-brand-green font-bold text-lg transition duration-200 group-open:rotate-45">+</span>
            </summary>
            <p className="text-brand-muted text-sm leading-relaxed mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
              No tool can guarantee that. DOPL focuses on disrupting the channels and accounts responsible for mass distribution, so leaks stop spreading at scale and lose their reach.
            </p>
          </details>
          <details className="group bg-brand-card border border-brand-border rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="font-semibold text-[15px] cursor-pointer list-none select-none flex justify-between items-center pr-1">
              <span>Which platforms does DOPL monitor?</span>
              <span className="text-brand-green font-bold text-lg transition duration-200 group-open:rotate-45">+</span>
            </summary>
            <p className="text-brand-muted text-sm leading-relaxed mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
              DOPL currently monitors Telegram channels and groups, Discord servers, and popular file-hosting and cloud storage sites where course content is commonly re-shared.
            </p>
          </details>
          <details className="group bg-brand-card border border-brand-border rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="font-semibold text-[15px] cursor-pointer list-none select-none flex justify-between items-center pr-1">
              <span>Do I need any legal knowledge to use DOPL?</span>
              <span className="text-brand-green font-bold text-lg transition duration-200 group-open:rotate-45">+</span>
            </summary>
            <p className="text-brand-muted text-sm leading-relaxed mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
              No. DOPL handles the technical detection and disruption process, so you don't need to draft takedown notices or understand DMCA procedures yourself.
            </p>
          </details>
          <details className="group bg-brand-card border border-brand-border rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="font-semibold text-[15px] cursor-pointer list-none select-none flex justify-between items-center pr-1">
              <span>How long does it take to see results?</span>
              <span className="text-brand-green font-bold text-lg transition duration-200 group-open:rotate-45">+</span>
            </summary>
            <p className="text-brand-muted text-sm leading-relaxed mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
              Most creators start seeing flagged channels and reduced reach within the first few weeks, depending on how widespread the existing leaks are.
            </p>
          </details>
          <details className="group bg-brand-card border border-brand-border rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="font-semibold text-[15px] cursor-pointer list-none select-none flex justify-between items-center pr-1">
              <span>Is DOPL suitable for large catalogs or teams?</span>
              <span className="text-brand-green font-bold text-lg transition duration-200 group-open:rotate-45">+</span>
            </summary>
            <p className="text-brand-muted text-sm leading-relaxed mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
              Yes. The Studio plan is built for EdTech platforms and teams with large catalogs, including dedicated setup and account support.
            </p>
          </details>
        </div>
      </section>

      {/* Bottom Banner */}
      <section className="mt-16">
        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.18)] rounded-2xl p-8 md:p-10 text-center">
          <p className="font-display font-bold text-[17px] md:text-lg">Piracy won't disappear. But with DOPL, it stops scaling.</p>
          <p className="text-[#4ade80] font-bold text-sm md:text-[15px] mt-2">If your revenue depends on paid access, DOPL is built for you.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-brand-border pb-10">
        <div className="flex flex-col md:flex-row justify-between gap-8 py-10">
          <div className="max-w-[280px]">
            <div className="flex items-center gap-2 font-display font-bold text-lg mb-3">
              <span className="w-7 h-7 bg-brand-green rounded flex items-center justify-center text-[#06150c] font-extrabold text-[13px]">D</span>
              DOPL
            </div>
            <p className="text-brand-muted text-xs leading-relaxed">
              DOPL helps independent course creators detect, disrupt, and reduce large-scale piracy across the platforms pirates rely on most.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-brand-text mb-4">Product</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-brand-muted">
                <li><a href="#" className="hover:text-brand-green">How it works</a></li>
                <li><a href="#" className="hover:text-brand-green">Features</a></li>
                <li><a href="#" className="hover:text-brand-green">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-brand-text mb-4">Company</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-brand-muted">
                <li><a href="#" className="hover:text-brand-green">About</a></li>
                <li><a href="#" className="hover:text-brand-green">Contact</a></li>
                <li><a href="#" className="hover:text-brand-green">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-brand-text mb-4">Legal</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-brand-muted">
                <li><a href="#" className="hover:text-brand-green">Privacy policy</a></li>
                <li><a href="#" className="hover:text-brand-green">Terms of service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center text-brand-muted text-[11px] pt-6 border-t border-brand-border">
          © 2026 DOPL. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
