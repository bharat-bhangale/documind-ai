import fs from "node:fs/promises";
import path from "node:path";

import mongoose from "mongoose";
import { PDFParse } from "pdf-parse";

import { config } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { removeFileIfExists } from "../../utils/fileSystem.js";
import { AppError } from "../../utils/AppError.js";
import { Document } from "./document.model.js";
import { serializeDocument } from "./document.serializer.js";
import type { DocumentDocument, PaginationMeta, SerializedDocument, UserDocument } from "../../types/index.js";

function getPlanLimits(user: UserDocument) {
  if (user.plan === "pro") {
    return {
      maxDocuments: Number.POSITIVE_INFINITY,
      maxFileSizeBytes: config.proPlanMaxFileSizeBytes
    };
  }

  return {
    maxDocuments: config.freePlanMaxDocuments,
    maxFileSizeBytes: config.freePlanMaxFileSizeBytes
  };
}

function buildTitle(file: Express.Multer.File, requestedTitle?: string): string {
  if (requestedTitle?.trim()) {
    const title = requestedTitle.trim();

    if (title.length > 160) {
      throw new AppError("Document title must be 160 characters or fewer.", 400);
    }

    return title;
  }

  return path.basename(file.originalname, path.extname(file.originalname)).trim() || "Untitled document";
}

function ensureDocumentId(documentId: string): void {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new AppError("Document not found.", 404);
  }
}

async function assertPdfSignature(filePath: string): Promise<void> {
  const fileHandle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(5);
    await fileHandle.read(buffer, 0, 5, 0);

    if (buffer.toString() !== "%PDF-") {
      throw new AppError("Uploaded file is not a valid PDF.", 400);
    }
  } finally {
    await fileHandle.close();
  }
}

async function enforceUploadLimits(user: UserDocument, file: Express.Multer.File): Promise<void> {
  const limits = getPlanLimits(user);

  if (file.size > limits.maxFileSizeBytes) {
    throw new AppError("PDF file exceeds your current plan limit.", 413);
  }

  if (Number.isFinite(limits.maxDocuments)) {
    const documentCount = await Document.countDocuments({ owner: user.id });

    if (documentCount >= limits.maxDocuments) {
      throw new AppError("Document limit reached for your current plan.", 403);
    }
  }
}

async function extractPdfText(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });

  try {
    const pdf = await parser.getText();
    const extractedText = pdf.text.trim();

    if (!extractedText) {
      throw new AppError("No extractable text was found in this PDF.", 422);
    }

    return {
      text: extractedText,
      pageCount: pdf.total || pdf.pages?.length || 0
    };
  } finally {
    await parser.destroy();
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

  return document;
}

export async function createDocumentFromUpload({
  user,
  file,
  title
}: {
  user: UserDocument;
  file?: Express.Multer.File;
  title?: string;
}): Promise<SerializedDocument> {
  if (!file) {
    throw new AppError("PDF file is required.", 400);
  }

  try {
    await enforceUploadLimits(user, file);
    await assertPdfSignature(file.path);

    const extraction = await extractPdfText(file.path);

    const document = await Document.create({
      owner: user.id,
      title: buildTitle(file, title),
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      pageCount: extraction.pageCount,
      extractedText: extraction.text,
      textLength: extraction.text.length
    });

    return serializeDocument(document as DocumentDocument, { includeText: true });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Could not extract text from the uploaded PDF.", 422);
  } finally {
    try {
      await removeFileIfExists(file.path);
    } catch (cleanupError: any) {
      logger.warn("Failed to remove temporary uploaded PDF", {
        path: file.path,
        message: cleanupError.message
      });
    }
  }
}

export async function listDocuments({
  userId,
  query
}: {
  userId: string;
  query: Record<string, any>;
}): Promise<{ documents: SerializedDocument[]; pagination: PaginationMeta }> {
  const skip = (query.page - 1) * query.limit;
  const sortDirection = query.sortOrder === "asc" ? 1 : -1;

  const [documents, total] = await Promise.all([
    Document.find({ owner: userId })
      .sort({ [query.sortBy]: sortDirection, _id: sortDirection })
      .skip(skip)
      .limit(query.limit),
    Document.countDocuments({ owner: userId })
  ]);

  return {
    documents: documents.map((document) => serializeDocument(document as DocumentDocument)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}

export async function getDocumentById({
  userId,
  documentId
}: {
  userId: string;
  documentId: string;
}): Promise<SerializedDocument> {
  const document = await findOwnedDocumentOrThrow(userId, documentId);
  return serializeDocument(document, { includeText: true });
}

export async function updateDocument({
  userId,
  documentId,
  title
}: {
  userId: string;
  documentId: string;
  title: string;
}): Promise<SerializedDocument> {
  const document = await findOwnedDocumentOrThrow(userId, documentId);
  document.title = title;
  await document.save();

  return serializeDocument(document, { includeText: true });
}

export async function deleteDocument({
  userId,
  documentId
}: {
  userId: string;
  documentId: string;
}): Promise<void> {
  const document = await findOwnedDocumentOrThrow(userId, documentId);
  await document.deleteOne();
}
