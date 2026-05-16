import type { Request, Response, NextFunction } from "express";

import { requireAuth } from "../../middleware/requireAuth.js";
import { validateQuery, validateRequest } from "../../middleware/validateRequest.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { chatHistoryQuerySchema, chatRequestSchema } from "./ai.validation.js";
import { finishSseResponse, prepareSseResponse, sendSseEvent } from "./sse.js";
import { listChatMessages, streamDocumentChat, summarizeDocument } from "./ai.service.js";

function createResponseAbortController(res: Response): AbortController {
  const abortController = new AbortController();

  res.on("close", () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  return abortController;
}

export const createDocumentSummary = [
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const abortController = createResponseAbortController(res);
    const result = await summarizeDocument({
      user: req.user!,
      documentId: req.params.documentId as string,
      signal: abortController.signal
    });

    res.status(200).json({
      success: true,
      data: result
    });
  })
];

export const streamDocumentChatResponse = [
  requireAuth,
  validateRequest(chatRequestSchema),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const abortController = createResponseAbortController(res);
    let sseStarted = false;

    try {
      const result = await streamDocumentChat({
        user: req.user!,
        documentId: req.params.documentId as string,
        message: req.body.message,
        signal: abortController.signal,
        onReady(metadata) {
          prepareSseResponse(res as any);
          sseStarted = true;
          sendSseEvent(res as any, "ready", metadata);
        },
        onChunk(chunk) {
          sendSseEvent(res as any, "chunk", { chunk });
        }
      });

      if (!result.aborted) {
        sendSseEvent(res as any, "done", result);
      }

      finishSseResponse(res as any);
    } catch (error) {
      if (abortController.signal.aborted) {
        finishSseResponse(res as any);
        return;
      }

      if (!sseStarted) {
        next(error);
        return;
      }

      sendSseEvent(res as any, "error", {
        message: "AI chat stream failed."
      });
      finishSseResponse(res as any);
    }
  })
];

export const getDocumentChatHistory = [
  requireAuth,
  validateQuery(chatHistoryQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await listChatMessages({
      userId: req.auth!.userId,
      documentId: req.params.documentId as string,
      query: req.query
    });

    res.status(200).json({
      success: true,
      data: result
    });
  })
];
