"use client";

/* eslint-disable @next/next/no-img-element -- images are short-lived signed URLs from the private bucket */

import Link from "next/link";
import { Scale, Heart, Briefcase, UserRound, ShieldCheck, CalendarDays } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactMoney, formatDate } from "@/lib/utils/format";
import { categoryLabel } from "@/lib/marketplace/categories";
import { useUiStore } from "@/stores/ui-store";
import { useToggleWatchlist, useWatchlist } from "@/hooks/use-watchlist";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import type { ListingSummary } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: ListingSummary;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { t, i18n } = useTranslation("marketplace");
  const locale = i18n.language as Locale;
  const { comparisonList, addToComparison, removeFromComparison } = useUiStore();
  const { data: watchlist = [] } = useWatchlist();
  const toggleWatchlist = useToggleWatchlist();

  const isCompared = comparisonList.some((item) => item.id === listing.id);
  const isWatching = watchlist.some((w) => w.businessId === listing.id);

  const location = [listing.city, listing.country].filter(Boolean).join(", ");
  const sellerName = listing.seller?.company || listing.seller?.name;
  const summary = listing.headline || listing.excerpt;
  const category =
    listing.category &&
    (listing.categorySlug
      ? categoryLabel(t, { name: listing.category, slug: listing.categorySlug })
      : listing.category);

  function handleCompareClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(listing.id);
    } else {
      addToComparison(listing);
    }
  }

  function handleWatchlistClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist.mutate({ businessId: listing.id, watching: isWatching });
  }

  return (
    <div className="group relative flex h-full flex-col">
      <Link href={`/marketplace/${listing.slug}`} className="flex h-full flex-col">
        <Card
          className={cn(
            "flex h-full flex-col gap-0 overflow-hidden border border-border/80 bg-card pt-0 transition-all duration-200 hover:border-primary/40 hover:shadow-sm",
            isCompared && "ring-1.5 ring-primary/60",
          )}
        >
          {/* Cover: first gallery image, else a branded gradient with the logo */}
          <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-muted">
            {listing.coverUrl ? (
              <img
                src={listing.coverUrl}
                alt=""
                loading="lazy"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Briefcase className="size-8 text-primary/40" />
              </div>
            )}
            {listing.logoUrl && (
              <div className="absolute bottom-2 left-3 size-11 overflow-hidden rounded-lg border-2 border-card bg-card shadow-sm">
                <img src={listing.logoUrl} alt="" loading="lazy" className="size-full object-cover" />
              </div>
            )}
            {listing.verified && (
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-emerald-500/30 bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 backdrop-blur dark:text-emerald-400">
                <ShieldCheck className="size-3" />
                {t("verifiedBusiness")}
              </span>
            )}
          </div>

          <CardContent className="flex flex-1 flex-col p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              {category && (
                <Badge variant="secondary" className="px-2 py-0.5 text-[11px] font-medium tracking-tight">
                  {category}
                </Badge>
              )}
              {listing.businessModel && (
                <span className="rounded-sm border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {listing.businessModel}
                </span>
              )}
              {location && (
                <span className="rounded-sm border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                  {location}
                </span>
              )}
            </div>

            <div className="mt-3.5 space-y-1">
              <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                {listing.name}
              </h3>
              {summary && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{summary}</p>}
              {sellerName && (
                <p className="flex items-center gap-1 pt-0.5 text-[11px] text-muted-foreground">
                  <UserRound className="size-3" />
                  <span className="line-clamp-1">
                    {t("business:project.publishedBy")} <span className="font-medium text-foreground">{sellerName}</span>
                  </span>
                </p>
              )}
            </div>

            {/* Monthly figures exactly as disclosed — revenue and profit are never interchanged */}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <MonthlyFigure
                label={t("monthlyRevenue")}
                value={listing.monthlyRevenue ?? null}
                verified={listing.monthlyRevenueVerified ?? false}
                currency={listing.currency}
                locale={locale}
              />
              <MonthlyFigure
                label={t("monthlyProfit")}
                value={listing.monthlyProfit ?? null}
                verified={listing.monthlyProfitVerified ?? false}
                currency={listing.currency}
                locale={locale}
              />
            </div>

            <div className="mt-auto flex items-end justify-between gap-2 border-t border-border/40 pt-3">
              <div>
                <span className="text-[10px] font-medium uppercase text-muted-foreground">{t("business:askingPrice")}</span>
                <p className="font-mono text-lg font-bold text-foreground">
                  {listing.askingPrice !== null
                    ? formatCompactMoney(listing.askingPrice, listing.currency, locale)
                    : t("notDisclosed")}
                </p>
              </div>
              {listing.publishedAt && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarDays className="size-3" />
                  {t("listedOn", { date: formatDate(listing.publishedAt, locale) })}
                </span>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end border-t border-border/60 bg-muted/10 px-5 py-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Button
                variant={isCompared ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 gap-1 px-2 text-[11px] font-medium",
                  isCompared && "bg-primary/10 text-primary hover:bg-primary/20",
                )}
                onClick={handleCompareClick}
                title={t("compareTitle")}
              >
                <Scale className="size-3" />
                <span className="hidden sm:inline">{isCompared ? t("compared") : t("compare")}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("size-7", isWatching && "text-rose-500 hover:text-rose-600")}
                onClick={handleWatchlistClick}
                title={isWatching ? t("savedInWatchlist") : t("saveToWatchlist")}
                aria-label={isWatching ? t("savedInWatchlist") : t("saveToWatchlist")}
              >
                <Heart className={cn("size-3.5", isWatching && "fill-current")} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}

function MonthlyFigure({
  label,
  value,
  verified,
  currency,
  locale,
}: {
  label: string;
  value: number | null;
  verified: boolean;
  currency: string;
  locale: Locale;
}) {
  const { t } = useTranslation("marketplace");
  return (
    <div className="min-w-0">
      <span className="block truncate text-[10px] font-medium uppercase text-muted-foreground">{label}</span>
      {value === null ? (
        <p className="font-mono text-xs font-semibold text-muted-foreground">{t("notDisclosed")}</p>
      ) : (
        <>
          <p className="font-mono text-xs font-semibold text-foreground">{formatCompactMoney(value, currency, locale)}</p>
          <span
            className={cn(
              "text-[10px]",
              verified ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-muted-foreground",
            )}
          >
            {verified ? t("figureVerified") : t("figureSellerReported")}
          </span>
        </>
      )}
    </div>
  );
}
