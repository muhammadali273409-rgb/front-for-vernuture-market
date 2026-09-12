import { env } from "@/lib/config/env";
import { ApiError, isApiErrorBody, unwrapEnvelope } from "@/lib/api/error";

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the automatic silent-refresh-and-retry on a 401 (used by auth endpoints themselves). */
  skipAuthRetry?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${env.apiUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Client-side API fetch. Relies on the browser automatically attaching the
 * httpOnly access_token/refresh_token cookies set by the backend — this app
 * never reads or stores tokens in JS. On a 401 it transparently attempts one
 * refresh + retry before surfacing the error, so short-lived access tokens
 * don't interrupt the user mid-session.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, skipAuthRetry, headers, ...rest } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const doFetch = () =>
    fetch(`${env.apiUrl}${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      // FormData bodies are sent as-is so the browser can set the multipart boundary itself.
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuthRetry && !path.startsWith("/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await doFetch();
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const parsed = await parseBody(res);

  if (!res.ok) {
    if (isApiErrorBody(parsed)) {
      throw new ApiError(res.status, parsed.error.code, parsed.error.message, parsed.requestId);
    }
    throw new ApiError(res.status, "UNKNOWN_ERROR", res.statusText || "Request failed");
  }

  return unwrapEnvelope<T>(parsed);
}

export async function apiFetchRaw<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const result = await apiFetch<T>(path, options);
  return result;
}
