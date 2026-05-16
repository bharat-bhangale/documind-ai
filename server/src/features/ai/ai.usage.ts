import { config } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import type { UserDocument } from "../../types/index.js";

function isSameUtcDay(left: Date, right: Date): boolean {
  return (
    left.getUTCFullYear() === right.getUTCFullYear()
    && left.getUTCMonth() === right.getUTCMonth()
    && left.getUTCDate() === right.getUTCDate()
  );
}

function ensureUsageWindow(user: UserDocument, now = new Date()): void {
  if (!user.aiUsage) {
    user.aiUsage = {
      dailyCount: 0,
      lastResetAt: now
    };
    return;
  }

  if (!user.aiUsage.lastResetAt || !isSameUtcDay(new Date(user.aiUsage.lastResetAt), now)) {
    user.aiUsage.dailyCount = 0;
    user.aiUsage.lastResetAt = now;
  }
}

export function getAiUsageSnapshot(user: UserDocument) {
  ensureUsageWindow(user);

  const dailyLimit = user.plan === "pro" ? null : config.aiFreeDailyQuota;

  return {
    dailyCount: user.aiUsage.dailyCount,
    dailyLimit,
    remaining: dailyLimit === null ? null : Math.max(dailyLimit - user.aiUsage.dailyCount, 0)
  };
}

export async function consumeAiQuota(user: UserDocument) {
  ensureUsageWindow(user);

  if (user.plan !== "pro" && user.aiUsage.dailyCount >= config.aiFreeDailyQuota) {
    throw new AppError("AI usage quota exceeded for your current plan.", 429);
  }

  user.aiUsage.dailyCount += 1;
  await user.save({ validateModifiedOnly: true });

  return getAiUsageSnapshot(user);
}
