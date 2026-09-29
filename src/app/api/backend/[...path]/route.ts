import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/config/env";
import { parseSetCookie } from "@/lib/api/set-cookie";

/**
 * Same-origin proxy to the real backend (a different registrable domain —
 * Render vs. this app's Railway host). Without this, a cookie the backend
 * sets can only ever live under its own domain: the browser never attaches
 * it to requests for *this* origin, so Server Components (`serverApiFetch`)
 * and `proxy.ts`'s session check can never see it, no matter what
 * SameSite/Secure the backend uses. Routing browser requests through here
 * instead lets us re-issue the session cookie scoped to this app's own
 * domain, which those server-side checks already know how to read.
 *
 * `client.ts` calls this (via a relative `/api/backend` path) instead of
 * hitting `env.apiUrl` directly from the browser.
 */
async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const targetUrl = `${env.apiUrl}/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) headers.set("cookie", cookieHeader);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: { code: "NETWORK_ERROR", message: "Could not reach the backend" } },
      { status: 502 },
    );
  }

  const responseText = await backendRes.text();
  const responseContentType = backendRes.headers.get("content-type") ?? "application/json";

  const nextResponse = new NextResponse(responseText, {
    status: backendRes.status,
    headers: { "content-type": responseContentType },
  });

  for (const raw of backendRes.headers.getSetCookie()) {
    const parsed = parseSetCookie(raw);
    if (!parsed) continue;
    nextResponse.cookies.set(parsed.name, parsed.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(parsed.maxAge !== undefined ? { maxAge: parsed.maxAge } : {}),
      ...(parsed.expires ? { expires: parsed.expires } : {}),
    });
  }

  return nextResponse;
}

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: NextRequest, ctx: RouteContext) {
  return proxy(request, (await ctx.params).path);
}
export async function POST(request: NextRequest, ctx: RouteContext) {
  return proxy(request, (await ctx.params).path);
}
export async function PATCH(request: NextRequest, ctx: RouteContext) {
  return proxy(request, (await ctx.params).path);
}
export async function PUT(request: NextRequest, ctx: RouteContext) {
  return proxy(request, (await ctx.params).path);
}
export async function DELETE(request: NextRequest, ctx: RouteContext) {
  return proxy(request, (await ctx.params).path);
}
