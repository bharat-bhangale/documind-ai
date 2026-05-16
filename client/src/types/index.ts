export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  authProvider: "local" | "google" | "local_google";
  plan: "free" | "pro";
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  textLength: number;
  status: "ready";
  summary: string;
  summaryGeneratedAt?: string;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
