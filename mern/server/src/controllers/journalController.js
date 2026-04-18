import { Journal } from "../models/Journal.js";
import { syncDailyActivity } from "../services/activityService.js";
import { AppError } from "../utils/AppError.js";

export async function getJournalByDate(req, res) {
  const { date } = req.params;
  const journal = await Journal.findOne({ userId: req.userId, date });

  res.json({
    journal: journal
      ? {
          id: journal._id,
          date: journal.date,
          intention: journal.intention,
          content: journal.content
        }
      : {
          date,
          intention: "",
          content: ""
        }
  });
}

export async function upsertJournal(req, res) {
  const { date } = req.params;
  const { intention = "", content = "" } = req.body;
  if (!date) {
    throw new AppError("A journal date is required.", 400);
  }

  const journal = await Journal.findOneAndUpdate(
    { userId: req.userId, date },
    { intention, content },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await syncDailyActivity({ userId: req.userId, date });
  res.json({
    journal: {
      id: journal._id,
      date: journal.date,
      intention: journal.intention,
      content: journal.content
    }
  });
}
