import { Router } from "express";

export const authRouter = Router();

authRouter.post("/signup", (req, res) => {
  res.status(501).json({ message: "Signup route scaffolded." });
});

authRouter.post("/login", (req, res) => {
  res.status(501).json({ message: "Login route scaffolded." });
});

authRouter.post("/logout", (req, res) => {
  res.status(204).send();
});
