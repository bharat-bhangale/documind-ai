import Joi from "joi";

const email = Joi.string().email().lowercase().trim().required();
const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Za-z]/, "letter")
  .pattern(/[0-9]/, "number")
  .required()
  .messages({
    "string.pattern.name": "Password must contain at least one {#name}."
  });

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email,
  password
});

export const loginSchema = Joi.object({
  email,
  password: Joi.string().required()
});

export const googleLoginSchema = Joi.object({
  credential: Joi.string().trim().min(10).required()
});

