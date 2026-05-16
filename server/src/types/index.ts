import type { Document, Types, HydratedDocument } from "mongoose";

/**
 * Express Request augmentation — adds `auth` and `user` fields
 * populated by the `requireAuth` middleware.
 */
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        tokenPayload: AccessTokenPayload;
      };
      user?: UserDocument;
    }
  }
}

/* ── JWT Payloads ────────────────────────── */

export interface AccessTokenPayload {
  sub: string;
  email: string;
  plan: string;
  type: "access";
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refresh";
  iat: number;
  exp: number;
}

/* ── User ────────────────────────────────── */

export interface RefreshTokenEntry {
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface AiUsage {
  dailyCount: number;
  lastResetAt: Date;
}

export type AuthProvider = "local" | "google" | "local_google";
export type UserPlan = "free" | "pro";

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl: string;
  authProvider: AuthProvider;
  plan: UserPlan;
  refreshTokens: RefreshTokenEntry[];
  aiUsage: AiUsage;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMethods {
  setPassword(password: string): Promise<void>;
  comparePassword(password: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, UserMethods>;

export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  authProvider: AuthProvider;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Document ────────────────────────────── */

export type DocumentStatus = "ready";

export interface IDocument {
  owner: Types.ObjectId;
  title: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  extractedText: string;
  textLength: number;
  status: DocumentStatus;
  summary: string;
  summaryGeneratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentDocument = HydratedDocument<IDocument>;

export interface SerializedDocument {
  id: string;
  title: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  textLength: number;
  status: DocumentStatus;
  summary: string;
  summaryGeneratedAt?: Date;
  extractedText?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Chat Message ────────────────────────── */

export type ChatRole = "user" | "assistant";

export interface IChatMessage {
  owner: Types.ObjectId;
  document: Types.ObjectId;
  role: ChatRole;
  content: string;
  estimatedTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatMessageDocument = HydratedDocument<IChatMessage>;

export interface SerializedChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  estimatedTokens: number;
  createdAt: Date;
}

/* ── Payment ─────────────────────────────── */

export type PaymentPlan = "pro";
export type PaymentProvider = "razorpay";
export type PaymentStatus = "created" | "paid" | "failed";
export type PaymentSource = "checkout" | "webhook";

export interface IPayment {
  user: Types.ObjectId;
  plan: PaymentPlan;
  provider: PaymentProvider;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  receipt: string;
  status: PaymentStatus;
  source: PaymentSource;
  paidAt?: Date;
  failedAt?: Date;
  webhookEventIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentDocument = HydratedDocument<IPayment>;

export interface SerializedPayment {
  id: string;
  plan: PaymentPlan;
  provider: PaymentProvider;
  orderId: string;
  paymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  receipt: string;
  paidAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Config ──────────────────────────────── */

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  isTest: boolean;
  port: number;
  clientUrl: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  refreshCookieMaxAgeMs: number;
  refreshCookieName: string;
  passwordSaltRounds: number;
  openaiApiKey: string;
  aiModel: string;
  aiFreeDailyQuota: number;
  aiMaxDocumentChars: number;
  aiMaxChatHistoryMessages: number;
  aiSummaryMaxOutputTokens: number;
  aiChatMaxOutputTokens: number;
  googleClientId: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret?: string;
  proPlanPricePaise: number;
  proPlanCurrency: string;
  logLevel: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  uploadDir: string;
  freePlanMaxDocuments: number;
  freePlanMaxFileSizeBytes: number;
  proPlanMaxFileSizeBytes: number;
}

/* ── AI Provider ─────────────────────────── */

export interface AiTextGenerateParams {
  instructions: string;
  input: string;
  maxOutputTokens: number;
  signal?: AbortSignal;
}

export interface AiTextGenerateResult {
  text: string;
  usage: unknown;
}

export interface AiTextProvider {
  generateText(params: AiTextGenerateParams): Promise<AiTextGenerateResult>;
  streamText(params: AiTextGenerateParams): AsyncIterable<string>;
}

/* ── Payment Gateway ─────────────────────── */

export interface PaymentGatewayOrderPayload {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}

export interface PaymentGatewayOrder {
  id: string;
  [key: string]: unknown;
}

export interface PaymentGatewayProvider {
  createOrder(order: PaymentGatewayOrderPayload): Promise<PaymentGatewayOrder>;
}

/* ── Pagination ──────────────────────────── */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

/* ── SSE helpers ─────────────────────────── */

export interface SseResponse {
  status(code: number): SseResponse;
  setHeader(name: string, value: string): void;
  flushHeaders?(): void;
  write(data: string): boolean;
  end(): void;
  writableEnded: boolean;
}
