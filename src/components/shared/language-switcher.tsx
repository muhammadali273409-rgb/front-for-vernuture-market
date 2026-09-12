"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, persistLocale } from "@/i18n/client";
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from "@/i18n/settings";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { i18n, t } = useTranslation("common");
  const router = useRouter();
  const activeLocale = (i18n.language as Locale) in LOCALE_LABELS ? (i18n.language as Locale) : DEFAULT_LOCALE;

  function handleSelect(locale: Locale) {
    if (locale === activeLocale) return;
    persistLocale(locale);
    void i18n.changeLanguage(locale);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("selectLanguage")}
          className={cn("h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground", className)}
        >
          {compact ? <Globe className="size-3.5 opacity-70" /> : <span aria-hidden>{LOCALE_FLAGS[activeLocale]}</span>}
          {!compact && <span className="hidden sm:inline">{LOCALE_LABELS[activeLocale]}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => handleSelect(locale)}
            className={cn("justify-between", locale === activeLocale && "font-medium")}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden>{LOCALE_FLAGS[locale]}</span>
              {LOCALE_LABELS[locale]}
            </span>
            {locale === activeLocale && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
