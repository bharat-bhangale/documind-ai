import { User } from "../features/users/user.model.js";
import { verifyAccessToken } from "../features/auth/token.service.js";
import { AppError } from "../utils/AppError.js";

function getBearerToken(req) {
  const authHeader = req.get("authorization");

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      throw new AppError("Authentication required.", 401);
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError("Authentication required.", 401);
    }

    req.auth = {
      userId: user.id,
      tokenPayload: payload
    };
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Invalid or expired access token.", 401));
  }
}

