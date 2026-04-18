import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const statsRouter = Router();

statsRouter.use(requireAuth);

statsRouter.get("/summary", (req, res) => {
  res.status(501).json({ message: "Stats summary route scaffolded." });
});

statsRouter.get("/heatmap", (req, res) => {
  res.status(501).json({ message: "Heatmap route scaffolded." });
});
