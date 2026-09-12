"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { UserMenu } from "@/components/layout/user-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentUser } from "@/hooks/use-current-user";
import { marketingNav } from "@/config/nav";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const { t } = useTranslation(["navigation", "common"] as const);

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-xs font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(item.href) && "text-foreground bg-accent/60",
              )}
            >
              {t(`navigation:${item.titleKey}`)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {!isLoading && user ? (
            <>
              <NotificationsDropdown />
              <Button asChild variant="outline" size="sm" className="hidden text-xs font-semibold sm:inline-flex">
                <Link href="/dashboard">{t("navigation:dashboard")}</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden text-xs font-medium sm:inline-flex">
                <Link href="/login">{t("navigation:login")}</Link>
              </Button>
              <Button asChild size="sm" className="text-xs font-semibold">
                <Link href="/register">{t("navigation:getStarted")}</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("navigation:openMenu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle asChild>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="p-3">
                <nav className="flex flex-col gap-1">
                  {marketingNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                      {t(`navigation:${item.titleKey}`)}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                    {t("navigation:dashboard")}
                  </Link>
                  <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                    {t("navigation:login")}
                  </Link>
                  <Link href="/register" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                    {t("navigation:getStarted")}
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

