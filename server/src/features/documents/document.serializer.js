export function serializeDocument(document, { includeText = false } = {}) {
  const serialized = {
    id: document.id,
    title: document.title,
    originalName: document.originalName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    pageCount: document.pageCount,
    textLength: document.textLength,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  };

  if (includeText) {
    serialized.extractedText = document.extractedText;
  }

  return serialized;
}

