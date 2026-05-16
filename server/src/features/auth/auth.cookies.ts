import type { CookieOptions, Response } from "express";
import { config } from "../../config/env.js";

export function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: config.refreshCookieMaxAgeMs
  };
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(config.refreshCookieName, refreshToken, getRefreshCookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(config.refreshCookieName, {
    ...getRefreshCookieOptions(),
    maxAge: undefined
  });
}
