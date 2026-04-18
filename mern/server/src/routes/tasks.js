import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get("/", (req, res) => {
  res.status(501).json({ message: "Tasks list route scaffolded." });
});

tasksRouter.post("/", (req, res) => {
  res.status(501).json({ message: "Create task route scaffolded." });
});

tasksRouter.patch("/:taskId", (req, res) => {
  res.status(501).json({ message: "Update task route scaffolded." });
});

tasksRouter.delete("/:taskId", (req, res) => {
  res.status(501).json({ message: "Delete task route scaffolded." });
});
