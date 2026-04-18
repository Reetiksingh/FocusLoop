import { Router } from "express";
import {
  cancelCurrentSession,
  completeCurrentSession,
  createSession,
  getActiveSession,
  listSessions,
  pauseCurrentSession,
  resumeCurrentSession
} from "../controllers/sessionController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sessionsRouter = Router();

sessionsRouter.use(protect);

sessionsRouter.get("/", asyncHandler(listSessions));
sessionsRouter.get("/active", asyncHandler(getActiveSession));
sessionsRouter.post("/", asyncHandler(createSession));
sessionsRouter.patch("/:sessionId/pause", asyncHandler(pauseCurrentSession));
sessionsRouter.patch("/:sessionId/resume", asyncHandler(resumeCurrentSession));
sessionsRouter.patch("/:sessionId/complete", asyncHandler(completeCurrentSession));
sessionsRouter.delete("/:sessionId", asyncHandler(cancelCurrentSession));
