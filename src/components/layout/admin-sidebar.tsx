"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Briefcase, ShieldCheck, Flag, ScrollText } from "lucide-react";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", icon: LayoutDashboard, labelKey: "overview" },
  { href: "/admin/users", icon: Users, labelKey: "users" },
  { href: "/admin/businesses", icon: Briefcase, labelKey: "businesses" },
  { href: "/admin/verification", icon: ShieldCheck, labelKey: "verification" },
  { href: "/admin/reports", icon: Flag, labelKey: "reports" },
  { href: "/admin/audit", icon: ScrollText, labelKey: "auditLogs" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation("admin");

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <ShieldCheck className="size-5 text-primary" />
        <span className="font-semibold tracking-tight">{t("adminPanel")}</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_LINKS.map(({ href, icon: Icon, labelKey }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/dashboard"
          className="block rounded-md px-3 py-2 text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {t("exitToApp")}
        </Link>
      </div>
    </aside>
  );
}
