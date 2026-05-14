import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config/env.js";
import { requestLogStream } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

if (config.nodeEnv !== "test") {
  app.use(morgan(config.isProduction ? "combined" : "dev", { stream: requestLogStream }));
}

app.use("/api/health", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

