import { Journal } from "../models/Journal.js";
import { Task } from "../models/Task.js";
import { FocusSession } from "../models/FocusSession.js";
import { DailyActivity } from "../models/DailyActivity.js";
import { getActiveStreak, getHeatmap, syncDailyActivity } from "../services/activityService.js";
import { listPastDates } from "../utils/date.js";
import { validateHeatmapQuery, validateSummaryQuery } from "../validators/requestValidators.js";

async function buildCoachSummary(userId, date) {
  const lastSevenDates = listPastDates(7);
  const [recentSessions, pendingTasks, quickWins] = await Promise.all([
    FocusSession.find({ userId, date: { $in: lastSevenDates }, sessionType: "focus" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Task.countDocuments({ userId, date, status: { $ne: "completed" } }),
    Task.countDocuments({ userId, date, status: "completed", completedWithoutFocus: true })
  ]);

  const cancelledCount = recentSessions.filter(session => session.status === "cancelled").length;
  const completedSessions = recentSessions.filter(session => session.status === "completed");
  const completedCount = completedSessions.length;
  const averageCompletedMinutes =
    completedCount > 0
      ? Math.round(
          completedSessions.reduce((total, session) => total + session.plannedMinutes, 0) / completedCount
        )
      : 0;

  let recommendedFocusMinutes = 25;
  if (cancelledCount >= 3 && completedCount <= 1) {
    recommendedFocusMinutes = 10;
  } else if (averageCompletedMinutes >= 35 && completedCount >= 3) {
    recommendedFocusMinutes = Math.min(45, averageCompletedMinutes);
  } else if (completedCount > 0) {
    recommendedFocusMinutes = Math.max(15, Math.min(35, averageCompletedMinutes));
  }

  return {
    rescueMode: cancelledCount >= 3 && completedCount <= 1,
    rescueMessage:
      cancelledCount >= 3 && completedCount <= 1
        ? "You have been bouncing out of focus blocks. Try a 10-minute recovery sprint or close one quick win."
        : pendingTasks > 0
          ? "Pick one unfinished task and commit to a single clean session."
          : "Your execution loop looks steady. Use reflection to lock in the pattern.",
    recommendedFocusMinutes,
    pendingTasks,
    quickWins
  };
}

async function buildWeeklyReport(userId) {
  const weeklyDates = listPastDates(7);
  const [activities, recentSessions] = await Promise.all([
    DailyActivity.find({ userId, date: { $in: weeklyDates } }).lean(),
    FocusSession.find({ userId, date: { $in: weeklyDates }, sessionType: "focus" }).lean()
  ]);

  const activityMap = new Map(activities.map(item => [item.date, item]));
  const normalizedActivities = weeklyDates.map(date => activityMap.get(date) || null);

  const totalCompletedTasks = normalizedActivities.reduce((total, item) => total + (item?.completedTasks || 0), 0);
  const totalFocusSessions = normalizedActivities.reduce((total, item) => total + (item?.focusSessions || 0), 0);
  const reflectionDays = normalizedActivities.filter(item => item?.reflectionSaved).length;
  const bestDay =
    normalizedActivities
      .filter(Boolean)
      .sort((left, right) => (right.score || 0) - (left.score || 0))[0]?.date || weeklyDates[weeklyDates.length - 1];
  const cancelledSessions = recentSessions.filter(session => session.status === "cancelled").length;

  return {
    totalCompletedTasks,
    totalFocusSessions,
    reflectionDays,
    cancelledSessions,
    bestDay,
    headline:
      totalFocusSessions >= 5
        ? "Strong execution week."
        : reflectionDays >= 4
          ? "Reflection is becoming a habit."
          : "Momentum is building, but the week still needs a stronger execution rhythm."
  };
}

export async function getSummary(req, res) {
  const { date } = validateSummaryQuery(req.query);

  await syncDailyActivity({ userId: req.userId, date });

  const [totalTasks, completedTasks, focusSessions, journal, activeStreak, coach, weeklyReport] = await Promise.all([
    Task.countDocuments({ userId: req.userId, date }),
    Task.countDocuments({ userId: req.userId, date, status: "completed" }),
    FocusSession.countDocuments({ userId: req.userId, date, sessionType: "focus", status: "completed" }),
    Journal.findOne({ userId: req.userId, date }).lean(),
    getActiveStreak(req.userId),
    buildCoachSummary(req.userId, date),
    buildWeeklyReport(req.userId)
  ]);

  const reflectionSaved = Boolean(journal && (journal.content.trim() || journal.intention.trim()));

  res.json({
    summary: {
      date,
      totalTasks,
      completedTasks,
      focusSessions,
      reflectionSaved,
      activeStreak,
      closureNeeded: totalTasks > 0 && completedTasks === totalTasks && !reflectionSaved,
      coach
    },
    weeklyReport
  });
}

export async function getHeatmapStats(req, res) {
  const { days } = validateHeatmapQuery(req.query);
  const heatmap = await getHeatmap(req.userId, days);
  const activeStreak = await getActiveStreak(req.userId);

  res.json({
    heatmap,
    activeStreak
  });
}
