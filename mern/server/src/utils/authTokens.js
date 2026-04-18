import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.accessTokenSecret, { expiresIn: env.accessTokenTtl });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, env.refreshTokenSecret, { expiresIn: env.refreshTokenTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.accessTokenSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshTokenSecret);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}
