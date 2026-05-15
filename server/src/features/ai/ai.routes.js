import { Router } from "express";

import {
  createDocumentSummary,
  getDocumentChatHistory,
  streamDocumentChatResponse
} from "./ai.controller.js";

const router = Router();

router.post("/documents/:documentId/summary", createDocumentSummary);
router.post("/documents/:documentId/chat", streamDocumentChatResponse);
router.get("/documents/:documentId/messages", getDocumentChatHistory);

export default router;

