import type { NextFunction, Request, Response } from "express";
import type Joi from "joi";

import { AppError } from "../utils/AppError.js";

export function validateRequest(schema: Joi.ObjectSchema) {
  return function requestValidator(req: Request, _res: Response, next: NextFunction): void {
    const { value, error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join("; ");
      next(new AppError(message, 400));
      return;
    }

    req.body = value;
    next();
  };
}

export function validateQuery(schema: Joi.ObjectSchema) {
  return function queryValidator(req: Request, _res: Response, next: NextFunction): void {
    const { value, error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join("; ");
      next(new AppError(message, 400));
      return;
    }

    req.query = value;
    next();
  };
}
