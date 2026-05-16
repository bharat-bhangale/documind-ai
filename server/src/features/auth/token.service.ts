import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { config } from "../../config/env.js";
import type { AccessTokenPayload, RefreshTokenPayload, UserDocument } from "../../types/index.js";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateAccessToken(user: UserDocument): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      plan: user.plan,
      type: "access"
    },
    config.jwtSecret,
    { expiresIn: config.accessTokenExpiresIn as any }
  );
}

export function generateRefreshToken(user: UserDocument, jti: string = crypto.randomUUID()): string {
  return jwt.sign(
    {
      sub: user.id,
      jti,
      type: "refresh"
    },
    config.jwtRefreshSecret,
    { expiresIn: config.refreshTokenExpiresIn as any }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, config.jwtSecret) as AccessTokenPayload;

  if (payload.type !== "access") {
    throw new Error("Invalid token type.");
  }

  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;

  if (payload.type !== "refresh") {
    throw new Error("Invalid token type.");
  }

  return payload;
}

export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + config.refreshCookieMaxAgeMs);
}
