import {
  ArrowLeft,
  FileText,
  Loader2,
  MessageSquare,
  Sparkles,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { Link, useParams } from "react-router-dom";

import ChatPanel from "../components/ChatPanel";
import api from "../lib/api";
import { formatDate, formatFileSize } from "../lib/formatters";
import type { Document } from "../types";

/**
 * Document viewer page with summary generation, extracted text, and AI chat panel.
 * Layout: Left side = document info + text, Right side = chat panel.
 */
export default function DocumentViewer() {
  const { documentId } = useParams();

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showText, setShowText] = useState(false);

  /* ── Fetch document ────────────────────── */
  useEffect(() => {
    if (!documentId) return;

    let cancelled = false;

    async function loadDocument() {
      try {
        const { data } = await api.get<{ data: { document: Document } }>(`/documents/${documentId}`);
        if (!cancelled) setDocument(data.data.document);
      } catch (error: any) {
        if (!cancelled) {
          const message = error.response?.data?.message || "Document not found.";
          toast.error(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  /* ── Generate summary ──────────────────── */
  async function handleGenerateSummary() {
    setIsSummarizing(true);

    try {
      const { data } = await api.post(`/ai/documents/${documentId}/summary`);

      setDocument((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          summary: data.data.summary,
          summaryGeneratedAt: data.data.summaryGeneratedAt || new Date().toISOString()
        };
      });

      toast.success("Summary generated!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate summary."
      );
    } finally {
      setIsSummarizing(false);
    }
  }

  /* ── Loading state ─────────────────────── */
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner spinner-lg" />
          <p className="text-sm text-slate-400">Loading document…</p>
        </div>
      </main>
    );
  }

  /* ── Not found state ───────────────────── */
  if (!document) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center pt-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-slate-600" />
        <h1 className="text-xl font-bold">Document not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          The document may have been deleted or you don't have access.
        </p>
        <Link to="/dashboard" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col pt-16 lg:flex-row">
      {/* ── Left Panel: Document Info ────── */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 ${
          showChat ? "hidden lg:block" : ""
        }`}
      >
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to documents
          </Link>

          {/* Document header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold sm:text-3xl">{document.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {document.pageCount} page{document.pageCount !== 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>{formatDate(document.createdAt)}</span>
            </div>
          </div>

          {/* Summary section */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                AI Summary
              </h2>
              {!document.summary && (
                <button
                  id="generate-summary-btn"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="btn-primary text-sm"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </button>
              )}
            </div>

            {document.summary ? (
              <div className="glass-card p-5">
                <div className="markdown-content text-sm leading-relaxed text-slate-300">
                  <Markdown>{document.summary}</Markdown>
                </div>
                {document.summaryGeneratedAt && (
                  <p className="mt-4 text-xs text-slate-600">
                    Generated {formatDate(document.summaryGeneratedAt)}
                  </p>
                )}
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center py-12 text-center">
                <Sparkles className="mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-400">
                  No summary yet. Click the button above to generate one with AI.
                </p>
              </div>
            )}
          </section>

          {/* Extracted text section */}
          <section>
            <button
              onClick={() => setShowText(!showText)}
              className="btn-secondary mb-4 text-sm"
              id="toggle-extracted-text"
            >
              <FileText className="h-4 w-4" />
              {showText ? "Hide" : "Show"} Extracted Text
              <span className="text-xs text-slate-500">
                ({document.textLength?.toLocaleString() || 0} chars)
              </span>
            </button>

            {showText && document.extractedText && (
              <div className="glass-card max-h-96 overflow-y-auto p-5">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-400">
                  {document.extractedText}
                </pre>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Chat toggle button (mobile) ──── */}
      <button
        id="toggle-chat-btn"
        onClick={() => setShowChat(!showChat)}
        className={`fixed right-4 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg lg:hidden ${
          showChat
            ? "bg-slate-700 text-white"
            : "bg-gradient-to-br from-cyan-500 to-violet-500 text-white"
        }`}
        aria-label={showChat ? "Close chat" : "Open chat"}
      >
        {showChat ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>

      {/* ── Right Panel: Chat ────────────── */}
      <div
        className={`border-l border-white/8 bg-[#0d0d22] ${
          showChat
            ? "fixed inset-0 top-16 z-20 lg:static"
            : "hidden lg:block"
        } lg:w-[420px] lg:shrink-0`}
      >
        {documentId && <ChatPanel documentId={documentId} />}
      </div>
    </main>
  );
}
