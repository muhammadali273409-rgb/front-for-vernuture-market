function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  /**
   * Backend base URL, e.g. https://venture-market.onrender.com/api/v1.
   * Only used server-side (the browser goes through /api/backend).
   *
   * `API_URL` is read at runtime; `NEXT_PUBLIC_API_URL` is inlined at build
   * time, so changing it requires a rebuild. Resolved lazily so that merely
   * importing this module (e.g. from a client component that only needs
   * `googleClientId`) can never crash the page.
   */
  get apiUrl(): string {
    return requireEnv("API_URL or NEXT_PUBLIC_API_URL", process.env.API_URL || process.env.NEXT_PUBLIC_API_URL);
  },
  /** Optional — "Continue with Google" is hidden when this isn't set. */
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || undefined,
};
