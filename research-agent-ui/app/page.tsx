'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';

import ResearchInterface, { ResearchInterfaceHandle } from '@/components/ResearchInterface';

type Attachment = {
  clientId: string;
  filename: string;
  status: 'uploading' | 'ready' | 'error';
  documentId?: string;
  errorMessage?: string;
};

type StoredDocument = {
  id: string;
  filename: string;
  file_size?: number;
  file_type?: string;
  num_chunks?: number;
  uploaded_at?: string;
  status?: string;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function ResearchWorkspace() {
  const researchRef = useRef<ResearchInterfaceHandle>(null);
  const [heroQuery, setHeroQuery] = useState('');
  const [isHeroRunning, setIsHeroRunning] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useChatHistory, setUseChatHistory] = useState(true);
  const [chatSessionId, setChatSessionId] = useState<string | undefined>(undefined);
  const { user } = useUser();
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(true);
  const [workflowStep, setWorkflowStep] = useState<'idle' | 'plan' | 'search' | 'analyze' | 'synthesize' | 'validate'>('idle');

  const readyDocumentIds = attachments
    .filter((attachment) => attachment.status === 'ready' && attachment.documentId)
    .map((attachment) => attachment.documentId as string);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsDocsLoading(true);
      const response = await fetch('/api/documents', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      const data = await response.json();
      setDocuments(Array.isArray(data?.documents) ? data.documents : []);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setIsDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroQuery.trim();
    if (!trimmed || isHeroRunning) return;
    researchRef.current?.submitQuestion(trimmed);
    setHeroQuery('');
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const clientId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    setAttachments((prev) => [
      ...prev,
      {
        clientId,
        filename: file.name,
        status: 'uploading',
      },
    ]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Upload failed';
        try {
          const errorData = await response.json();
          message = errorData?.error || message;
        } catch (jsonError) {
          console.error('Upload JSON parse error:', jsonError);
        }
        throw new Error(message);
      }

      const data = await response.json();
      setAttachments((prev) => prev.map((attachment) => (
        attachment.clientId === clientId
          ? {
              ...attachment,
              status: 'ready',
              documentId: data.document_id,
              errorMessage: undefined,
            }
          : attachment
      )));
      await fetchDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setAttachments((prev) => prev.map((attachment) => (
        attachment.clientId === clientId
          ? {
              ...attachment,
              status: 'error',
              errorMessage: message,
            }
          : attachment
      )));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (clientId: string, documentId?: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.clientId !== clientId));

    if (documentId) {
      try {
        await fetch(`/api/documents/${documentId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      } catch (error) {
        console.error('Failed to delete document', error);
      }
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      setAttachments((prev) => prev.filter((att) => att.documentId !== documentId));
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  const userLabel = user?.primaryEmailAddress?.emailAddress
    || user?.emailAddresses?.[0]?.emailAddress
    || user?.username
    || 'Signed in';


  return (
    <div className="relative flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-6 md:px-8 lg:px-12 pt-6">
        <div className="flex justify-end">
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span className="rounded-full border border-white/10 bg-black/30 px-4 py-1.5 font-medium">
              {userLabel}
            </span>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'ring-2 ring-white/20' } }} />
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 lg:px-12 pt-8">
        <div className="max-w-5xl mx-auto pb-32 space-y-8">
          <div className="rounded-[30px] border border-white/10 bg-[#0a0a0a]/90 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur">
            <form onSubmit={handleHeroSubmit} className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/40 font-mono">
                <span>Ask anything</span>
                <button
                  type="button"
                  onClick={() => setUseChatHistory((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-full border text-[0.6rem] tracking-wide transition-colors duration-200 ${useChatHistory ? 'border-white/40 bg-white/10 text-white' : 'border-white/20 text-white/60 hover:text-white/80 hover:border-white/40'}`}
                >
                  Chat history {useChatHistory ? 'On' : 'Off'}
                </button>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#1b1b1b] px-5 py-4 flex items-center gap-4">
                <textarea
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Ask Galileo to create a research brief..."
                  className="flex-1 bg-transparent resize-none text-base text-white/80 focus:outline-none"
                  rows={2}
                  disabled={isHeroRunning}
                />
                <button
                  type="submit"
                  disabled={isHeroRunning || !heroQuery.trim()}
                  className="h-11 w-11 rounded-[20px] border border-white/20 text-white flex items-center justify-center disabled:opacity-40 transition-colors duration-200 hover:border-white/60"
                >
                  ↑
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <button
                  type="button"
                  onClick={handleAttachClick}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 bg-black/40 text-sm font-normal transition-colors duration-200 hover:border-white/30 hover:bg-black/60"
                >
                  <span className="text-lg leading-none">+</span>
                  Attach document
                </button>
                <div className="flex-1 min-w-[120px] text-[0.7rem] uppercase tracking-[0.25em] text-white/40">
                  {readyDocumentIds.length ? `${readyDocumentIds.length} docs ready` : 'Attach documents'}
                </div>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2 text-sm text-white/70">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.clientId}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-white/80">{attachment.filename}</p>
                        {attachment.status === 'uploading' && (
                          <p className="text-xs text-white/50">Uploading...</p>
                        )}
                        {attachment.status === 'ready' && (
                          <p className="text-xs text-emerald-400">Ready for RAG</p>
                        )}
                        {attachment.status === 'error' && (
                          <p className="text-xs text-red-400">{attachment.errorMessage}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment.clientId, attachment.documentId)}
                        className="text-xs text-white/60 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-mono mt-4">
                  Your documents
                </p>
                {isDocsLoading && (
                  <p className="text-xs text-white/50">Loading documents…</p>
                )}
                {!isDocsLoading && documents.length === 0 && (
                  <p className="text-xs text-white/50">No documents uploaded yet.</p>
                )}
                {!isDocsLoading && documents.length > 0 && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-white/80">{doc.filename}</p>
                          <p className="text-xs text-white/50">
                            {formatFileSize(doc.file_size)} • {doc.status ?? 'ready'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-xs text-white/60 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-[40px] border border-white/10 bg-black/40/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur space-y-4">
            <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.4em] text-white/50 font-mono">
              {['plan','search','analyze','synthesize','validate'].map((step) => (
                <div
                  key={step}
                  className={`flex-1 text-center py-1 rounded-full border border-white/10 ${workflowStep === step ? 'bg-white/10 text-white border-white/30' : 'text-white/40'}`}
                >
                  {step}
                </div>
              ))}
            </div>
            <ResearchInterface
              ref={researchRef}
              showLocalInput={false}
              onStatusChange={setIsHeroRunning}
              onStepChange={(step) => setWorkflowStep(step as typeof workflowStep)}
              attachedDocumentIds={readyDocumentIds}
              useChatHistory={useChatHistory}
              chatSessionId={chatSessionId}
              onSessionUpdate={setChatSessionId}
            />
          </div>
          <p className="text-center text-xs uppercase tracking-[0.4em] text-white/40 font-mono">
            Powered by <Link href="https://galileo.ai" className="underline">Galileo RAG Observability</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthGate() {
  return (
    <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-black/40 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-white/40 font-mono">Galileo Research Stack</p>
      <h1 className="mt-4 text-3xl font-semibold">Sign in to continue</h1>
      <p className="mt-3 text-sm text-white/70">
        Securely upload documents, run evaluations, and keep chat history scoped to your workspace.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <SignInButton mode="modal">
          <button className="w-full rounded-2xl bg-white text-black py-3 font-semibold tracking-wide">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="w-full rounded-2xl border border-white/20 py-3 font-semibold tracking-wide text-white">
            Create account
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#111111] to-[#1a1a1a] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(50,50,50,0.25),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(40,40,40,0.35),_transparent_50%)]" />
        </div>

        <SignedOut>
          <div className="relative flex min-h-screen items-center justify-center px-6">
            <AuthGate />
          </div>
        </SignedOut>

        <SignedIn>
          <ResearchWorkspace />
        </SignedIn>
      </div>
    </main>
  );
}
