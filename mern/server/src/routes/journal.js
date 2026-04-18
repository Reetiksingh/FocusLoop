import { Router } from "express";
import { getJournalByDate, upsertJournal } from "../controllers/journalController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const journalRouter = Router();

journalRouter.use(protect);

journalRouter.get("/:date", asyncHandler(getJournalByDate));
journalRouter.put("/:date", asyncHandler(upsertJournal));
