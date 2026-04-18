import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

sessionsRouter.post("/", (req, res) => {
  res.status(501).json({ message: "Create focus session route scaffolded." });
});
