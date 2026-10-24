import type { TFunction } from "i18next";
import type { ApiErrorBody } from "@/types/api";
import { backendMessageKey } from "@/lib/api/backend-messages";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly details?: unknown;
  /** Per-field messages from the backend, e.g. `{ email: "...", password: "..." }`. */
  readonly fields?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    requestId?: string,
    details?: unknown,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
    this.fields = fields;
  }
}

/**
 * Backend error codes that don't already match an `errors.json` key 1:1
 * (either a naming difference, or a legacy alias still sent by some
 * endpoints). Anything not listed here is looked up under its own code.
 */
const ERROR_CODE_ALIASES: Record<string, string> = {
  FORBIDDEN: "AUTH_FORBIDDEN",
  DOCUMENT_INVALID_FILE: "INVALID_FILE",
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_TAKEN",
  EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
};

/**
 * Codes too broad to explain anything by themselves — for these the
 * backend's message is the real reason ("Only the buyer can close due
 * diligence"), so it wins over the code's generic translation.
 */
const GENERIC_CODES = new Set([
  "CONFLICT",
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "UNKNOWN_ERROR",
  "DEAL_ACCESS_DENIED",
  "DEAL_INVALID_STATE_TRANSITION",
]);

export interface FriendlyErrorOptions {
  /**
   * @deprecated The backend's specific message is now always preferred over
   * a generic translation; kept so existing call sites still compile.
   */
  showValidationDetail?: boolean;
}

/**
 * What to tell the user about a failed request, in order of preference:
 * 1. a translation of the backend's own message (`errors:backend.*`),
 * 2. the translation of a specific error code,
 * 3. the backend's message itself (for 4xx with a real message),
 * 4. a generic translated fallback.
 */
export function friendlyErrorMessage(
  error: unknown,
  t: TFunction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: FriendlyErrorOptions = {},
): string {
  if (error instanceof ApiError) {
    const vars = { ...detailVars(error.details), reason: error.message };
    const messageKey = hasSpecificMessage(error) ? backendMessageKey(error.message) : undefined;
    if (messageKey) {
      return t(`errors:backend.${messageKey}`, { ...vars, defaultValue: error.message });
    }
    const key = ERROR_CODE_ALIASES[error.code] ?? error.code;
    if (!GENERIC_CODES.has(key)) {
      const translated = t(`errors:${key}`, { ...vars, defaultValue: "" });
      if (translated) return translated;
    }
    if (error.status < 500 && hasSpecificMessage(error)) {
      return error.message;
    }
    const fallback = error.status >= 500 ? "errors:SERVER_ERROR" : "errors:UNKNOWN_ERROR";
    return t(`errors:${key}`, { ...vars, defaultValue: t(fallback) });
  }
  if (error instanceof Error && (error.message === "Failed to fetch" || error.name === "TypeError")) {
    return t("errors:NETWORK_ERROR");
  }
  return t("errors:UNKNOWN_ERROR");
}

/** Numeric `details` (e.g. `{ openItems: 2 }`) become interpolation values; `openItems` also drives plurals. */
function detailVars(details: unknown): Record<string, string | number> {
  if (!details || typeof details !== "object") return {};
  const vars: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(details)) {
    if (typeof v === "number" || typeof v === "string") vars[k] = v;
  }
  if (typeof vars.openItems === "number") vars.count = vars.openItems;
  return vars;
}

const STATUS_TEXTS = new Set([
  "bad request",
  "request failed",
  "forbidden",
  "not found",
  "conflict",
  "internal server error",
  "unauthorized",
]);

/** True when the message says more than the bare HTTP status text ("Bad Request"). */
function hasSpecificMessage(error: ApiError): boolean {
  const message = error.message.trim();
  return message !== "" && !STATUS_TEXTS.has(message.toLowerCase());
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
    return new ApiError(
      res.status,
      parsed.error.code,
      parsed.error.message,
      parsed.requestId,
      parsed.error.details,
      parsed.error.fields,
    );
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
