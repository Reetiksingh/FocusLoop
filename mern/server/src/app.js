import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { journalRouter } from "./routes/journal.js";
import { sessionsRouter } from "./routes/sessions.js";
import { statsRouter } from "./routes/stats.js";
import { tasksRouter } from "./routes/tasks.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "life-pro-api" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/journal", journalRouter);
  app.use("/api/sessions", sessionsRouter);
  app.use("/api/stats", statsRouter);

  return app;
}
