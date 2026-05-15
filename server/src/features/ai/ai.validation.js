import Joi from "joi";

export const chatRequestSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required()
});

export const chatHistoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20)
});

