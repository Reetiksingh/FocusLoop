import { Router } from "express";
import { getMe, login, logout, refresh, register } from "../controllers/authController.js";
import { optionalAuth, protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/refresh", asyncHandler(refresh));
authRouter.get("/me", protect, asyncHandler(getMe));
authRouter.post("/logout", optionalAuth, asyncHandler(logout));
