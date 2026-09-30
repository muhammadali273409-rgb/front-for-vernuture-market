import "server-only";
import { redirect } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { serverApiFetch } from "@/lib/api/server";
import { isSellerRole } from "@/lib/auth/roles";

/**
 * Server-side gate for seller-only dashboard sections. Keeps buyers out of
 * UI that would only ever return 403s — the backend still enforces the
 * actual permission on every request.
 */
export async function requireSellerRole(): Promise<void> {
  const user = await authApi.me(serverApiFetch);
  if (!isSellerRole(user.role)) {
    redirect("/dashboard");
  }
}
