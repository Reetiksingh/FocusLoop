import { AppError } from "../utils/AppError.js";

const VALID_TASK_STATUSES = new Set(["planned", "in_progress", "completed"]);
const VALID_SESSION_TYPES = new Set(["focus", "break", "longbreak"]);
const VALID_AMBIENT_SOUNDS = new Set(["", "rain", "wind", "waterfall", "snow"]);

function fail(message) {
  throw new AppError(message, 400);
}

function ensureObject(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(message);
  }
}

function parseTrimmedString(value, fieldName, { min = 1, max = 500, required = true } = {}) {
  if (value == null || value === "") {
    if (!required) return undefined;
    fail(`${fieldName} is required.`);
  }

  if (typeof value !== "string") {
    fail(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();
  if (trimmed.length < min) {
    fail(`${fieldName} must be at least ${min} characters.`);
  }
  if (trimmed.length > max) {
    fail(`${fieldName} must be at most ${max} characters.`);
  }

  return trimmed;
}

function parseEmail(value) {
  const email = parseTrimmedString(value, "Email", { min: 5, max: 160 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail("Email format is invalid.");
  }
  return email.toLowerCase();
}

function parseIsoDate(value, fieldName = "Date", { required = true } = {}) {
  if ((value == null || value === "") && !required) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(`${fieldName} must be in YYYY-MM-DD format.`);
  }
  return value;
}

function parseBoolean(value, fieldName, { required = false } = {}) {
  if (value == null) {
    if (!required) return undefined;
    fail(`${fieldName} is required.`);
  }
  if (typeof value !== "boolean") {
    fail(`${fieldName} must be true or false.`);
  }
  return value;
}

function parseNumber(value, fieldName, { min = 0, max = Number.MAX_SAFE_INTEGER, required = true } = {}) {
  if (value == null) {
    if (!required) return undefined;
    fail(`${fieldName} is required.`);
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    fail(`${fieldName} must be a number.`);
  }
  if (value < min || value > max) {
    fail(`${fieldName} must be between ${min} and ${max}.`);
  }
  return value;
}

function parseEnum(value, fieldName, allowedValues, { required = false } = {}) {
  if (value == null) {
    if (!required) return undefined;
    fail(`${fieldName} is required.`);
  }
  if (typeof value !== "string" || !allowedValues.has(value)) {
    fail(`${fieldName} is invalid.`);
  }
  return value;
}

export function validateRegisterPayload(body) {
  ensureObject(body, "Registration payload is invalid.");

  return {
    name: parseTrimmedString(body.name, "Name", { min: 2, max: 80 }),
    email: parseEmail(body.email),
    password: parseTrimmedString(body.password, "Password", { min: 8, max: 128 }),
    timezone: parseTrimmedString(body.timezone || "UTC", "Timezone", { min: 2, max: 80 })
  };
}

export function validateLoginPayload(body) {
  ensureObject(body, "Login payload is invalid.");

  return {
    email: parseEmail(body.email),
    password: parseTrimmedString(body.password, "Password", { min: 8, max: 128 })
  };
}

export function validateTaskCreatePayload(body) {
  ensureObject(body, "Task payload is invalid.");

  const completedWithoutFocus = parseBoolean(body.completedWithoutFocus, "completedWithoutFocus") || false;
  const requiresFocus = completedWithoutFocus ? false : parseBoolean(body.requiresFocus, "requiresFocus") ?? true;

  return {
    title: parseTrimmedString(body.title, "Task title", { min: 1, max: 180 }),
    date: parseIsoDate(body.date, "Task date"),
    requiresFocus,
    completedWithoutFocus
  };
}

export function validateTaskUpdatePayload(body) {
  ensureObject(body, "Task update payload is invalid.");

  return {
    title: parseTrimmedString(body.title, "Task title", { min: 1, max: 180, required: false }),
    date: parseIsoDate(body.date, "Task date", { required: false }),
    status: parseEnum(body.status, "Task status", VALID_TASK_STATUSES, { required: false }),
    requiresFocus: parseBoolean(body.requiresFocus, "requiresFocus"),
    completedWithoutFocus: parseBoolean(body.completedWithoutFocus, "completedWithoutFocus"),
    focusSessionCount: parseNumber(body.focusSessionCount, "focusSessionCount", {
      min: 0,
      max: 999,
      required: false
    })
  };
}

export function validateJournalPayload(body) {
  ensureObject(body, "Journal payload is invalid.");

  return {
    intention: parseTrimmedString(body.intention || "", "Intention", { min: 0, max: 280, required: false }) || "",
    content: parseTrimmedString(body.content || "", "Journal content", {
      min: 0,
      max: 8000,
      required: false
    }) || ""
  };
}

export function validateSessionCreatePayload(body) {
  ensureObject(body, "Session payload is invalid.");

  return {
    taskId: body.taskId == null || body.taskId === "" ? null : parseTrimmedString(body.taskId, "taskId", { min: 3, max: 40 }),
    date: parseIsoDate(body.date, "Session date"),
    sessionType: parseEnum(body.sessionType || "focus", "sessionType", VALID_SESSION_TYPES, { required: true }),
    plannedMinutes: parseNumber(body.plannedMinutes, "plannedMinutes", { min: 0, max: 60 }),
    ambientSound: parseEnum(body.ambientSound || "", "ambientSound", VALID_AMBIENT_SOUNDS, { required: true })
  };
}

export function validateRemainingSecondsPayload(body) {
  ensureObject(body, "Session update payload is invalid.");

  return {
    remainingSeconds: parseNumber(body.remainingSeconds, "remainingSeconds", {
      min: 0,
      max: 3600,
      required: true
    })
  };
}

export function validateSummaryQuery(query) {
  return {
    date: parseIsoDate(query.date, "Summary date")
  };
}

export function validateHeatmapQuery(query) {
  if (query.days == null) {
    return { days: 35 };
  }

  const days = Number(query.days);
  if (!Number.isInteger(days) || days < 7 || days > 180) {
    fail("Heatmap days must be an integer between 7 and 180.");
  }

  return { days };
}

export function validateDateParam(date, fieldName = "Date") {
  return parseIsoDate(date, fieldName);
}
