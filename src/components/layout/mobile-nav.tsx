"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { useUiStore } from "@/stores/ui-store";
import { dashboardNavFor } from "@/config/nav";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/types/domain";

export function MobileNav({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const { t } = useTranslation("navigation");

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("openMenu")}>
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b">
          <SheetTitle asChild>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 overflow-y-auto p-3">
          {dashboardNavFor(user.role).map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  active ? "bg-accent text-accent-foreground" : "text-foreground/80 hover:bg-accent/60",
                )}
              >
                <Icon className="size-4" />
                {t(item.titleKey)}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
