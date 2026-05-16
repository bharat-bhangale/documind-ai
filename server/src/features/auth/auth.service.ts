import { User } from "../users/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { verifyGoogleCredential } from "./google.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiryDate,
  hashToken,
  verifyRefreshToken
} from "./token.service.js";
import type { SerializedUser, UserDocument, RefreshTokenPayload } from "../../types/index.js";

interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: SerializedUser;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function serializeUser(user: UserDocument): SerializedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    authProvider: user.authProvider,
    plan: user.plan,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function persistRefreshToken(user: UserDocument, refreshToken: string): Promise<void> {
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiryDate(),
    createdAt: new Date()
  });

  await user.save();
}

async function createSession(user: UserDocument): Promise<SessionData> {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await persistRefreshToken(user, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: serializeUser(user)
  };
}

export async function registerUser({ name, email, password }: Record<string, string>): Promise<SessionData> {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = new User({
    name,
    email: normalizedEmail,
    authProvider: "local"
  });

  await user.setPassword(password);
  await user.save();

  return createSession(user);
}

export async function loginWithEmail({ email, password }: Record<string, string>): Promise<SessionData> {
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+passwordHash +refreshTokens");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  return createSession(user);
}

export async function loginWithGoogle({ credential }: Record<string, string>): Promise<SessionData> {
  const payload = await verifyGoogleCredential(credential);
  const normalizedEmail = normalizeEmail(payload.email!);

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: normalizedEmail }]
  }).select("+refreshTokens");

  if (!user) {
    user = new User({
      name: payload.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      googleId: payload.sub,
      avatarUrl: payload.picture || "",
      authProvider: "google"
    });
  } else {
    user.googleId = user.googleId || payload.sub;
    user.avatarUrl = user.avatarUrl || payload.picture || "";

    if (user.authProvider === "local") {
      user.authProvider = "local_google";
    }
  }

  await user.save();

  return createSession(user);
}

export async function refreshSession(refreshToken?: string): Promise<SessionData> {
  if (!refreshToken) {
    throw new AppError("Refresh token is required.", 401);
  }

  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");

  if (!user) {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  const incomingTokenHash = hashToken(refreshToken);
  const tokenRecord = user.refreshTokens.find((token) => token.tokenHash === incomingTokenHash);

  if (!tokenRecord) {
    user.refreshTokens = [];
    await user.save({ validateModifiedOnly: true });
    throw new AppError("Refresh token reuse detected. Please sign in again.", 401);
  }

  if (tokenRecord.expiresAt <= new Date()) {
    user.refreshTokens = user.refreshTokens.filter((token) => token.tokenHash !== incomingTokenHash);
    await user.save({ validateModifiedOnly: true });
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  user.refreshTokens = user.refreshTokens.filter((token) => token.tokenHash !== incomingTokenHash);

  return createSession(user);
}

export async function logoutUser(refreshToken?: string): Promise<void> {
  if (!refreshToken) {
    return;
  }

  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return;
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");

  if (!user) {
    return;
  }

  const incomingTokenHash = hashToken(refreshToken);
  user.refreshTokens = user.refreshTokens.filter((token) => token.tokenHash !== incomingTokenHash);
  await user.save({ validateModifiedOnly: true });
}

export { serializeUser };
