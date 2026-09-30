import { env } from "@/lib/config/env";
import { apiErrorFromResponse, unwrapEnvelope } from "@/lib/api/error";

interface PublicFetchOptions {
  revalidate?: number | false;
}

/**
 * Server-side fetch for public, unauthenticated endpoints (marketplace search,
 * listing detail). Supports Next.js ISR caching since it never needs the
 * viewer's cookies — unlike `serverApiFetch`, which always forwards them.
 */
export async function publicApiFetch<T>(path: string, options: PublicFetchOptions = {}): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    next: { revalidate: options.revalidate ?? 60 },
  });

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw apiErrorFromResponse(res, parsed);
  }

  return unwrapEnvelope<T>(parsed);
}
