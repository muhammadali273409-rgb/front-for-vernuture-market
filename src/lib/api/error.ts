import type { TFunction } from "i18next";
import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

/**
 * Backend error codes that don't already match an `errors.json` key 1:1
 * (either a naming difference, or a legacy alias still sent by some
 * endpoints). Anything not listed here is looked up under its own code, and
 * anything not found there falls back to `errors:UNKNOWN_ERROR` — a raw
 * backend/exception message is never shown to the user.
 */
const ERROR_CODE_ALIASES: Record<string, string> = {
  FORBIDDEN: "AUTH_FORBIDDEN",
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_TAKEN",
  EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
};

export function friendlyErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    const key = ERROR_CODE_ALIASES[error.code] ?? error.code;
    return t(`errors:${key}`, { defaultValue: t("errors:UNKNOWN_ERROR") });
  }
  if (error instanceof Error && (error.message === "Failed to fetch" || error.name === "TypeError")) {
    return t("errors:NETWORK_ERROR");
  }
  return t("errors:UNKNOWN_ERROR");
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.code === "string"
  );
}

/**
 * Every successful response is wrapped as either `{ data }` or, for cursor
 * pagination, `{ data, pagination }` (see API.md). Only unwrap the plain
 * `{ data }` case — a paginated envelope must be returned whole, since it
 * also has a top-level `data` key that would otherwise be stripped along
 * with `pagination`.
 */
export function unwrapEnvelope<T>(parsed: unknown): T {
  if (parsed && typeof parsed === "object" && "data" in parsed) {
    if ("pagination" in parsed) {
      return parsed as T;
    }
    return (parsed as { data: T }).data;
  }
  return parsed as T;
}
