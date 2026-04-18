import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const journalRouter = Router();

journalRouter.use(requireAuth);

journalRouter.get("/:date", (req, res) => {
  res.status(501).json({ message: "Journal fetch route scaffolded." });
});

journalRouter.put("/:date", (req, res) => {
  res.status(501).json({ message: "Journal save route scaffolded." });
});
