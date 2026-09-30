"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Briefcase, HandCoins, Handshake, MessageSquare, LayoutDashboard } from "lucide-react";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { isSellerRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types/domain";

const marketItem = { href: "/marketplace", labelKey: "marketShort", icon: Store };
const businessesItem = { href: "/dashboard/businesses", labelKey: "myBusinesses", icon: Briefcase };

const sharedItems = [
  { href: "/dashboard/offers", labelKey: "offers", icon: HandCoins },
  { href: "/dashboard/deals", labelKey: "deals", icon: Handshake },
  { href: "/dashboard/messages", labelKey: "messages", icon: MessageSquare },
  { href: "/dashboard", labelKey: "overview", icon: LayoutDashboard },
];

/** `role` is passed inside the dashboard; the public site (no role) shows the marketplace. */
export function MobileBottomNav({ role }: { role?: UserRole } = {}) {
  const pathname = usePathname();
  const { t } = useTranslation("navigation");
  // Sellers who aren't also buyers get their businesses instead of the marketplace.
  const firstItem = role && isSellerRole(role) && role !== "BUYER_SELLER" ? businessesItem : marketItem;
  const mobileItems = [firstItem, ...sharedItems];

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
