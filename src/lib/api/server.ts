import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import { apiErrorFromResponse, unwrapEnvelope } from "@/lib/api/error";

interface ServerFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Server Component / Route Handler API fetch. Forwards the incoming
 * request's auth cookies to the backend so authenticated server-rendered
 * pages see the same session as the browser. Does not attempt token
 * refresh — a 401 here means the caller should treat the user as
 * unauthenticated (e.g. redirect to /login).
 */
export async function serverApiFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    cache: rest.cache ?? "no-store",
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw apiErrorFromResponse(res, parsed);
  }

  return unwrapEnvelope<T>(parsed);
}
