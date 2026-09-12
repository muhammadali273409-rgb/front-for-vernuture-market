import { redirect } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/error";
import { AdminShell } from "@/components/layout/admin-shell";

/**
 * Server-side gate for the entire Admin Panel. This is the actual access
 * control — the "Admin Panel" link some users see in their account menu is
 * only a convenience; hiding it is not what stops anyone. Every request
 * under /admin/(protected)/** re-verifies, from the authenticated session,
 * that the user's role in the database is ADMIN. The frontend never decides
 * this on its own: `authApi.me()` returns whatever the backend's JWT-verified
 * session says, and the backend's own AdminController independently applies
 * the same @Roles(ADMIN) check to every admin API call regardless of what
 * this layout does.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await authApi.me(serverApiFetch);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    // Backend unreachable / unexpected failure: fail closed, not open.
    redirect("/admin/login");
  }

  if (user.role !== "ADMIN") {
    // A genuine, authenticated non-admin account (e.g. a Seller who typed
    // /admin in the URL bar) — send them back to their own application
    // rather than the admin login, since re-authenticating wouldn't change
    // their role.
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
