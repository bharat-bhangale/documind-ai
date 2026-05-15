import { requireAuth } from "../../middleware/requireAuth.js";
import { validateQuery, validateRequest } from "../../middleware/validateRequest.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createDocumentFromUpload,
  deleteDocument,
  getDocumentById,
  listDocuments,
  updateDocument
} from "./document.service.js";
import { uploadPdf } from "./document.upload.js";
import { listDocumentsQuerySchema, updateDocumentSchema } from "./document.validation.js";

export const uploadDocument = [
  requireAuth,
  uploadPdf,
  asyncHandler(async (req, res) => {
    const document = await createDocumentFromUpload({
      user: req.user,
      file: req.file,
      title: req.body.title
    });

    res.status(201).json({
      success: true,
      data: {
        document
      }
    });
  })
];

export const listUserDocuments = [
  requireAuth,
  validateQuery(listDocumentsQuerySchema),
  asyncHandler(async (req, res) => {
    const result = await listDocuments({
      userId: req.auth.userId,
      query: req.query
    });

    res.status(200).json({
      success: true,
      data: result
    });
  })
];

export const getUserDocument = [
  requireAuth,
  asyncHandler(async (req, res) => {
    const document = await getDocumentById({
      userId: req.auth.userId,
      documentId: req.params.documentId
    });

    res.status(200).json({
      success: true,
      data: {
        document
      }
    });
  })
];

export const updateUserDocument = [
  requireAuth,
  validateRequest(updateDocumentSchema),
  asyncHandler(async (req, res) => {
    const document = await updateDocument({
      userId: req.auth.userId,
      documentId: req.params.documentId,
      title: req.body.title
    });

    res.status(200).json({
      success: true,
      data: {
        document
      }
    });
  })
];

export const deleteUserDocument = [
  requireAuth,
  asyncHandler(async (req, res) => {
    await deleteDocument({
      userId: req.auth.userId,
      documentId: req.params.documentId
    });

    res.status(200).json({
      success: true,
      message: "Document deleted successfully."
    });
  })
];

