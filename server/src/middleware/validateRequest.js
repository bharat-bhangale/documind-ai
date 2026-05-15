import { AppError } from "../utils/AppError.js";

export function validateRequest(schema) {
  return function requestValidator(req, _res, next) {
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

export function validateQuery(schema) {
  return function queryValidator(req, _res, next) {
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

