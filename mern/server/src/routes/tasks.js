import { Router } from "express";
import { createTask, deleteTask, listTasks, updateTask } from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const tasksRouter = Router();

tasksRouter.use(protect);

tasksRouter.get("/", asyncHandler(listTasks));
tasksRouter.post("/", asyncHandler(createTask));
tasksRouter.patch("/:taskId", asyncHandler(updateTask));
tasksRouter.delete("/:taskId", asyncHandler(deleteTask));
