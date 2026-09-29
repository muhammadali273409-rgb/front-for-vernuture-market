export interface ParsedSetCookie {
  name: string;
  value: string;
  maxAge?: number;
  expires?: Date;
}

/**
 * Parses one Set-Cookie header string into name/value/lifetime. Only what we
 * need to re-issue the cookie on a different origin — Domain and SameSite
 * from the source are intentionally dropped (see callers).
 */
export function parseSetCookie(setCookieString: string): ParsedSetCookie | null {
  const [nameValue, ...attrs] = setCookieString.split(";").map((part) => part.trim());
  const eqIndex = nameValue.indexOf("=");
  if (eqIndex === -1) return null;

  const name = nameValue.slice(0, eqIndex);
  const value = nameValue.slice(eqIndex + 1);
  let maxAge: number | undefined;
  let expires: Date | undefined;

  for (const attr of attrs) {
    const eq = attr.indexOf("=");
    if (eq === -1) continue;
    const key = attr.slice(0, eq).toLowerCase();
    const val = attr.slice(eq + 1);
    if (key === "max-age") {
      const n = Number(val);
      if (!Number.isNaN(n)) maxAge = n;
    } else if (key === "expires") {
      const d = new Date(val);
      if (!Number.isNaN(d.getTime())) expires = d;
    }
  }

  return { name, value, maxAge, expires };
}
