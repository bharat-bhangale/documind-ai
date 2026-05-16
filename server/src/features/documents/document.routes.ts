import { Router } from "express";

import {
  deleteUserDocument,
  getUserDocument,
  listUserDocuments,
  updateUserDocument,
  uploadDocument
} from "./document.controller.js";

const router = Router();

router.post("/upload", uploadDocument);
router.get("/", listUserDocuments);
router.get("/:documentId", getUserDocument);
router.patch("/:documentId", updateUserDocument);
router.delete("/:documentId", deleteUserDocument);

export default router;
