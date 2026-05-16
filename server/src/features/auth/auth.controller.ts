import type { Request, Response } from "express";

import { config } from "../../config/env.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "./auth.cookies.js";
import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  refreshSession,
  registerUser,
  serializeUser
} from "./auth.service.js";

function getRefreshTokenFromRequest(req: Request): string | undefined {
  return req.cookies?.[config.refreshCookieName];
}

function sendAuthSession(res: Response, statusCode: number, session: { refreshToken: string; user: any; accessToken: string }): void {
  setRefreshTokenCookie(res, session.refreshToken);

  res.status(statusCode).json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken
    }
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const session = await registerUser(req.body);
  sendAuthSession(res, 201, session);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const session = await loginWithEmail(req.body);
  sendAuthSession(res, 200, session);
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const session = await loginWithGoogle(req.body);
  sendAuthSession(res, 200, session);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const session = await refreshSession(getRefreshTokenFromRequest(req));
  sendAuthSession(res, 200, session);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await logoutUser(getRefreshTokenFromRequest(req));
  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully."
  });
});

export const me = [
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        user: serializeUser(req.user!)
      }
    });
  })
];
