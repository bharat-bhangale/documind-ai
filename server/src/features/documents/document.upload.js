import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import multer from "multer";

import { config } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { PDF_MIME_TYPE } from "./document.constants.js";

function resolveUploadDirectory() {
  return path.resolve(process.cwd(), config.uploadDir, "documents");
}

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    const uploadDirectory = resolveUploadDirectory();
    fs.mkdirSync(uploadDirectory, { recursive: true });
    callback(null, uploadDirectory);
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase() || ".pdf";
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});

function pdfFileFilter(_req, file, callback) {
  const hasPdfMimeType = file.mimetype === PDF_MIME_TYPE;
  const hasPdfExtension = path.extname(file.originalname).toLowerCase() === ".pdf";

  if (!hasPdfMimeType || !hasPdfExtension) {
    callback(new AppError("Only PDF files are allowed.", 400));
    return;
  }

  callback(null, true);
}

const multerUpload = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: config.proPlanMaxFileSizeBytes,
    files: 1
  }
});

export function uploadPdf(req, res, next) {
  multerUpload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("PDF file exceeds the maximum allowed file size.", 413));
      return;
    }

    next(error);
  });
}

