import crypto from "node:crypto";

import jwt from "jsonwebtoken";

import { config } from "../../config/env.js";

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      plan: user.plan,
      type: "access"
    },
    config.jwtSecret,
    { expiresIn: config.accessTokenExpiresIn }
  );
}

export function generateRefreshToken(user, jti = crypto.randomUUID()) {
  return jwt.sign(
    {
      sub: user.id,
      jti,
      type: "refresh"
    },
    config.jwtRefreshSecret,
    { expiresIn: config.refreshTokenExpiresIn }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, config.jwtSecret);

  if (payload.type !== "access") {
    throw new Error("Invalid token type.");
  }

  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, config.jwtRefreshSecret);

  if (payload.type !== "refresh") {
    throw new Error("Invalid token type.");
  }

  return payload;
}

export function getRefreshTokenExpiryDate() {
  return new Date(Date.now() + config.refreshCookieMaxAgeMs);
}

