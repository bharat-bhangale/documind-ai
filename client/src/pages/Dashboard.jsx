import {
  FileText,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import UploadModal from "../components/UploadModal";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { formatDate, formatFileSize, truncate } from "../lib/formatters";

/**
 * Dashboard page — lists user documents with search, upload, and delete.
 */
export default function Dashboard() {
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* ── Fetch documents ───────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      try {
        const { data } = await api.get("/documents");
        if (!cancelled) setDocuments(data.data.documents || []);
      } catch {
        if (!cancelled) toast.error("Failed to load documents.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Delete document ───────────────────── */
  async function handleDelete(documentId, documentTitle) {
    if (!window.confirm(`Delete "${documentTitle}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(documentId);

    try {
      await api.delete(`/documents/${documentId}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      toast.success("Document deleted.");
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  }

  /* ── Handle upload complete ────────────── */
  function handleUploadComplete(newDocument) {
    setDocuments((prev) => [newDocument, ...prev]);
  }

  /* ── Filter documents by search query ──── */
  const filteredDocuments = documents.filter((doc) =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen px-4 pt-24 pb-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              My Documents
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {documents.length} document{documents.length !== 1 ? "s" : ""} •{" "}
              <span
                className={
                  user?.plan === "pro" ? "text-violet-400" : "text-slate-500"
                }
              >
                {user?.plan === "pro" ? "Pro" : "Free"} plan
              </span>
            </p>
          </div>

          <button
            id="upload-document-btn"
            onClick={() => setUploadModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Upload PDF
          </button>
        </div>

        {/* Search bar */}
        {documents.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="document-search"
                type="text"
                className="form-input pl-10"
                placeholder="Search documents…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Content area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="spinner spinner-lg" />
              <p className="text-sm text-slate-400">Loading documents…</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10">
              <FileText className="h-10 w-10 text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold">No documents yet</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Upload your first PDF to get started. AI summaries and chat will
              be available instantly after processing.
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn-primary mt-6"
            >
              <Plus className="h-4 w-4" />
              Upload your first document
            </button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          /* No search results */
          <div className="py-16 text-center">
            <Search className="mx-auto mb-4 h-8 w-8 text-slate-600" />
            <p className="text-slate-400">
              No documents match "{searchQuery}"
            </p>
          </div>
        ) : (
          /* Document grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                index={index}
                isDeleting={deletingId === doc.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        userPlan={user?.plan}
      />
    </main>
  );
}

/* ── Document Card ───────────────────────── */

function DocumentCard({ document: doc, index, isDeleting, onDelete }) {
  return (
    <div
      className="glass-card animate-fade-in group relative flex flex-col p-5"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15">
          <FileText className="h-5 w-5 text-cyan-400" />
        </div>

        <button
          onClick={() => onDelete(doc.id, doc.title)}
          disabled={isDeleting}
          className="rounded-lg p-1.5 text-slate-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
          aria-label={`Delete ${doc.title}`}
          title="Delete document"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Title and meta */}
      <Link
        to={`/documents/${doc.id}`}
        className="flex flex-1 flex-col"
      >
        <h3 className="mb-1 line-clamp-2 font-semibold leading-snug text-white hover:text-cyan-300 transition-colors">
          {truncate(doc.title, 80)}
        </h3>

        <p className="mb-3 text-xs text-slate-500">
          {doc.pageCount} page{doc.pageCount !== 1 ? "s" : ""} •{" "}
          {formatFileSize(doc.fileSize)}
        </p>

        {/* Summary preview */}
        {doc.summary ? (
          <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-slate-400">
            {doc.summary}
          </p>
        ) : (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-600">
            <Sparkles className="h-3 w-3" />
            No summary yet — open to generate
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto border-t border-white/5 pt-3 text-xs text-slate-600">
          Uploaded {formatDate(doc.createdAt)}
        </div>
      </Link>
    </div>
  );
}
