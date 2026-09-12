"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/ui-store";
import { dashboardNav } from "@/config/nav";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/types/domain";

function NavLink({
  href,
  title,
  icon: Icon,
  collapsed,
  active,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean;
  active: boolean;
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{title}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );
}

export function DashboardSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { t } = useTranslation("navigation");

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", sidebarCollapsed && "justify-center px-2")}>
        {sidebarCollapsed ? (
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            VM
          </span>
        ) : (
          <Logo />
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {dashboardNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={t(item.titleKey)}
            collapsed={sidebarCollapsed}
            active={item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)}
          />
        ))}
        {/* The Admin Panel is a deliberately separate experience (own layout,
            sidebar, and route protection — see app/admin/**) rather than a
            section grafted onto this Seller/Buyer sidebar. Admins reach it
            via the "Admin Panel" link in the account menu (see UserMenu). */}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={toggleSidebar}>
          {sidebarCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  );
}
