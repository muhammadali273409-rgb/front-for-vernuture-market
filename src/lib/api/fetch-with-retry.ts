/**
 * Server-side fetch to the backend with a per-attempt timeout and a retry for
 * transient failures. The backend runs on Render's free plan, which sleeps
 * after inactivity: the first request after a sleep can hang for ~50 s and
 * then come back as a 502/503 HTML page, or fail at the network level.
 *
 * Only idempotent methods (GET/HEAD) are retried — replaying a POST could
 * create a duplicate offer, message, etc.
 */

/** Long enough to sit through a Render cold start (~50 s). */
const ATTEMPT_TIMEOUT_MS = 60_000;
const RETRY_DELAY_MS = 1_500;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

export interface FetchWithRetryOptions extends RequestInit {
  /** Extra attempts after the first one. Default: 1 for GET/HEAD, 0 otherwise. */
  retries?: number;
  timeoutMs?: number;
}

export async function fetchWithRetry(url: string, options: FetchWithRetryOptions = {}): Promise<Response> {
  const { retries, timeoutMs = ATTEMPT_TIMEOUT_MS, signal, ...init } = options;
  const method = (init.method ?? "GET").toUpperCase();
  const maxRetries = retries ?? (method === "GET" || method === "HEAD" ? 1 : 0);

  for (let attempt = 0; ; attempt++) {
    const timeout = AbortSignal.timeout(timeoutMs);
    const attemptSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const isLastAttempt = attempt >= maxRetries;

    try {
      const res = await fetch(url, { ...init, signal: attemptSignal });
      if (!RETRYABLE_STATUSES.has(res.status) || isLastAttempt) return res;
      console.warn(`[fetchWithRetry] ${method} ${url} -> ${res.status}, retrying (${attempt + 1}/${maxRetries})`);
    } catch (error) {
      // The caller aborted on purpose — don't retry.
      if (signal?.aborted || isLastAttempt) throw error;
      console.warn(`[fetchWithRetry] ${method} ${url} failed, retrying (${attempt + 1}/${maxRetries})`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
}

/** JSON.parse that tolerates the HTML error pages Render serves while waking up. */
export function parseJsonSafe(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
