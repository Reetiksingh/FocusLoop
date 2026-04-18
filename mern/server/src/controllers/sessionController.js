import { FocusSession } from "../models/FocusSession.js";
import { Task } from "../models/Task.js";
import { AppError } from "../utils/AppError.js";
import { completeSession, hydrateActiveSession } from "../services/sessionService.js";
import { syncDailyActivity } from "../services/activityService.js";
import {
  validateDateParam,
  validateRemainingSecondsPayload,
  validateSessionCreatePayload
} from "../validators/requestValidators.js";

function serializeSession(session) {
  if (!session) return null;
  return {
    id: session._id,
    taskId: session.taskId?._id || session.taskId || null,
    taskTitle: session.taskId?.title || null,
    date: session.date,
    sessionType: session.sessionType,
    plannedMinutes: session.plannedMinutes,
    remainingSeconds: session.remainingSeconds,
    ambientSound: session.ambientSound,
    status: session.status,
    startedAt: session.startedAt,
    lastResumedAt: session.lastResumedAt,
    endedAt: session.endedAt
  };
}

export async function getActiveSession(req, res) {
  const session = await FocusSession.findOne({
    userId: req.userId,
    status: { $in: ["running", "paused"] }
  })
    .sort({ updatedAt: -1 })
    .populate("taskId");

  const hydrated = await hydrateActiveSession(session);
  res.json({ session: serializeSession(hydrated) });
}

export async function listSessions(req, res) {
  const query = { userId: req.userId };
  if (req.query.date) query.date = validateDateParam(req.query.date, "Session date");

  const sessions = await FocusSession.find(query).sort({ createdAt: -1 }).limit(50).populate("taskId");
  res.json({ sessions: sessions.map(serializeSession) });
}

export async function createSession(req, res) {
  const { taskId = null, date, sessionType = "focus", plannedMinutes, ambientSound = "" } =
    validateSessionCreatePayload(req.body);

  if (sessionType === "focus" && !taskId) {
    throw new AppError("A focus session must be attached to a task.", 400);
  }

  if (sessionType !== "focus" && taskId) {
    throw new AppError("Only focus sessions can be attached to a task.", 400);
  }

  const existing = await FocusSession.findOne({
    userId: req.userId,
    status: { $in: ["running", "paused"] }
  });

  if (existing) {
    throw new AppError("Finish or cancel the current session before starting a new one.", 409);
  }

  let task = null;
  if (taskId) {
    task = await Task.findOne({ _id: taskId, userId: req.userId });
    if (!task) {
      throw new AppError("Associated task not found.", 404);
    }
    if (task.status === "completed") {
      throw new AppError("Completed tasks cannot be focused again.", 409);
    }
    if (!task.requiresFocus && sessionType === "focus") {
      throw new AppError("Quick tasks should be completed without focus.", 409);
    }
    if (task.date !== date) {
      throw new AppError("Task date must match the session date.", 409);
    }
    if (task.status === "planned") {
      task.status = "in_progress";
      await task.save();
    }
  }

  const session = await FocusSession.create({
    userId: req.userId,
    taskId,
    date,
    sessionType,
    plannedMinutes,
    remainingSeconds: plannedMinutes * 60,
    ambientSound,
    status: "running",
    endedAt: null
  });

  if (plannedMinutes === 0) {
    await completeSession(session, { remainingSeconds: 0 });
  }

  const created = await FocusSession.findById(session._id).populate("taskId");
  res.status(201).json({ session: serializeSession(created) });
}

export async function pauseCurrentSession(req, res) {
  const { remainingSeconds } = validateRemainingSecondsPayload(req.body);
  const session = await FocusSession.findOne({
    _id: req.params.sessionId,
    userId: req.userId,
    status: "running"
  }).populate("taskId");

  if (!session) {
    throw new AppError("Running session not found.", 404);
  }

  session.status = "paused";
  session.remainingSeconds = Math.max(0, Number(remainingSeconds || 0));
  await session.save();

  res.json({ session: serializeSession(session) });
}

export async function resumeCurrentSession(req, res) {
  const { remainingSeconds } = validateRemainingSecondsPayload(req.body);
  const session = await FocusSession.findOne({
    _id: req.params.sessionId,
    userId: req.userId,
    status: "paused"
  }).populate("taskId");

  if (!session) {
    throw new AppError("Paused session not found.", 404);
  }

  session.status = "running";
  session.remainingSeconds = Math.max(0, Number(remainingSeconds || session.remainingSeconds));
  session.lastResumedAt = new Date();
  await session.save();

  res.json({ session: serializeSession(session) });
}

export async function completeCurrentSession(req, res) {
  const session = await FocusSession.findOne({
    _id: req.params.sessionId,
    userId: req.userId,
    status: { $in: ["running", "paused"] }
  }).populate("taskId");

  if (!session) {
    throw new AppError("Active session not found.", 404);
  }

  await completeSession(session, { remainingSeconds: 0 });
  const completed = await FocusSession.findById(session._id).populate("taskId");
  res.json({ session: serializeSession(completed) });
}

export async function cancelCurrentSession(req, res) {
  const session = await FocusSession.findOne({
    _id: req.params.sessionId,
    userId: req.userId,
    status: { $in: ["running", "paused"] }
  });

  if (!session) {
    throw new AppError("Active session not found.", 404);
  }

  session.status = "cancelled";
  session.endedAt = new Date();
  await session.save();
  await syncDailyActivity({ userId: req.userId, date: session.date });

  res.status(204).send();
}
