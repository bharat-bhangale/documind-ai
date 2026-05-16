import Joi from "joi";

export const updateDocumentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(160).required()
});

export const listDocumentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortBy: Joi.string().valid("createdAt", "updatedAt", "title", "fileSize").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc")
});
