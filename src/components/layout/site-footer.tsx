"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { useTranslation } from "@/i18n/client";
import { marketingNav } from "@/config/nav";

export function SiteFooter() {
  const { t } = useTranslation(["common", "navigation"] as const);

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">{t("common:footerTagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {marketingNav
            .filter((item) => item.href === "/marketplace" || item.href === "/about" || item.href === "/pricing")
            .map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {t(`navigation:${item.titleKey}`)}
              </Link>
            ))}
          <Link href="/login" className="hover:text-foreground">
            {t("navigation:login")}
          </Link>
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        {t("common:copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
