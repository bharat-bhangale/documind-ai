import { config } from "../../config/env.js";

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: config.refreshCookieMaxAgeMs
  };
}

export function setRefreshTokenCookie(res, refreshToken) {
  res.cookie(config.refreshCookieName, refreshToken, getRefreshCookieOptions());
}

export function clearRefreshTokenCookie(res) {
  res.clearCookie(config.refreshCookieName, {
    ...getRefreshCookieOptions(),
    maxAge: undefined
  });
}

