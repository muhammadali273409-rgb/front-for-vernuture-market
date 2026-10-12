"use client";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";
import { useRealtimeSync } from "@/hooks/use-realtime";
import type { CurrentUser } from "@/types/domain";

export function DashboardShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  useRealtimeSync();

  return (
    <div className="flex min-h-svh pb-14 md:pb-0">
      <DashboardSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} />
        <VerifyEmailBanner user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <MobileBottomNav role={user.role} />
    </div>
  );
}

