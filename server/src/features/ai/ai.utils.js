export function truncateText(text, maxCharacters) {
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

export function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

export function serializeChatMessage(message) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    estimatedTokens: message.estimatedTokens,
    createdAt: message.createdAt
  };
}

