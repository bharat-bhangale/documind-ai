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

function getRefreshTokenFromRequest(req) {
  return req.cookies?.[config.refreshCookieName];
}

function sendAuthSession(res, statusCode, session) {
  setRefreshTokenCookie(res, session.refreshToken);

  res.status(statusCode).json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken
    }
  });
}

export const register = asyncHandler(async (req, res) => {
  const session = await registerUser(req.body);
  sendAuthSession(res, 201, session);
});

export const login = asyncHandler(async (req, res) => {
  const session = await loginWithEmail(req.body);
  sendAuthSession(res, 200, session);
});

export const googleLogin = asyncHandler(async (req, res) => {
  const session = await loginWithGoogle(req.body);
  sendAuthSession(res, 200, session);
});

export const refresh = asyncHandler(async (req, res) => {
  const session = await refreshSession(getRefreshTokenFromRequest(req));
  sendAuthSession(res, 200, session);
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(getRefreshTokenFromRequest(req));
  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully."
  });
});

export const me = [
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        user: serializeUser(req.user)
      }
    });
  })
];

