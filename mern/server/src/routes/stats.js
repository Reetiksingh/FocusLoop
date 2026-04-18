import { Router } from "express";
import { getHeatmapStats, getSummary } from "../controllers/statsController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const statsRouter = Router();

statsRouter.use(protect);

statsRouter.get("/summary", asyncHandler(getSummary));
statsRouter.get("/heatmap", asyncHandler(getHeatmapStats));
