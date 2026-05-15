import { requireAuth } from "../../middleware/requireAuth.js";
import { validateQuery, validateRequest } from "../../middleware/validateRequest.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { chatHistoryQuerySchema, chatRequestSchema } from "./ai.validation.js";
import { finishSseResponse, prepareSseResponse, sendSseEvent } from "./sse.js";
import { listChatMessages, streamDocumentChat, summarizeDocument } from "./ai.service.js";

function createResponseAbortController(res) {
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
  asyncHandler(async (req, res) => {
    const abortController = createResponseAbortController(res);
    const result = await summarizeDocument({
      user: req.user,
      documentId: req.params.documentId,
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
  asyncHandler(async (req, res, next) => {
    const abortController = createResponseAbortController(res);
    let sseStarted = false;

    try {
      const result = await streamDocumentChat({
        user: req.user,
        documentId: req.params.documentId,
        message: req.body.message,
        signal: abortController.signal,
        onReady(metadata) {
          prepareSseResponse(res);
          sseStarted = true;
          sendSseEvent(res, "ready", metadata);
        },
        onChunk(chunk) {
          sendSseEvent(res, "chunk", { chunk });
        }
      });

      if (!result.aborted) {
        sendSseEvent(res, "done", result);
      }

      finishSseResponse(res);
    } catch (error) {
      if (abortController.signal.aborted) {
        finishSseResponse(res);
        return;
      }

      if (!sseStarted) {
        next(error);
        return;
      }

      sendSseEvent(res, "error", {
        message: "AI chat stream failed."
      });
      finishSseResponse(res);
    }
  })
];

export const getDocumentChatHistory = [
  requireAuth,
  validateQuery(chatHistoryQuerySchema),
  asyncHandler(async (req, res) => {
    const result = await listChatMessages({
      userId: req.auth.userId,
      documentId: req.params.documentId,
      query: req.query
    });

    res.status(200).json({
      success: true,
      data: result
    });
  })
];
