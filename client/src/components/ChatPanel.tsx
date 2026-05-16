import { Bot, Send, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

import api from "../lib/api";

interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

interface ChatPanelProps {
  documentId: string;
}

/**
 * AI Chat Panel with SSE streaming support.
 *
 * Connects to POST /api/ai/documents/:id/chat via EventSource-like fetch.
 * Receives events: ready → chunk* → done | error.
 */
export default function ChatPanel({ documentId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /* ── Auto-scroll to bottom on new messages ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ── Load chat history on mount ── */
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const { data } = await api.get(
          `/ai/documents/${documentId}/messages?limit=50`
        );

        if (!cancelled && data.data?.messages) {
          setMessages(
            data.data.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt
            }))
          );
        }
      } catch {
        /* Silently handle — empty chat is fine */
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  /* ── Clean up streaming on unmount ── */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /* ── Send message and stream response via SSE ── */
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isStreaming) return;

    const userMessage: ChatMessageData = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const assistantId = `temp-assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        isStreaming: true
      }
    ]);

    try {
      abortControllerRef.current = new AbortController();
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `/api/ai/documents/${documentId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message: trimmedInput }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        let errorMessage = "AI request failed.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          /* ignore parse error */
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("No response body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        /* Process complete lines from the buffer */
        while (buffer.includes("\n")) {
          const newlineIdx = buffer.indexOf("\n");
          const line = buffer.slice(0, newlineIdx).trim();
          buffer = buffer.slice(newlineIdx + 1);

          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);

            try {
              const eventData = JSON.parse(jsonStr);

              if (currentEvent === "chunk" && eventData.chunk) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: msg.content + eventData.chunk }
                      : msg
                  )
                );
              } else if (currentEvent === "error") {
                throw new Error(eventData.message || "AI stream error.");
              }
              /* "ready" and "done" events don't need special handling for the UI */
            } catch (parseError: any) {
              if (parseError.message && !parseError.message.includes("JSON")) {
                throw parseError;
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;

      toast.error(error.message || "Failed to get AI response.");

      setMessages((prev) => {
        const assistantMsg = prev.find((m) => m.id === assistantId);
        if (assistantMsg && !assistantMsg.content) {
          return prev.filter((m) => m.id !== assistantId);
        }
        return prev;
      });
    } finally {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isStreaming: false } : msg
        )
      );
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="border-b border-white/8 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-cyan-400" />
          AI Chat
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Ask questions about this document
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4" id="chat-messages-area">
        {isLoadingHistory ? (
          <div className="flex h-full items-center justify-center">
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15">
              <Bot className="h-8 w-8 text-cyan-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              Start a conversation
            </p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Ask anything about this document — summaries, key points,
              explanations, or specific questions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-white/8 px-4 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Ask about this document…"
            className="form-input max-h-32 min-h-[2.5rem] flex-1 resize-none"
            rows={1}
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="btn-primary p-2.5"
            id="chat-send-btn"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Chat message bubble ─────────────────── */

function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-600"
            : "bg-gradient-to-br from-violet-500 to-purple-600"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser ? "chat-bubble-user" : "chat-bubble-assistant"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : message.content ? (
          <div className="markdown-content">
            <Markdown>{message.content}</Markdown>
          </div>
        ) : message.isStreaming ? (
          <div className="streaming-dots py-1">
            <span />
            <span />
            <span />
          </div>
        ) : null}
      </div>
    </div>
  );
}
