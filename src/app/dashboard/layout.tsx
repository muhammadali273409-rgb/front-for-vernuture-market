import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { serverApiFetch } from "@/lib/api/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ApiError } from "@/lib/api/error";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("dashboard");
  return {
    title: {
      default: t("dashboard"),
      template: `%s · ${t("dashboard")} · VentureMarket`,
    },
    // Authenticated workspace: never expose deal/offer/document data to search engines.
    robots: { index: false, follow: false },
  };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user: Awaited<ReturnType<typeof authApi.me>>;
  try {
    user = await authApi.me(serverApiFetch);
  } catch (error) {
    // A 401 means there is genuinely no valid session (never logged in, or
    // logged out) — this protected area must reject that.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    // Any other failure (backend unreachable, 5xx) is a real error — let it
    // propagate to the nearest error boundary instead of rendering a fake user.
    throw error;
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

