import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState, DragEvent, ChangeEvent } from "react";
import toast from "react-hot-toast";

import api from "../lib/api";
import { formatFileSize } from "../lib/formatters";
import type { Document } from "../types";

const MAX_FILE_SIZE_FREE = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE_PRO = 10 * 1024 * 1024; // 10 MB

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (doc: Document) => void;
  userPlan?: "free" | "pro";
}

/**
 * Upload modal with drag-and-drop support.
 */
export default function UploadModal({ isOpen, onClose, onUploadComplete, userPlan = "free" }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = userPlan === "pro" ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;

  const resetForm = useCallback(() => {
    setFile(null);
    setTitle("");
    setIsUploading(false);
    setUploadProgress(0);
    setDragActive(false);
  }, []);

  function handleClose() {
    if (isUploading) return;
    resetForm();
    onClose();
  }

  function validateFile(selectedFile: File | undefined | null): selectedFile is File {
    if (!selectedFile) return false;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return false;
    }

    if (selectedFile.size > maxSize) {
      toast.error(`File size exceeds the ${formatFileSize(maxSize)} limit.`);
      return false;
    }

    return true;
  }

  function handleFileSelect(selectedFile: File) {
    if (!validateFile(selectedFile)) return;

    setFile(selectedFile);

    /* Auto-set title from filename (without .pdf extension) */
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.pdf$/i, "");
      setTitle(nameWithoutExt);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelect(selectedFile);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a document title.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());

    try {
      const { data } = await api.post<{ data: { document: Document } }>("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percent);
        }
      });

      toast.success("Document uploaded successfully!");
      resetForm();
      onUploadComplete(data.data.document);
      onClose();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Upload failed. Please try again.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-content max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button
            id="upload-modal-close"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleUpload}>
          {/* Drop zone */}
          <div
            className={`drop-zone ${dragActive ? "drag-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleInputChange}
              className="hidden"
              id="file-upload-input"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15">
                  <Upload className="h-6 w-6 text-cyan-400" />
                </div>
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm text-slate-400">
                  {formatFileSize(file.size)}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <Upload className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-300">
                    Drop your PDF here, or{" "}
                    <span className="text-cyan-400">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PDF only • Max {formatFileSize(maxSize)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Title input */}
          <div className="mt-4">
            <label
              htmlFor="document-title"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Document Title
            </label>
            <input
              id="document-title"
              type="text"
              className="form-input"
              placeholder="Enter a descriptive title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              disabled={isUploading}
            />
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !title.trim() || isUploading}
              className="btn-primary flex-1"
              id="upload-submit-btn"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
