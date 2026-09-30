import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/domain";
import { isBuyerRole, isSellerRole } from "@/lib/auth/roles";
import {
  LayoutDashboard,
  Store,
  Briefcase,
  HandCoins,
  MessageSquare,
  Handshake,
  FileText,
  Heart,
  Bell,
  Settings,
  ShieldCheck,
  Search,
  Sparkles,
  BarChart3,
  Scale,
  HelpCircle,
  FolderLock,
  Bookmark,
} from "lucide-react";

export interface NavItem {
  /** Translation key resolved from the `navigation` namespace. */
  titleKey: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  /** Limit the item to the sell or buy side. Omitted = shown to everyone. */
  audience?: "seller" | "buyer";
}

export const dashboardNav: NavItem[] = [
  { titleKey: "overview", href: "/dashboard", icon: LayoutDashboard },
  { titleKey: "marketplace", href: "/marketplace", icon: Store, audience: "buyer" },
  { titleKey: "compare", href: "/marketplace/compare", icon: Scale, audience: "buyer" },
  { titleKey: "myBusinesses", href: "/dashboard/businesses", icon: Briefcase, audience: "seller" },
  { titleKey: "offers", href: "/dashboard/offers", icon: HandCoins },
  { titleKey: "dealsRoom", href: "/dashboard/deals", icon: Handshake },
  { titleKey: "dueDiligence", href: "/dashboard/due-diligence", icon: ShieldCheck },
  { titleKey: "messages", href: "/dashboard/messages", icon: MessageSquare },
  { titleKey: "documents", href: "/dashboard/documents", icon: FolderLock, audience: "seller" },
  { titleKey: "verification", href: "/dashboard/verification", icon: ShieldCheck, audience: "seller" },
  { titleKey: "watchlist", href: "/dashboard/watchlist", icon: Heart, audience: "buyer" },
  { titleKey: "savedSearches", href: "/dashboard/saved-searches", icon: Bookmark, audience: "buyer" },
  { titleKey: "analytics", href: "/dashboard/analytics", icon: BarChart3, audience: "seller" },
  { titleKey: "notifications", href: "/dashboard/notifications", icon: Bell },
  { titleKey: "settings", href: "/dashboard/settings", icon: Settings },
];

/**
 * Dashboard nav for a role. Admins see everything (they moderate both
 * sides); BUYER_SELLER accounts see both sides' items.
 */
export function dashboardNavFor(role: UserRole): NavItem[] {
  if (role === "ADMIN") return dashboardNav;
  return dashboardNav.filter(
    (item) =>
      !item.audience ||
      (item.audience === "seller" && isSellerRole(role)) ||
      (item.audience === "buyer" && isBuyerRole(role)),
  );
}

export const marketingNav: NavItem[] = [
  { titleKey: "marketplace", href: "/marketplace", icon: Store },
  { titleKey: "compare", href: "/marketplace/compare", icon: Scale },
  { titleKey: "whyVentureMarket", href: "/about", icon: Sparkles },
  { titleKey: "pricing", href: "/pricing", icon: HandCoins },
  { titleKey: "faq", href: "/faq", icon: HelpCircle },
];

