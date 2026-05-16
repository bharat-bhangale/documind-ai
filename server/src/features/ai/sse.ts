import type { SseResponse } from "../../types/index.js";

export function prepareSseResponse(res: SseResponse): void {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

export function sendSseEvent(res: SseResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function finishSseResponse(res: SseResponse): void {
  if (!res.writableEnded) {
    res.end();
  }
}
