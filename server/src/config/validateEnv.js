import Joi from "joi";

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(5000),
  CLIENT_URL: Joi.string().uri().default("http://localhost:5173"),

  MONGODB_URI: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("7d"),
  REFRESH_COOKIE_MAX_AGE_MS: Joi.number().integer().positive().default(604800000),
  REFRESH_COOKIE_NAME: Joi.string().default("documind_refresh_token"),
  PASSWORD_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),

  OPENAI_API_KEY: Joi.string().min(3).required(),
  AI_MODEL: Joi.string().default("gpt-4o-mini"),
  GOOGLE_CLIENT_ID: Joi.string().allow("").optional().default(""),

  RAZORPAY_KEY_ID: Joi.string().min(3).required(),
  RAZORPAY_KEY_SECRET: Joi.string().min(3).required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().allow("").optional(),

  LOG_LEVEL: Joi.string().valid("error", "warn", "info", "http", "debug").default("info"),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().positive().default(900000),
  RATE_LIMIT_MAX: Joi.number().integer().positive().default(100),
  UPLOAD_DIR: Joi.string().default("uploads")
}).unknown(true);

export function validateEnv(rawEnv) {
  const { value, error } = envSchema.validate(rawEnv, {
    abortEarly: false,
    convert: true
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join("; ");
    throw new Error(`Environment validation failed: ${message}`);
  }

  return Object.freeze({
    nodeEnv: value.NODE_ENV,
    isProduction: value.NODE_ENV === "production",
    isTest: value.NODE_ENV === "test",
    port: value.PORT,
    clientUrl: value.CLIENT_URL,
    mongodbUri: value.MONGODB_URI,
    jwtSecret: value.JWT_SECRET,
    jwtRefreshSecret: value.JWT_REFRESH_SECRET,
    accessTokenExpiresIn: value.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: value.REFRESH_TOKEN_EXPIRES_IN,
    refreshCookieMaxAgeMs: value.REFRESH_COOKIE_MAX_AGE_MS,
    refreshCookieName: value.REFRESH_COOKIE_NAME,
    passwordSaltRounds: value.PASSWORD_SALT_ROUNDS,
    openaiApiKey: value.OPENAI_API_KEY,
    aiModel: value.AI_MODEL,
    googleClientId: value.GOOGLE_CLIENT_ID,
    razorpayKeyId: value.RAZORPAY_KEY_ID,
    razorpayKeySecret: value.RAZORPAY_KEY_SECRET,
    razorpayWebhookSecret: value.RAZORPAY_WEBHOOK_SECRET,
    logLevel: value.LOG_LEVEL,
    rateLimitWindowMs: value.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: value.RATE_LIMIT_MAX,
    uploadDir: value.UPLOAD_DIR
  });
}
