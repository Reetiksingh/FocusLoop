import { Journal } from "../models/Journal.js";
import { syncDailyActivity } from "../services/activityService.js";
import { validateDateParam, validateJournalPayload } from "../validators/requestValidators.js";

export async function getJournalByDate(req, res) {
  const date = validateDateParam(req.params.date, "Journal date");
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
  const date = validateDateParam(req.params.date, "Journal date");
  const { intention = "", content = "" } = validateJournalPayload(req.body);

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
