import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { journalRouter } from "./routes/journal.js";
import { sessionsRouter } from "./routes/sessions.js";
import { statsRouter } from "./routes/stats.js";
import { tasksRouter } from "./routes/tasks.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  if (env.nodeEnv !== "production") {
    app.use(morgan("dev"));
  }

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "life-pro-api" });
  });

  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/journal", journalRouter);
  app.use("/api/sessions", sessionsRouter);
  app.use("/api/stats", statsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
