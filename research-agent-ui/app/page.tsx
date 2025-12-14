import ResearchInterface from '@/components/ResearchInterface';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto p-6 md:p-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-2xl" />
              <h1 className="relative font-heading text-6xl md:text-8xl font-bold bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent pb-2">
                Galileo Research
              </h1>
            </div>
          </div>

          <p className="font-mono text-amber-700/80 text-sm md:text-base tracking-wider mb-6">
            Multi-Step AI Research Assistant
          </p>

          <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-deep-900/50 border border-amber-700/30 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-amber-600 font-mono">Live</span>
            </div>
            <div className="w-px h-4 bg-amber-700/30" />
            <div className="flex items-center gap-4 text-xs text-amber-700/60 font-mono">
              <span>GPT-4o-mini</span>
              <span>•</span>
              <span>LangGraph</span>
              <span>•</span>
              <span>Galileo</span>
            </div>
          </div>
        </header>

        {/* Main Interface */}
        <ResearchInterface />

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-amber-700/10 text-center">
          <div className="flex items-center justify-center gap-6 text-amber-900/40 font-mono text-xs mb-4">
            <a href="https://galileo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">
              Galileo Platform
            </a>
            <span>•</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors">
              View Source
            </a>
            <span>•</span>
            <span>Built with Next.js</span>
          </div>
          <p className="text-amber-900/30 text-xs font-mono">
            Powered by OpenAI • Deployed on Vercel
          </p>
        </footer>
      </div>
    </main>
  );
}
