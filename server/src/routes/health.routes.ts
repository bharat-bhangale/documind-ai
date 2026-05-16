import { Router } from "express";

import { config } from "../config/env.js";
import { getDatabaseStatus } from "../config/database.js";

const router = Router();

router.get("/", (_req, res) => {
  const database = getDatabaseStatus();
  const isDatabaseConnected = database.state === "connected";

  res.status(200).json({
    success: true,
    status: isDatabaseConnected ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    services: {
      api: "up",
      database
    }
  });
});

export default router;
