import { FocusSession } from "../models/FocusSession.js";
import { Task } from "../models/Task.js";
import { runWithOptionalTransaction } from "../utils/transaction.js";
import { syncDailyActivity } from "./activityService.js";

async function finalizeSessionRecord(session, { remainingSeconds = 0, dbSession = null } = {}) {
  if (!session || session.status === "completed") return session;

  session.status = "completed";
  session.remainingSeconds = remainingSeconds;
  session.endedAt = new Date();
  await session.save({ session: dbSession });

  if (session.sessionType === "focus" && session.taskId) {
    const task = await Task.findOne({ _id: session.taskId, userId: session.userId }).session(dbSession);
    if (task) {
      task.focusSessionCount += 1;
      task.lastFocusedAt = new Date();
      if (task.status === "planned") {
        task.status = "in_progress";
      }
      await task.save({ session: dbSession });
    }
  }

  await syncDailyActivity({ userId: session.userId, date: session.date, dbSession });
  return session;
}

export async function completeSession(session, { remainingSeconds = 0 } = {}) {
  if (!session) return null;

  return runWithOptionalTransaction(async dbSession => {
    const sessionId = session._id || session;
    const sessionDoc = await FocusSession.findById(sessionId).session(dbSession);

    return finalizeSessionRecord(sessionDoc, { remainingSeconds, dbSession });
  });
}

export async function hydrateActiveSession(session) {
  if (!session) return null;
  if (session.status !== "running") return session;

  const elapsedSeconds = Math.floor((Date.now() - new Date(session.lastResumedAt).getTime()) / 1000);
  const nextRemaining = Math.max(session.remainingSeconds - elapsedSeconds, 0);

  if (nextRemaining === 0) {
    await completeSession(session, { remainingSeconds: 0 });
    return null;
  }

  return {
    ...session.toObject(),
    remainingSeconds: nextRemaining
  };
}
