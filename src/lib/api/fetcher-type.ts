/** Structural type shared by `apiFetch` (client) and `serverApiFetch` (server), so API
 * resource modules can accept either without depending on `next/headers` in client bundles. */
export type ApiFetcher = <T>(path: string, options?: Record<string, unknown>) => Promise<T>;
