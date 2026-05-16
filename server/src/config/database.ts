import mongoose from "mongoose";

import { config } from "./env.js";
import { logger } from "./logger.js";

const readyStateMap: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting"
};

let listenersAttached = false;

function attachConnectionListeners(): void {
  if (listenersAttached) {
    return;
  }

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected.");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected.");
  });

  mongoose.connection.on("error", (error: Error) => {
    logger.error("MongoDB connection error", {
      message: error.message
    });
  });

  listenersAttached = true;
}

export function getDatabaseStatus() {
  const { readyState, host, name } = mongoose.connection;

  return {
    state: readyStateMap[readyState] ?? "unknown",
    readyState,
    host: host ?? null,
    name: name ?? null
  };
}

export async function connectDatabase(uri: string = config.mongodbUri) {
  attachConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  return mongoose.connection;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}
