'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import ResearchInterface, { ResearchInterfaceHandle } from '@/components/ResearchInterface';

export default function Home() {
  const researchRef = useRef<ResearchInterfaceHandle>(null);
  const [heroQuery, setHeroQuery] = useState('');
  const [isHeroRunning, setIsHeroRunning] = useState(false);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroQuery.trim();
    if (!trimmed || isHeroRunning) return;
    researchRef.current?.submitQuestion(trimmed);
    setHeroQuery('');
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="relative overflow-hidden">
        {/* Radial gradients to mimic Lovable hero */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#11152a] to-[#f26b21] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,93,255,0.35),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(242,107,33,0.45),_transparent_50%)]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 md:px-8 lg:px-12">
          {/* Hero */}
          <section className="pt-24 pb-32 text-center">
            <p className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center justify-center gap-4">
              <span>Research with</span>
              <img src="/galileo_ai_logo.jpeg" alt="Galileo" className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
              <span className="text-white">confidence</span>
            </p>
            <p className="mt-4 text-lg text-white/75">
              Create observability-ready research experiences just by chatting with AI.
            </p>

            {/* Prompt card */}
            <form onSubmit={handleHeroSubmit} className="mx-auto mt-16 max-w-3xl rounded-[30px] bg-[#1b1b1b] border border-white/10 shadow-[0_15px_60px_rgba(5,5,5,0.45)]">
              <div className="px-8 pt-6 pb-4 text-left text-white/80 text-xl font-medium">
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Ask Galileo to create a research brief..."
                  className="w-full bg-transparent border-0 focus:outline-none text-white/80 text-xl"
                  disabled={isHeroRunning}
                />
              </div>
              <div className="px-8 pb-6 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <div className="flex items-center gap-3">
                  <button type="button" className="h-8 w-8 rounded-full border border-white/15 flex items-center justify-center text-lg text-white/80 bg-black/30 font-normal">
                    +
                  </button>
                  <button type="button" className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 bg-black/30 text-base font-normal">
                    Attach
                  </button>
                  {/* <button type="button" className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 bg-black/30">
                    <span className="text-sm font-semibold uppercase tracking-wide">Theme</span>
                    <span className="text-xs">▼</span>
                  </button> */}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-3">
                  <button type="button" className="flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-white text-base font-normal">
                    Chat
                  </button>
                  <button
                    type="submit"
                    disabled={isHeroRunning || !heroQuery.trim()}
                    className="h-8 w-8 rounded-full border border-white/30 text-white text-base flex items-center justify-center disabled:opacity-50"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

        {/* Gradient divider */}
        <div className="h-32 bg-gradient-to-b from-transparent via-[#f26b21]/30 to-[#050505]" />
      </div>

      {/* Research experience */}
      <section className="relative z-10 -mt-16 pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="rounded-[40px] bg-black/60 border border-white/10 shadow-[0_20px_120px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-8 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/40 font-mono">Launch-pad</p>
                <h2 className="text-3xl md:text-4xl font-semibold mt-2">
                  Explore the research pipeline live
                </h2>
                <p className="text-white/70 mt-4 max-w-xl">
                  Same functionality as before—Plan → Search → Curate → Analyze → Synthesize → Validate—with fresh hero polish inspired by the Lovable reference.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="#research-playground"
                  className="px-5 py-3 rounded-full border border-white/20 text-sm text-white/80 hover:text-white"
                >
                  View docs
                </Link>
                <a
                  href="https://app.galileo.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full bg-white text-[#050505] font-semibold text-sm"
                >
                  Open Galileo
                </a>
              </div>
            </div>

            <div id="research-playground" className="bg-[#080808] px-4 pb-12 md:px-8">
              <ResearchInterface ref={researchRef} showLocalInput={false} onStatusChange={setIsHeroRunning} />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-white/60 text-sm">
        <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs uppercase tracking-[0.2em]">
          <span>© {new Date().getFullYear()} Galileo Studio</span>
          <span>•</span>
          <span>Powered by Galileo + OpenAI</span>
          <span>•</span>
          <span>Built with Next.js</span>
        </div>
      </footer>
    </main>
  );
}
