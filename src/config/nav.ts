import type { LucideIcon } from "lucide-react";
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
}

export const dashboardNav: NavItem[] = [
  { titleKey: "overview", href: "/dashboard", icon: LayoutDashboard },
  { titleKey: "marketplace", href: "/marketplace", icon: Store },
  { titleKey: "myBusinesses", href: "/dashboard/businesses", icon: Briefcase },
  { titleKey: "offers", href: "/dashboard/offers", icon: HandCoins },
  { titleKey: "dealsRoom", href: "/dashboard/deals", icon: Handshake },
  { titleKey: "dueDiligence", href: "/dashboard/due-diligence", icon: ShieldCheck },
  { titleKey: "messages", href: "/dashboard/messages", icon: MessageSquare },
  { titleKey: "documents", href: "/dashboard/documents", icon: FolderLock },
  { titleKey: "verification", href: "/dashboard/verification", icon: ShieldCheck },
  { titleKey: "watchlist", href: "/dashboard/watchlist", icon: Heart },
  { titleKey: "savedSearches", href: "/dashboard/saved-searches", icon: Bookmark },
  { titleKey: "analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { titleKey: "notifications", href: "/dashboard/notifications", icon: Bell },
  { titleKey: "settings", href: "/dashboard/settings", icon: Settings },
];

export const marketingNav: NavItem[] = [
  { titleKey: "marketplace", href: "/marketplace", icon: Store },
  { titleKey: "compare", href: "/marketplace/compare", icon: Scale },
  { titleKey: "whyVentureMarket", href: "/about", icon: Sparkles },
  { titleKey: "pricing", href: "/pricing", icon: HandCoins },
  { titleKey: "faq", href: "/faq", icon: HelpCircle },
];

