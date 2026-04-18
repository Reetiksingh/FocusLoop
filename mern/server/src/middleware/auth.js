import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/authTokens.js";

export function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    next(new AppError("Authorization token is missing.", 401));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch (error) {
    next(new AppError("Authorization token is invalid or expired.", 401));
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
  } catch (error) {
    req.userId = null;
  }

  next();
}
