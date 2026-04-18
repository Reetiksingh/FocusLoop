import { Task } from "../models/Task.js";
import { syncDailyActivity } from "../services/activityService.js";
import { AppError } from "../utils/AppError.js";

function normalizeTask(task) {
  return {
    id: task._id,
    title: task.title,
    date: task.date,
    status: task.status,
    requiresFocus: task.requiresFocus,
    completedWithoutFocus: task.completedWithoutFocus,
    focusSessionCount: task.focusSessionCount,
    completedAt: task.completedAt,
    lastFocusedAt: task.lastFocusedAt
  };
}

export async function listTasks(req, res) {
  const date = req.query.date;
  if (!date) {
    throw new AppError("Query parameter date is required.", 400);
  }

  const tasks = await Task.find({ userId: req.userId, date }).sort({ createdAt: 1 });
  res.json({ tasks: tasks.map(normalizeTask) });
}

export async function createTask(req, res) {
  const { title, date, requiresFocus = true, completedWithoutFocus = false } = req.body;
  if (!title || !date) {
    throw new AppError("Task title and date are required.", 400);
  }

  const task = await Task.create({
    userId: req.userId,
    title: title.trim(),
    date,
    requiresFocus,
    completedWithoutFocus,
    status: completedWithoutFocus ? "completed" : "planned",
    completedAt: completedWithoutFocus ? new Date() : null
  });

  await syncDailyActivity({ userId: req.userId, date });
  res.status(201).json({ task: normalizeTask(task) });
}

export async function updateTask(req, res) {
  const task = await Task.findOne({ _id: req.params.taskId, userId: req.userId });
  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  const originalDate = task.date;
  const {
    title,
    date,
    status,
    requiresFocus,
    completedWithoutFocus,
    focusSessionCount
  } = req.body;

  if (typeof title === "string") task.title = title.trim();
  if (typeof date === "string") task.date = date;
  if (typeof requiresFocus === "boolean") task.requiresFocus = requiresFocus;
  if (typeof completedWithoutFocus === "boolean") task.completedWithoutFocus = completedWithoutFocus;
  if (typeof focusSessionCount === "number") task.focusSessionCount = focusSessionCount;

  if (typeof status === "string") {
    task.status = status;
    task.completedAt = status === "completed" ? new Date() : null;
  }

  await task.save();
  await Promise.all([
    syncDailyActivity({ userId: req.userId, date: task.date }),
    originalDate !== task.date ? syncDailyActivity({ userId: req.userId, date: originalDate }) : Promise.resolve()
  ]);

  res.json({ task: normalizeTask(task) });
}

export async function deleteTask(req, res) {
  const task = await Task.findOneAndDelete({ _id: req.params.taskId, userId: req.userId });
  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  await syncDailyActivity({ userId: req.userId, date: task.date });
  res.status(204).send();
}
