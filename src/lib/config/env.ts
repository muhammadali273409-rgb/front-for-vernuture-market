function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  apiUrl: requireEnv("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
  /** Optional — "Continue with Google" is hidden when this isn't set. */
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || undefined,
};
