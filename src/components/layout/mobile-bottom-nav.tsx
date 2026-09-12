"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, HandCoins, Handshake, MessageSquare, LayoutDashboard } from "lucide-react";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";

const mobileItems = [
  { href: "/marketplace", labelKey: "marketShort", icon: Store },
  { href: "/dashboard/offers", labelKey: "offers", icon: HandCoins },
  { href: "/dashboard/deals", labelKey: "deals", icon: Handshake },
  { href: "/dashboard/messages", labelKey: "messages", icon: MessageSquare },
  { href: "/dashboard", labelKey: "overview", icon: LayoutDashboard },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation("navigation");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/marketplace"
          ? pathname.startsWith("/marketplace")
          : item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors",
              isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4.5" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
