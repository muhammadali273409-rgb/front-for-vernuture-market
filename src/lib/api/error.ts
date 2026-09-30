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
 * backend/exception message is never shown to the user, except a
 * validation message when the caller opts in via `showValidationDetail`.
 */
const ERROR_CODE_ALIASES: Record<string, string> = {
  FORBIDDEN: "AUTH_FORBIDDEN",
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_TAKEN",
  EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
};

export interface FriendlyErrorOptions {
  /**
   * Show the backend's own message for a validation failure (400/422)
   * instead of the generic translated text. Opt-in per form, since the
   * backend's validation messages are English-only.
   */
  showValidationDetail?: boolean;
}

export function friendlyErrorMessage(
  error: unknown,
  t: TFunction,
  options: FriendlyErrorOptions = {},
): string {
  if (error instanceof ApiError) {
    if (options.showValidationDetail && isValidationError(error) && hasSpecificMessage(error)) {
      return error.message;
    }
    const key = ERROR_CODE_ALIASES[error.code] ?? error.code;
    return t(`errors:${key}`, { defaultValue: t("errors:UNKNOWN_ERROR") });
  }
  if (error instanceof Error && (error.message === "Failed to fetch" || error.name === "TypeError")) {
    return t("errors:NETWORK_ERROR");
  }
  return t("errors:UNKNOWN_ERROR");
}

function isValidationError(error: ApiError): boolean {
  return error.code === "VALIDATION_ERROR" || error.status === 400 || error.status === 422;
}

/** True when the message says more than the bare HTTP status text ("Bad Request"). */
function hasSpecificMessage(error: ApiError): boolean {
  const message = error.message.trim();
  return message !== "" && message.toLowerCase() !== "bad request" && message !== "Request failed";
}

function messageFromUnknownBody(parsed: unknown): string | undefined {
  if (!parsed || typeof parsed !== "object") return undefined;
  const { message } = parsed as { message?: unknown };
  if (typeof message === "string") return message;
  // NestJS ValidationPipe sends one string per failed constraint.
  if (Array.isArray(message)) {
    const parts = message.filter((m): m is string => typeof m === "string");
    if (parts.length > 0) return parts.join(". ");
  }
  const { error } = parsed as { error?: unknown };
  return typeof error === "string" ? error : undefined;
}

/**
 * Build the ApiError for a non-OK response. Handles the documented
 * `{ error: { code, message } }` envelope as well as the plain NestJS shape
 * (`{ error: "Bad Request", message?: string | string[] }`) the backend
 * still returns for request validation failures.
 */
export function apiErrorFromResponse(res: Response, parsed: unknown): ApiError {
  if (isApiErrorBody(parsed)) {
    return new ApiError(res.status, parsed.error.code, parsed.error.message, parsed.requestId);
  }
  const requestId =
    parsed && typeof parsed === "object" && typeof (parsed as { requestId?: unknown }).requestId === "string"
      ? (parsed as { requestId: string }).requestId
      : undefined;
  const code = res.status === 400 || res.status === 422 ? "VALIDATION_ERROR" : "UNKNOWN_ERROR";
  const message = messageFromUnknownBody(parsed) ?? (res.statusText || "Request failed");
  return new ApiError(res.status, code, message, requestId);
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
