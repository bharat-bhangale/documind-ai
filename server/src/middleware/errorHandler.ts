import type { NextFunction, Request, Response } from "express";

import { config } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
}

function normalizeError(error: Error & { code?: number }): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error.name === "ValidationError") {
    return new AppError(error.message, 400);
  }

  if (error.name === "CastError") {
    return new AppError("Invalid resource identifier.", 400);
  }

  if (error.code === 11000) {
    return new AppError("Duplicate resource.", 409);
  }

  return new AppError(error.message || "Internal server error", 500, false);
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction): void {
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode || 500;
  const isInternalServerError = statusCode >= 500;

  if (isInternalServerError || !normalizedError.isOperational) {
    logger.error(normalizedError.message, {
      statusCode,
      stack: normalizedError.stack
    });
  } else {
    logger.warn(normalizedError.message, { statusCode });
  }

  const response: Record<string, unknown> = {
    success: false,
    message:
      config.isProduction && isInternalServerError
        ? "Internal server error"
        : normalizedError.message,
    statusCode
  };

  if (!config.isProduction) {
    response.stack = normalizedError.stack;
  }

  res.status(statusCode).json(response);
}
