import { DailyActivity } from "../models/DailyActivity.js";
import { FocusSession } from "../models/FocusSession.js";
import { Journal } from "../models/Journal.js";
import { Task } from "../models/Task.js";
import { listPastDates } from "../utils/date.js";

function getActivityLevel(score) {
  if (score <= 0) return 0;
  if (score === 1) return 1;
  if (score <= 3) return 2;
  if (score <= 5) return 3;
  return 4;
}

export async function syncDailyActivity({ userId, date }) {
  const [completedTasks, focusSessions, journal] = await Promise.all([
    Task.countDocuments({ userId, date, status: "completed" }),
    FocusSession.countDocuments({ userId, date, sessionType: "focus", status: "completed" }),
    Journal.findOne({ userId, date }).lean()
  ]);

  const reflectionSaved = Boolean(journal && (journal.content.trim() || journal.intention.trim()));
  const score = completedTasks + focusSessions + (reflectionSaved ? 1 : 0);

  return DailyActivity.findOneAndUpdate(
    { userId, date },
    { completedTasks, focusSessions, reflectionSaved, score },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function getActiveStreak(userId) {
  const dates = listPastDates(365);
  const activityMap = new Map(
    (await DailyActivity.find({ userId, date: { $in: dates } }).lean()).map(item => [item.date, item.score])
  );

  let streak = 0;
  for (let index = dates.length - 1; index >= 0; index -= 1) {
    const date = dates[index];
    if ((activityMap.get(date) || 0) <= 0) break;
    streak += 1;
  }

  return streak;
}

export async function getHeatmap(userId, days = 35) {
  const dates = listPastDates(days);
  const items = await DailyActivity.find({ userId, date: { $in: dates } }).lean();
  const activityMap = new Map(items.map(item => [item.date, item]));

  return dates.map(date => {
    const activity = activityMap.get(date);
    const score = activity?.score || 0;
    return {
      date,
      score,
      level: getActivityLevel(score),
      completedTasks: activity?.completedTasks || 0,
      focusSessions: activity?.focusSessions || 0,
      reflectionSaved: activity?.reflectionSaved || false
    };
  });
}
