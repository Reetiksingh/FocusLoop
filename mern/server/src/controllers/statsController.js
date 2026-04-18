import { Journal } from "../models/Journal.js";
import { Task } from "../models/Task.js";
import { FocusSession } from "../models/FocusSession.js";
import { getActiveStreak, getHeatmap, syncDailyActivity } from "../services/activityService.js";
import { AppError } from "../utils/AppError.js";

export async function getSummary(req, res) {
  const date = req.query.date;
  if (!date) {
    throw new AppError("Query parameter date is required.", 400);
  }

  await syncDailyActivity({ userId: req.userId, date });

  const [totalTasks, completedTasks, focusSessions, journal, activeStreak] = await Promise.all([
    Task.countDocuments({ userId: req.userId, date }),
    Task.countDocuments({ userId: req.userId, date, status: "completed" }),
    FocusSession.countDocuments({ userId: req.userId, date, sessionType: "focus", status: "completed" }),
    Journal.findOne({ userId: req.userId, date }).lean(),
    getActiveStreak(req.userId)
  ]);

  res.json({
    summary: {
      date,
      totalTasks,
      completedTasks,
      focusSessions,
      reflectionSaved: Boolean(journal && (journal.content.trim() || journal.intention.trim())),
      activeStreak
    }
  });
}

export async function getHeatmapStats(req, res) {
  const days = Math.min(180, Math.max(7, Number(req.query.days || 35)));
  const heatmap = await getHeatmap(req.userId, days);
  const activeStreak = await getActiveStreak(req.userId);

  res.json({
    heatmap,
    activeStreak
  });
}
