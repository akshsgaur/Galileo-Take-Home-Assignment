'use client';

import { forwardRef, useState, useEffect, useImperativeHandle, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type StepStatus = 'pending' | 'active' | 'completed';

interface Step {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  latency?: number;
  score?: number;
  content?: string;
}

interface Source {
  title: string;
  url: string;
  snippet: string;
  confidence?: number;
  source_type?: string;
  domain?: string;
  reason?: string;
}

interface ResearchResult {
  answer: string;
  plan: string;
  insights: string;
  metrics: any[];
  sources?: Source[];
  trace_id?: string;
  trace_url?: string;
}

export interface ResearchInterfaceHandle {
  submitQuestion: (query: string) => void;
}

interface ResearchInterfaceProps {
  showLocalInput?: boolean;
  onStatusChange?: (isRunning: boolean) => void;
}

function ResearchInterface(
  { showLocalInput = true, onStatusChange }: ResearchInterfaceProps,
  ref: React.Ref<ResearchInterfaceHandle>
) {
  const [question, setQuestion] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'answer' | 'sources' | 'metrics'>('answer');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'plan',
      name: 'Strategic Planning',
      description: 'Crafting research methodology',
      status: 'pending',
    },
    {
      id: 'search',
      name: 'Source Discovery',
      description: 'Gathering relevant information',
      status: 'pending',
    },
    {
      id: 'analyze',
      name: 'Deep Analysis',
      description: 'Extracting critical insights',
      status: 'pending',
    },
    {
      id: 'synthesize',
      name: 'Synthesis',
      description: 'Composing comprehensive answer',
      status: 'pending',
    },
  ]);

  const executeResearch = useCallback(async (incoming?: string) => {
    const targetQuestion = (incoming ?? question).trim();
    if (!targetQuestion || isResearching) return;

    if (incoming) {
      setQuestion(incoming);
    }

    setIsResearching(true);
    setResult(null);
    setActiveTab('answer');

    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' as StepStatus, latency: undefined, score: undefined, content: undefined })));

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: targetQuestion }),
      });

      if (!response.ok) throw new Error('Research failed');
      const data = await response.json();

      const stepSequence = ['plan', 'search', 'analyze', 'synthesize'];

      for (let i = 0; i < stepSequence.length; i++) {
        const stepId = stepSequence[i];

        setSteps(prev => prev.map(s =>
          s.id === stepId ? { ...s, status: 'active' as StepStatus } : s
        ));

        await new Promise(resolve => setTimeout(resolve, 1200));

        const stepMetric = data.metrics?.find((m: any) => m.step === stepId);
        setSteps(prev => prev.map(s =>
          s.id === stepId
            ? {
                ...s,
                status: 'completed' as StepStatus,
                latency: stepMetric?.latency,
                score: stepMetric?.quality_score || stepMetric?.relevance_score || stepMetric?.completeness_score,
                content: stepId === 'plan' ? data.plan : stepId === 'analyze' ? data.insights : undefined,
              }
            : s
        ));

        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setResult(data);
    } catch (error) {
      console.error('Research error:', error);
      alert('Research failed. Make sure the Python backend is running.');
    } finally {
      setIsResearching(false);
    }
  }, [question, isResearching]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeResearch();
  };

  const totalLatency = result?.metrics?.reduce((sum: number, m: any) => sum + (m.latency || 0), 0) || 0;
  const scoreData = (result?.metrics || [])
    .map((m: any) => m.quality_score || m.relevance_score || m.completeness_score || m.grounded_score)
    .filter((score: number | undefined) => typeof score === 'number');
  const avgScore = scoreData.length > 0
    ? scoreData.reduce((sum: number, val: number) => sum + val, 0) / scoreData.length
    : 0;

  const copyToClipboard = async () => {
    if (!result?.answer) return;
    try {
      await navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportAsMarkdown = () => {
    if (!result) return;
    const markdown = `# Research: ${question}\n\n## Answer\n\n${result.answer}\n\n## Plan\n\n${result.plan}\n\n## Insights\n\n${result.insights}\n\n## Metrics\n\n${result.metrics.map(m => `- **${m.step}**: ${m.latency.toFixed(2)}s (score: ${m.quality_score || m.relevance_score || m.completeness_score}/10)`).join('\n')}`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && question.trim() && !isResearching) {
        e.preventDefault();
        handleSubmit(new Event('submit') as any);
      }
      // Cmd/Ctrl + K to focus textarea
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('textarea')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, isResearching]);

  useEffect(() => {
    onStatusChange?.(isResearching);
  }, [isResearching, onStatusChange]);

  useImperativeHandle(ref, () => ({ submitQuestion: (query: string) => executeResearch(query) }), [executeResearch]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[80vh]">
      {/* Left Panel - Input & Steps */}
      <div className="lg:col-span-5 space-y-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl blur-2xl" />

          <div className="relative bg-slate-deep-900/70 backdrop-blur-xl border border-amber-700/30 rounded-2xl p-8 shadow-2xl min-h-[260px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-heading text-xl font-bold text-amber-400">Research Query</h2>
            </div>

            {showLocalInput ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-5 flex-1">
                  <div className="relative">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Explore any topic in depth..."
                      className="w-full bg-slate-deep-950/80 border-2 border-amber-700/40 rounded-xl px-5 py-4 text-parchment placeholder-amber-900/40 font-mono text-sm min-h-[140px] resize-none focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                      disabled={isResearching}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <span className="text-xs text-amber-900/30 font-mono hidden sm:block">
                        {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+↵ to submit
                      </span>
                      <span className="text-xs text-amber-900/40 font-mono">
                        {question.length} chars
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResearching || !question.trim()}
                    className="w-full group relative overflow-hidden px-8 py-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-ink font-heading font-bold text-lg rounded-xl hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-amber-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-600"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isResearching ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Researching...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Initiate Research
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </button>
                </form>

                {/* Quick Examples */}
                {!isResearching && !result && (
                  <div className="mt-6 pt-6 border-t border-amber-700/20">
                    <p className="text-xs text-amber-900/60 font-mono mb-3">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {['AI observability trends', 'RAG best practices', 'LLM evaluation methods'].map((example) => (
                        <button
                          key={example}
                          onClick={() => executeResearch(example)}
                          className="text-xs px-3 py-1.5 bg-slate-deep-950/50 hover:bg-amber-900/20 border border-amber-700/30 hover:border-amber-600/50 rounded-full text-amber-400/80 hover:text-amber-300 transition-colors font-mono"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-amber-200/70 font-mono text-sm">
                Use the hero prompt above to start new research runs.
              </div>
            )}
          </div>
        </motion.div>

        {/* Research Steps */}
        <AnimatePresence>
          {(isResearching || result) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="font-heading text-lg font-semibold text-amber-400">Research Pipeline</h3>
              </div>

              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative group overflow-hidden rounded-xl border transition-all duration-500
                    ${step.status === 'completed'
                      ? 'border-amber-600/50 bg-slate-deep-900/60 cursor-pointer hover:border-amber-500/70'
                      : step.status === 'active'
                      ? 'border-amber-500/70 bg-amber-500/5'
                      : 'border-amber-700/20 bg-slate-deep-900/30'
                    }
                  `}
                  onClick={() => step.status === 'completed' && step.content && setExpandedStep(expandedStep === step.id ? null : step.id)}
                >
                  {/* Animated border gradient */}
                  {step.status === 'active' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent animate-shimmer" />
                  )}

                  <div className="relative p-4 flex items-center gap-4">
                    {/* Step Icon */}
                    <div className={`
                      relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-mono text-sm font-bold transition-all duration-300
                      ${step.status === 'completed'
                        ? 'bg-amber-600/30 text-amber-200 ring-2 ring-amber-600/50'
                        : step.status === 'active'
                        ? 'bg-amber-500/20 text-amber-300 ring-2 ring-amber-500 animate-pulse-slow'
                        : 'bg-slate-deep-950/50 text-amber-700 ring-1 ring-amber-700/30'
                      }
                    `}>
                      {step.status === 'completed' ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-heading font-semibold text-amber-300 text-sm">
                          {step.name}
                        </h4>
                        {step.latency && (
                          <span className="text-xs font-mono text-amber-600">
                            {step.latency.toFixed(2)}s
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-900/70 font-mono">
                        {step.description}
                      </p>
                    </div>

                    {/* Score Badge */}
                    {step.score && (
                      <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-900/20 border border-amber-700/30">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-bold text-amber-400">{step.score}</span>
                        </div>
                      </div>
                    )}

                    {/* Expand icon */}
                    {step.status === 'completed' && step.content && (
                      <motion.div
                        animate={{ rotate: expandedStep === step.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedStep === step.id && step.content && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-amber-700/20">
                          <p className="text-sm text-parchment/80 font-mono leading-relaxed whitespace-pre-wrap">
                            {step.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel - Results */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {result && !isResearching ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-900/20 border border-amber-600/30 p-4"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <p className="text-xs font-mono text-amber-600 mb-1">Total Time</p>
                    <p className="text-2xl font-bold text-amber-400 font-heading">{totalLatency.toFixed(1)}s</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-900/20 border border-amber-600/30 p-4"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <p className="text-xs font-mono text-amber-600 mb-1">Avg Quality</p>
                    <p className="text-2xl font-bold text-amber-400 font-heading">{avgScore.toFixed(1)}/10</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-900/20 border border-amber-600/30 p-4"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <p className="text-xs font-mono text-amber-600 mb-1">Steps</p>
                    <p className="text-2xl font-bold text-amber-400 font-heading">4/4</p>
                  </div>
                </motion.div>
              </div>

              {/* Tabs */}
              <div className="flex justify-between items-center border-b border-amber-700/20">
                <div className="flex gap-2">
                  {(['answer', 'sources', 'metrics'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        relative px-6 py-3 font-heading font-semibold text-sm transition-all duration-300
                        ${activeTab === tab
                          ? 'text-amber-400'
                          : 'text-amber-900/60 hover:text-amber-600'
                        }
                      `}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-slate-deep-900/50 hover:bg-amber-900/20 border border-amber-700/30 hover:border-amber-600/50 transition-all group"
                    title="Copy answer"
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-amber-600 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={exportAsMarkdown}
                    className="p-2 rounded-lg bg-slate-deep-900/50 hover:bg-amber-900/20 border border-amber-700/30 hover:border-amber-600/50 transition-all group"
                    title="Export as Markdown"
                  >
                    <svg className="w-4 h-4 text-amber-600 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  {result?.trace_url && (
                    <a
                      href={result.trace_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-600/40 hover:border-amber-400/60 transition-all group"
                      title={result.trace_id ? `Open trace ${result.trace_id}` : 'Open in Galileo'}
                    >
                      <span className="flex items-center gap-2 text-amber-300 text-xs font-mono">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-1.414-9.414L21 3m0 0v6m0-6h-6" />
                        </svg>
                        View in Galileo
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'answer' && (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="relative rounded-2xl bg-slate-deep-900/50 backdrop-blur-sm border border-amber-700/30 p-8">
                      <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />

                      <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h2 className="font-heading text-2xl font-bold text-amber-400">Research Findings</h2>
                        </div>

                        <div className="prose prose-invert prose-amber max-w-none text-parchment/90 leading-relaxed">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-heading font-bold text-amber-400 mb-4 mt-6" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-heading font-bold text-amber-400 mb-3 mt-5" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-heading font-semibold text-amber-400 mb-2 mt-4" {...props} />,
                              p: ({node, ...props}) => <p className="mb-4 text-[15px]" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                              li: ({node, ...props}) => <li className="text-parchment/90" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-amber-300" {...props} />,
                              code: ({node, ...props}) => <code className="bg-slate-deep-950/50 px-1.5 py-0.5 rounded text-amber-400 font-mono text-sm" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-700/50 pl-4 italic text-amber-900/80 my-4" {...props} />,
                            }}
                          >
                            {result.answer}
                          </ReactMarkdown>
                        </div>

                        {result.sources && result.sources.length > 0 && (
                          <div className="mt-10 border-t border-amber-700/30 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 0V5m0 7v7" />
                              </svg>
                              <span className="font-heading text-sm uppercase tracking-[0.3em] text-amber-400/80">Sources cited</span>
                            </div>
                            <div className="space-y-3">
                              {result.sources.map((source, index) => (
                                <a
                                  key={`${source.url}-${index}`}
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block p-4 rounded-xl border border-amber-700/30 hover:border-amber-500/60 bg-slate-deep-950/40 group transition-colors"
                                >
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="font-heading text-base text-amber-300 group-hover:text-amber-200 line-clamp-2">{source.title}</h3>
                                <span className="text-xs text-amber-900/60">Open ↗</span>
                              </div>
                              {source.snippet && (
                                <p className="mt-1 text-sm text-parchment/75 line-clamp-2">{source.snippet}</p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-amber-300/80">
                                {source.source_type && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-900/20 border border-amber-700/30 uppercase tracking-wider">
                                    {source.source_type}
                                  </span>
                                )}
                                {typeof source.confidence === 'number' && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-deep-950/60 border border-amber-700/20">
                                    Confidence: {Math.round(source.confidence * 100)}%
                                  </span>
                                )}
                                {source.domain && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-deep-950/40 border border-amber-700/20">
                                    {source.domain}
                                  </span>
                                )}
                              </div>
                              {source.reason && (
                                <p className="mt-1 text-xs text-amber-900/70">{source.reason}</p>
                              )}
                            </a>
                          ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'sources' && (
                  <motion.div
                    key="sources"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {result.sources && result.sources.length > 0 ? (
                      result.sources.map((source: Source, index: number) => (
                        <motion.a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="block group relative overflow-hidden rounded-xl bg-slate-deep-900/50 border border-amber-700/30 hover:border-amber-600/50 p-5 transition-all duration-300 hover:bg-slate-deep-900/70"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-900/20 border border-amber-700/30 flex items-center justify-center group-hover:bg-amber-900/30 transition-colors">
                              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading font-semibold text-amber-300 mb-2 group-hover:text-amber-200 transition-colors">
                                {source.title}
                              </h4>
                              <p className="text-sm text-amber-900/70 font-mono mb-2 line-clamp-2">
                                {source.snippet}
                              </p>
                              <p className="text-xs text-amber-700/60 font-mono truncate">
                                {source.url}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-amber-300/80">
                                {source.source_type && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-900/20 border border-amber-700/30 uppercase tracking-wider">
                                    {source.source_type}
                                  </span>
                                )}
                                {typeof source.confidence === 'number' && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-deep-950/60 border border-amber-700/20">
                                    Confidence: {Math.round(source.confidence * 100)}%
                                  </span>
                                )}
                                {source.domain && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-deep-950/40 border border-amber-700/20">
                                    {source.domain}
                                  </span>
                                )}
                              </div>
                              {source.reason && (
                                <p className="mt-1 text-xs text-amber-900/70">{source.reason}</p>
                              )}
                            </div>
                          </div>

                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.a>
                      ))
                    ) : (
                      <div className="text-center py-12 text-amber-900/40 font-mono text-sm">
                        No sources available for this research.
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'metrics' && (
                  <motion.div
                    key="metrics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {result.metrics?.map((metric: any, index: number) => (
                      <motion.div
                        key={metric.step}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-xl bg-slate-deep-900/50 border border-amber-700/30 p-6"
                      >
                        <h4 className="font-heading font-semibold text-amber-400 mb-4 capitalize">
                          {metric.step} Metrics
                        </h4>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-amber-900/70 font-mono">Latency</span>
                            <span className="text-lg font-bold text-amber-300 font-mono">
                              {metric.latency?.toFixed(2)}s
                            </span>
                          </div>

                          {(metric.quality_score || metric.relevance_score || metric.completeness_score || metric.grounded_score) && (
                            <>
                              <div className="h-px bg-amber-700/20" />
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-amber-900/70 font-mono">Score</span>
                                <span className="text-lg font-bold text-amber-300 font-mono">
                                  {(metric.quality_score || metric.relevance_score || metric.completeness_score || metric.grounded_score)}/10
                                </span>
                              </div>
                            </>
                          )}

                          {/* Score visualization */}
                          <div className="mt-4">
                            <div className="h-2 bg-slate-deep-950/50 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((metric.quality_score || metric.relevance_score || metric.completeness_score || metric.grounded_score || 0) / 10) * 100}%` }}
                                transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4 text-xs text-amber-300/80">
                            {typeof metric.num_sources === 'number' && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-deep-950/40 border border-amber-700/20">
                                Sources: {metric.num_sources}
                              </span>
                            )}
                            {typeof metric.avg_confidence === 'number' && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-deep-950/60 border border-amber-700/30">
                                Avg confidence: {Math.round(metric.avg_confidence * 100)}%
                              </span>
                            )}
                          </div>

                          {metric.reasoning && (
                            <p className="text-sm text-amber-900/70 mt-3">{metric.reasoning}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center space-y-6 max-w-md">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse-slow" />
                  <div className="relative w-full h-full rounded-full border-2 border-amber-700/30 flex items-center justify-center">
                    <svg className="w-16 h-16 text-amber-700/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-amber-400/60 mb-2">
                    Ready to Research
                  </h3>
                  <p className="text-amber-900/40 font-mono text-sm">
                    Enter your question to begin the research process
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default forwardRef(ResearchInterface);
