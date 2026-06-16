import type { SeverityLevel } from "@sentry/react";

export type VisibilityMode = "verbose" | "normal";

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const TOKEN_PARAM_REGEX = /token=[^&\s]+/gi;
const PASSWORD_PARAM_REGEX = /password=[^&\s]+/gi;
const BEARER_REGEX = /Bearer\s+[\w.-]+/gi;

export function sanitizeUuid(value: string): string {
  return value.replace(UUID_REGEX, "[id]");
}

export function sanitizeTokenParam(value: string): string {
  return value.replace(TOKEN_PARAM_REGEX, "token=[REDACTED]");
}

export function sanitizeUrl(value: string): string {
  return sanitizeUuid(sanitizeTokenParam(value)).replace(
    PASSWORD_PARAM_REGEX,
    "password=[REDACTED]",
  );
}

export function getVisibilityMode(): VisibilityMode {
  const mode = import.meta.env.VITE_SENTRY_VISIBILITY_MODE?.toLowerCase();
  return mode === "normal" ? "normal" : "verbose";
}

export function isVerboseMode(): boolean {
  return getVisibilityMode() === "verbose";
}

const SENSITIVE_KEYS = [
  "authorization",
  "password",
  "token",
  "accesstoken",
  "access_token",
  "secret",
  "apikey",
  "api_key",
  "bearer",
  "cookie",
];

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_]/g, "");
  return SENSITIVE_KEYS.some((sensitive) => normalized.includes(sensitive));
}

function sanitizeStringValue(value: string): string {
  return sanitizeUrl(value).replace(BEARER_REGEX, "Bearer [REDACTED]");
}

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return sanitizeStringValue(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = isSensitiveKey(key) ? "[REDACTED]" : sanitizeValue(val);
    }
    return result;
  }
  return value;
}

export function sanitizeSentryData<T>(value: T): T {
  return sanitizeValue(value) as T;
}

export function sanitizeRoute(pathname: string): string {
  return pathname
    .replace(UUID_REGEX, ":id")
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(TOKEN_PARAM_REGEX, "token=[REDACTED]");
}

const reportedErrors = new WeakSet<object>();
const authWarningTimestamps = new Map<string, number>();
const AUTH_WARNING_COOLDOWN_MS = 60_000;

export function shouldReportError(error: unknown): boolean {
  if (error && typeof error === "object") {
    if (reportedErrors.has(error)) return false;
    reportedErrors.add(error);
  }
  return true;
}

export function shouldReportAuthWarning(reason: string): boolean {
  if (!isVerboseMode()) return false;

  const now = Date.now();
  const last = authWarningTimestamps.get(reason) ?? 0;
  if (now - last < AUTH_WARNING_COOLDOWN_MS) return false;

  authWarningTimestamps.set(reason, now);
  return true;
}

export function httpLevel(status: number | undefined): SeverityLevel {
  if (status === undefined) return "error";
  if (status >= 500) return "error";
  return "warning";
}

export function shouldReportHttpStatus(status: number | undefined): boolean {
  if (status === undefined) return true;
  if (status >= 500) return true;
  if (isVerboseMode()) return true;
  return false;
}
