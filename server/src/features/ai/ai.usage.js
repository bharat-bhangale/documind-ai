import { config } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

function isSameUtcDay(left, right) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear()
    && left.getUTCMonth() === right.getUTCMonth()
    && left.getUTCDate() === right.getUTCDate()
  );
}

function ensureUsageWindow(user, now = new Date()) {
  if (!user.aiUsage) {
    user.aiUsage = {
      dailyCount: 0,
      lastResetAt: now
    };
    return;
  }

  if (!user.aiUsage.lastResetAt || !isSameUtcDay(user.aiUsage.lastResetAt, now)) {
    user.aiUsage.dailyCount = 0;
    user.aiUsage.lastResetAt = now;
  }
}

export function getAiUsageSnapshot(user) {
  ensureUsageWindow(user);

  const dailyLimit = user.plan === "pro" ? null : config.aiFreeDailyQuota;

  return {
    dailyCount: user.aiUsage.dailyCount,
    dailyLimit,
    remaining: dailyLimit === null ? null : Math.max(dailyLimit - user.aiUsage.dailyCount, 0)
  };
}

export async function consumeAiQuota(user) {
  ensureUsageWindow(user);

  if (user.plan !== "pro" && user.aiUsage.dailyCount >= config.aiFreeDailyQuota) {
    throw new AppError("AI usage quota exceeded for your current plan.", 429);
  }

  user.aiUsage.dailyCount += 1;
  await user.save({ validateModifiedOnly: true });

  return getAiUsageSnapshot(user);
}

