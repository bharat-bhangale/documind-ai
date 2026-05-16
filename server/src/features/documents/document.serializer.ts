import type { DocumentDocument, SerializedDocument } from "../../types/index.js";

interface SerializeOptions {
  includeText?: boolean;
}

export function serializeDocument(document: DocumentDocument, { includeText = false }: SerializeOptions = {}): SerializedDocument {
  const serialized: SerializedDocument = {
    id: document.id,
    title: document.title,
    originalName: document.originalName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    pageCount: document.pageCount,
    textLength: document.textLength,
    status: document.status,
    summary: document.summary,
    summaryGeneratedAt: document.summaryGeneratedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  };

  if (includeText) {
    serialized.extractedText = document.extractedText;
  }

  return serialized;
}
