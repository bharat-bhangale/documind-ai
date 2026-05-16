import winston from "winston";

import { config } from "./env.js";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.isProduction ? winston.format.json() : winston.format.simple()
);

export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  silent: config.isTest,
  transports: [
    new winston.transports.Console()
  ]
});

export const requestLogStream = {
  write(message: string): void {
    logger.http(message.trim());
  }
};
