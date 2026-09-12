import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ComparisonDrawer } from "@/components/marketplace/comparison-drawer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col pb-14 md:pb-0">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <ComparisonDrawer />
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}

