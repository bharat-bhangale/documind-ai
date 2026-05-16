import mongoose from "mongoose";

import { config } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { Document } from "../documents/document.model.js";
import { ChatMessage } from "./chatMessage.model.js";
import { getAiTextProvider } from "./ai.provider.js";
import { CHAT_INSTRUCTIONS, SUMMARY_INSTRUCTIONS } from "./ai.prompts.js";
import { consumeAiQuota, getAiUsageSnapshot } from "./ai.usage.js";
import { estimateTokenCount, serializeChatMessage, truncateText } from "./ai.utils.js";
import type { UserDocument, DocumentDocument, ChatMessageDocument } from "../../types/index.js";

function ensureDocumentId(documentId: string): void {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new AppError("Document not found.", 404);
  }
}

async function findOwnedDocumentOrThrow(userId: string, documentId: string): Promise<DocumentDocument> {
  ensureDocumentId(documentId);

  const document = await Document.findOne({
    _id: documentId,
    owner: userId
  });

  if (!document) {
    throw new AppError("Document not found.", 404);
  }

  return document as DocumentDocument;
}

function buildSummaryInput(document: DocumentDocument, truncatedDocument: { text: string; truncated: boolean }) {
  return [
    `Document title: ${document.title}`,
    `Original file name: ${document.originalName}`,
    `Document content${truncatedDocument.truncated ? " (truncated)" : ""}:`,
    truncatedDocument.text
  ].join("\n\n");
}

function formatConversationHistory(messages: ChatMessageDocument[]) {
  if (messages.length === 0) {
    return "No previous chat history.";
  }

  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");
}

function buildChatInput({
  document,
  truncatedDocument,
  history,
  message
}: {
  document: DocumentDocument;
  truncatedDocument: { text: string; truncated: boolean };
  history: ChatMessageDocument[];
  message: string;
}) {
  return [
    `Document title: ${document.title}`,
    `Original file name: ${document.originalName}`,
    `Document content${truncatedDocument.truncated ? " (truncated)" : ""}:`,
    truncatedDocument.text,
    "Recent conversation:",
    formatConversationHistory(history),
    "Current user question:",
    message
  ].join("\n\n");
}

async function getRecentChatHistory({ userId, documentId }: { userId: string; documentId: string }): Promise<ChatMessageDocument[]> {
  const messages = await ChatMessage.find({
    owner: userId,
    document: documentId
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(config.aiMaxChatHistoryMessages);

  return messages.reverse() as ChatMessageDocument[];
}

export async function summarizeDocument({
  user,
  documentId,
  signal
}: {
  user: UserDocument;
  documentId: string;
  signal?: AbortSignal;
}) {
  const document = await findOwnedDocumentOrThrow(user.id, documentId);
  const usage = await consumeAiQuota(user);
  const truncatedDocument = truncateText(document.extractedText, config.aiMaxDocumentChars);
  const input = buildSummaryInput(document, truncatedDocument);

  const response = await getAiTextProvider().generateText({
    instructions: SUMMARY_INSTRUCTIONS,
    input,
    maxOutputTokens: config.aiSummaryMaxOutputTokens,
    signal
  });

  const summary = response.text.trim();

  if (!summary) {
    throw new AppError("AI summary response was empty.", 502);
  }

  document.summary = summary;
  document.summaryGeneratedAt = new Date();
  await document.save();

  return {
    summary,
    document: {
      id: document.id,
      title: document.title,
      summary: document.summary,
      summaryGeneratedAt: document.summaryGeneratedAt
    },
    usage,
    context: {
      documentCharactersSent: truncatedDocument.text.length,
      documentTruncated: truncatedDocument.truncated,
      estimatedInputTokens: estimateTokenCount(input),
      maxOutputTokens: config.aiSummaryMaxOutputTokens
    }
  };
}

export async function streamDocumentChat({
  user,
  documentId,
  message,
  signal,
  onReady,
  onChunk
}: {
  user: UserDocument;
  documentId: string;
  message: string;
  signal?: AbortSignal;
  onReady?: (metadata: any) => void;
  onChunk: (chunk: string) => void;
}) {
  const document = await findOwnedDocumentOrThrow(user.id, documentId);
  const usage = await consumeAiQuota(user);
  const truncatedDocument = truncateText(document.extractedText, config.aiMaxDocumentChars);
  const history = await getRecentChatHistory({ userId: user.id, documentId: document.id });
  const input = buildChatInput({ document, truncatedDocument, history, message });
  const inputEstimatedTokens = estimateTokenCount(input);

  await ChatMessage.create({
    owner: user.id,
    document: document.id,
    role: "user",
    content: message,
    estimatedTokens: estimateTokenCount(message)
  });

  let assistantText = "";
  const context = {
    documentCharactersSent: truncatedDocument.text.length,
    documentTruncated: truncatedDocument.truncated,
    historyMessagesSent: history.length,
    estimatedInputTokens: inputEstimatedTokens,
    maxOutputTokens: config.aiChatMaxOutputTokens
  };

  onReady?.({
    usage,
    context
  });

  for await (const chunk of getAiTextProvider().streamText({
    instructions: CHAT_INSTRUCTIONS,
    input,
    maxOutputTokens: config.aiChatMaxOutputTokens,
    signal
  })) {
    if (signal?.aborted) {
      break;
    }

    assistantText += chunk;
    onChunk(chunk);
  }

  if (signal?.aborted) {
    return {
      aborted: true,
      usage,
      context
    };
  }

  const trimmedAssistantText = assistantText.trim();

  if (!trimmedAssistantText) {
    throw new AppError("AI chat response was empty.", 502);
  }

  const assistantMessage = await ChatMessage.create({
    owner: user.id,
    document: document.id,
    role: "assistant",
    content: trimmedAssistantText,
    estimatedTokens: estimateTokenCount(trimmedAssistantText)
  });

  return {
    aborted: false,
    assistantMessage: serializeChatMessage(assistantMessage as ChatMessageDocument),
    usage,
    context
  };
}

export async function listChatMessages({
  userId,
  documentId,
  query
}: {
  userId: string;
  documentId: string;
  query: Record<string, any>;
}) {
  await findOwnedDocumentOrThrow(userId, documentId);

  const skip = (query.page - 1) * query.limit;

  const [messages, total] = await Promise.all([
    ChatMessage.find({ owner: userId, document: documentId })
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(query.limit),
    ChatMessage.countDocuments({ owner: userId, document: documentId })
  ]);

  return {
    messages: (messages as ChatMessageDocument[]).map((message) => serializeChatMessage(message)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}

export { getAiUsageSnapshot };
