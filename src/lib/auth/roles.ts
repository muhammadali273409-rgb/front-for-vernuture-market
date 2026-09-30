import type { UserRole } from "@/types/domain";

/**
 * UI-only role checks — they decide what to *show*. The backend enforces
 * every permission independently (see RolesGuard + per-resource ownership
 * checks there); never rely on these for security.
 */
export function isSellerRole(role: UserRole | undefined): boolean {
  return role === "SELLER" || role === "BUYER_SELLER";
}

export function isBuyerRole(role: UserRole | undefined): boolean {
  return role === "BUYER" || role === "BUYER_SELLER";
}

/** Where a signed-in user lands: admins get the Admin Panel, everyone else their dashboard. */
export function homePathForRole(role: UserRole | undefined): string {
  return role === "ADMIN" ? "/admin" : "/dashboard";
}
