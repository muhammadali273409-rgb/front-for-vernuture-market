"use client";

import Link from "next/link";
import { TrendingUp, Scale, Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactMoney } from "@/lib/utils/format";
import { getMetricValue } from "@/lib/utils/metrics";
import { useUiStore } from "@/stores/ui-store";
import { useToggleWatchlist, useWatchlist } from "@/hooks/use-watchlist";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import type { ListingSummary } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: ListingSummary;
  compact?: boolean;
}

export function ListingCard({ listing, compact = false }: ListingCardProps) {
  const { t, i18n } = useTranslation("marketplace");
  const locale = i18n.language as Locale;
  const { comparisonList, addToComparison, removeFromComparison } = useUiStore();
  const { data: watchlist = [] } = useWatchlist();
  const toggleWatchlist = useToggleWatchlist();

  const isCompared = comparisonList.some((item) => item.id === listing.id);
  const isWatching = watchlist.some((w) => w.businessId === listing.id);

  const mrr = getMetricValue(listing.metrics, "MRR");
  const arr = getMetricValue(listing.metrics, "ARR");
  const growth = getMetricValue(listing.metrics, "GROWTH");
  const profit = getMetricValue(listing.metrics, "PROFIT");
  const multiple = listing.askingPrice && arr ? (listing.askingPrice / arr).toFixed(1) : null;

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
            "flex h-full flex-col overflow-hidden border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-sm",
            isCompared && "ring-1.5 ring-primary/60",
          )}
        >
          <CardContent className="flex flex-1 flex-col p-5">
            {/* Top metadata row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {listing.category && (
                  <Badge variant="secondary" className="px-2 py-0.5 text-[11px] font-medium tracking-tight">
                    {listing.category}
                  </Badge>
                )}
                <span className="rounded-sm border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground uppercase">
                  {listing.country ?? t("global")}
                </span>
              </div>

            </div>

            {/* Title & Headline */}
            <div className="mt-3.5 space-y-1">
              <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary transition-colors">
                {listing.name}
              </h3>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {listing.headline || t("defaultHeadline")}
              </p>
            </div>

            {/* Financial Metrics Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t("mrr")}</span>
                <p className="font-mono text-xs font-semibold text-foreground">
                  {formatCompactMoney(mrr, listing.currency, locale)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t("arr")}</span>
                <p className="font-mono text-xs font-semibold text-foreground">
                  {formatCompactMoney(arr, listing.currency, locale)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t("growth")}</span>
                {growth !== null ? (
                  <p className="flex items-center gap-0.5 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-3" />
                    +{growth}%
                  </p>
                ) : (
                  <p className="font-mono text-xs font-semibold text-muted-foreground">{t("notDisclosed")}</p>
                )}
              </div>
            </div>

            {/* Asking Price & Multiples footer */}
            <div className="mt-4 flex items-baseline justify-between border-t border-border/40 pt-3">
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t("business:askingPrice")}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-lg font-bold text-foreground">
                    {formatCompactMoney(listing.askingPrice, listing.currency, locale)}
                  </span>
                  {multiple && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {multiple}{t("xArrSuffix")}
                    </span>
                  )}
                </div>
              </div>

              {profit !== null && mrr && (
                <div className="text-right">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">{t("netMargin")}</span>
                  <p className="font-mono text-xs font-semibold text-foreground">
                    {Math.round((profit / mrr) * 100)}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          {/* Card Action Strip */}
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
