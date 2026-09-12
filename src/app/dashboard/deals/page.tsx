"use client";

import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals } from "@/hooks/use-deals";
import { dealStatusKey } from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";

export default function DealsPage() {
  const { t } = useTranslation("deals");
  const { data: deals = [], isLoading, isError, refetch } = useDeals();

  return (
    <div className="space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : deals.length === 0 ? (
        <EmptyState icon={Handshake} title={t("noDealsYet")} description={t("noDealsYetDescription")} />
      ) : (
        <div className="grid gap-4">
          {deals.map((deal) => (
            <Card key={deal.id} className="border border-border/80 bg-card transition-all hover:border-primary/40 hover:shadow-xs">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base font-bold text-foreground">
                      {deal.business?.name ?? t("acquisitionTarget")}
                    </h3>
                    <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[11px] font-semibold">
                      {t(`roomStatus.${dealStatusKey[deal.status] ?? deal.status}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("dealWorkspace")} <span className="font-mono">{deal.id}</span> ·{" "}
                    {t("participantsDemo", { count: deal.participants?.length ?? 0 })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild className="h-9 gap-1.5 font-semibold text-xs">
                    <Link href={`/dashboard/deals/${deal.id}`}>
                      <span>{t("enterDealRoom")}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
