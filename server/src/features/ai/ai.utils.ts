import type { ChatMessageDocument, SerializedChatMessage } from "../../types/index.js";

export function truncateText(text: string, maxCharacters: number) {
  if (text.length <= maxCharacters) {
    return {
      text,
      truncated: false
    };
  }

  return {
    text: text.slice(0, maxCharacters),
    truncated: true
  };
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function serializeChatMessage(message: ChatMessageDocument): SerializedChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    estimatedTokens: message.estimatedTokens,
    createdAt: message.createdAt
  };
}
