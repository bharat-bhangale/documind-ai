import app from "./app.js";
import { config } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { logger } from "./config/logger.js";

async function startServer() {
  try {
    try {
      await connectDatabase();
    } catch (error) {
      logger.error("MongoDB connection failed. Starting API in degraded mode.", {
        message: error.message
      });
    }

    const server = app.listen(config.port, () => {
      logger.info("DocuMind API server started", {
        port: config.port,
        environment: config.nodeEnv
      });
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully.`);

      server.close(async () => {
        await disconnectDatabase();
        logger.info("Server closed.");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Graceful shutdown timed out.");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("Failed to start DocuMind API server", {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

startServer();
