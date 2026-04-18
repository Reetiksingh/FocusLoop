import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import {
  getRefreshCookieOptions,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/authTokens.js";
import { validateLoginPayload, validateRegisterPayload } from "../validators/requestValidators.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    timezone: user.timezone
  };
}

async function issueTokens(user, res) {
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.cookie("lifepro_refresh_token", refreshToken, getRefreshCookieOptions());

  return {
    user: sanitizeUser(user),
    accessToken
  };
}

export async function register(req, res) {
  const { name, email, password, timezone } = validateRegisterPayload(req.body);

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError("An account already exists for that email.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    timezone: timezone || "UTC"
  });

  const payload = await issueTokens(user, res);
  res.status(201).json(payload);
}

export async function login(req, res) {
  const { email, password } = validateLoginPayload(req.body);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const payload = await issueTokens(user, res);
  res.json(payload);
}

export async function refresh(req, res) {
  const token = req.cookies.lifepro_refresh_token;
  if (!token) {
    throw new AppError("Refresh token is missing.", 401);
  }

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.sub);
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    throw new AppError("Refresh token is invalid.", 401);
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  res.cookie("lifepro_refresh_token", refreshToken, getRefreshCookieOptions());
  res.json({
    user: sanitizeUser(user),
    accessToken
  });
}

export async function getMe(req, res) {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.json({ user: sanitizeUser(user) });
}

export async function logout(req, res) {
  if (req.userId) {
    await User.findByIdAndUpdate(req.userId, { refreshTokenHash: null });
  }

  res.clearCookie("lifepro_refresh_token", getRefreshCookieOptions());
  res.status(204).send();
}
