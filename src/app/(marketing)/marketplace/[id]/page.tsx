import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WatchlistButton } from "@/components/business/watchlist-button";
import { MakeOfferDialog } from "@/components/business/make-offer-dialog";
import { ContactSellerButton } from "@/components/business/contact-seller-button";
import { FinancialCharts } from "@/components/business/financial-charts";
import { AIAnalysisCard } from "@/components/business/ai-analysis-card";
import { TrustVerificationCenter } from "@/components/business/trust-verification-center";
import { listingsApi } from "@/lib/api/listings";
import { publicApiFetch } from "@/lib/api/public";
import { formatCompactMoney, formatDate } from "@/lib/utils/format";
import { getMetricValue, verificationScore } from "@/lib/utils/metrics";
import { ApiError } from "@/lib/api/error";
import { getT, getServerLocale } from "@/i18n/server";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { ListingDetail } from "@/types/domain";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getListing(idOrSlug: string): Promise<ListingDetail> {
  try {
    return await listingsApi.getOne(idOrSlug, publicApiFetch as unknown as ApiFetcher);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  const t = await getT("marketplace");
  return {
    title: t("metaTitleTemplate", { name: listing.name }),
    description: listing.headline ?? listing.description?.slice(0, 160) ?? undefined,
  };
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListing(id);

  const t = await getT("marketplace");
  const locale = await getServerLocale();

  const mrr = getMetricValue(listing.metrics, "MRR");
  const arr = getMetricValue(listing.metrics, "ARR");
  const growth = getMetricValue(listing.metrics, "GROWTH");
  const netMargin = mrr && getMetricValue(listing.metrics, "PROFIT")
    ? Math.round((getMetricValue(listing.metrics, "PROFIT")! / mrr) * 100)
    : null;
  const trustScore = verificationScore(listing.verifications);
  const multiple = listing.askingPrice && arr ? (listing.askingPrice / arr).toFixed(1) : null;

  const customersCount = getMetricValue(listing.metrics, "CUSTOMERS");
  const churnRate = getMetricValue(listing.metrics, "CHURN");
  const trafficMonthly = getMetricValue(listing.metrics, "TRAFFIC");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Breadcrumb & Asset Tag */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link href="/marketplace" className="hover:text-foreground">
            {t("marketplace")}
          </Link>
          <span>/</span>
          <span>{listing.category ?? t("global")}</span>
          <span>/</span>
          <span className="font-semibold text-foreground">{listing.name}</span>
        </div>

        {trustScore !== null && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3.5" />
              {t("auditedTrustRating", { score: trustScore })}
            </span>
          </div>
        )}
      </div>

      {/* Hero Header Section */}
      <div className="flex flex-col gap-6 rounded-xl border border-border/80 bg-card p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {listing.category && (
              <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
                {listing.category}
              </Badge>
            )}
            <span className="rounded-sm border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-mono uppercase text-muted-foreground">
              {listing.country ?? t("global")}
            </span>
            {listing.foundedAt && (
              <span className="text-xs text-muted-foreground">
                {t("foundedOn", { date: formatDate(listing.foundedAt, locale) })}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {listing.name}
          </h1>

          {listing.headline && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{listing.headline}</p>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{t("verifiedMrr")}</span>
              <p className="font-mono text-sm font-bold text-foreground">
                {formatCompactMoney(mrr, listing.currency, locale)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{t("runRateArr")}</span>
              <p className="font-mono text-sm font-bold text-foreground">
                {formatCompactMoney(arr, listing.currency, locale)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{t("annualGrowth")}</span>
              <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {growth !== null ? t("annualGrowthYoy", { growth }) : t("notDisclosed")}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{t("netMargin")}</span>
              <p className="font-mono text-sm font-bold text-foreground">
                {netMargin !== null ? `${netMargin}%` : t("notDisclosed")}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & Acquisition Action Box */}
        <div className="flex flex-col items-start gap-4 rounded-xl border border-border/80 bg-muted/20 p-5 lg:min-w-[280px] lg:items-end">
          <div className="lg:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("business:askingPrice")}
            </span>
            <div className="flex items-baseline gap-2 lg:justify-end">
              <span className="font-mono text-3xl font-extrabold text-foreground">
                {formatCompactMoney(listing.askingPrice, listing.currency, locale)}
              </span>
            </div>
            {multiple && (
              <span className="font-mono text-xs text-muted-foreground">
                {t("multipleReconciled", { multiple })}
              </span>
            )}
          </div>

          <div className="flex w-full flex-col gap-2">
            <MakeOfferDialog businessId={listing.id} currency={listing.currency} />
            <div className="flex gap-2">
              <ContactSellerButton businessId={listing.id} ownerId={listing.ownerId} />
              <WatchlistButton businessId={listing.id} />
            </div>
            <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <Link href="/dashboard/deals">
                <Lock className="size-3 text-primary" />
                <span>{t("enterDealRoomNda")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs (Progressive Disclosure) */}
      <div className="mt-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex sm:grid-cols-6">
            <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
            <TabsTrigger value="financials">{t("tabs.financials")}</TabsTrigger>
            <TabsTrigger value="ai-audit">{t("tabs.aiValuation")}</TabsTrigger>
            <TabsTrigger value="trust">{t("tabs.sixLayerTrust")}</TabsTrigger>
            <TabsTrigger value="traffic">{t("tabs.customers")}</TabsTrigger>
            <TabsTrigger value="data-room">{t("tabs.dataRoom")}</TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-6">
                <Card className="border border-border/80 bg-card">
                  <CardHeader className="border-b border-border/60 pb-3">
                    <CardTitle className="text-base font-semibold">{t("executiveSummaryTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5 text-sm leading-relaxed text-muted-foreground">
                    {listing.description && (
                      <p className="whitespace-pre-line text-foreground">{listing.description}</p>
                    )}

                    {listing.businessModel && (
                      <div className="space-y-2 border-t border-border/60 pt-4">
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                          {t("businessModelTitle")}
                        </h4>
                        <p className="text-xs">{listing.businessModel}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Asset Meta */}
              <div className="space-y-4">
                <Card className="border border-border/80 bg-card p-5 space-y-4 text-xs">
                  <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    {t("assetSpecsTitle")}
                  </h3>

                  <div className="space-y-3 divide-y divide-border/60">
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">{t("countryEntityLabel")}</span>
                      <span className="font-medium text-foreground">
                        {listing.country ? t("jurisdictionValue", { country: listing.country }) : t("notDisclosed")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">{t("foundedDateLabel")}</span>
                      <span className="font-medium text-foreground">
                        {listing.foundedAt ? formatDate(listing.foundedAt, locale) : t("notDisclosed")}
                      </span>
                    </div>
                    {customersCount !== null && (
                      <div className="flex justify-between pt-2">
                        <span className="text-muted-foreground">{t("activeCustomersLabel")}</span>
                        <span className="font-mono font-medium text-foreground">
                          {t("b2bAccounts", { count: customersCount })}
                        </span>
                      </div>
                    )}
                    {listing.website && (
                      <div className="flex justify-between pt-2">
                        <span className="text-muted-foreground">{t("publicWebsiteLabel")}</span>
                        <a
                          href={listing.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline truncate max-w-[140px]"
                        >
                          {listing.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: FINANCIALS */}
          <TabsContent value="financials" className="space-y-6">
            <FinancialCharts metrics={listing.metrics ?? []} currency={listing.currency} />
          </TabsContent>

          {/* TAB 3: AI VALUATION */}
          <TabsContent value="ai-audit" className="space-y-6">
            <AIAnalysisCard businessId={listing.id} currency={listing.currency} />
          </TabsContent>

          {/* TAB 4: 6-LAYER TRUST */}
          <TabsContent value="trust" className="space-y-6">
            <TrustVerificationCenter verifications={listing.verifications} />
          </TabsContent>

          {/* TAB 5: CUSTOMERS & TRAFFIC */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="border border-border/80 bg-card p-5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("monthlyActiveUsers")}</span>
                <p className="font-mono text-2xl font-extrabold text-foreground mt-1">
                  {trafficMonthly !== null ? trafficMonthly.toLocaleString() : t("notDisclosed")}
                </p>
              </Card>

              <Card className="border border-border/80 bg-card p-5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("monthlyChurnRate")}</span>
                <p className="font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {churnRate !== null ? `${churnRate}%` : t("notDisclosed")}
                </p>
              </Card>

              <Card className="border border-border/80 bg-card p-5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("activeCustomers")}</span>
                <p className="font-mono text-2xl font-extrabold text-foreground mt-1">
                  {customersCount !== null ? customersCount.toLocaleString() : t("notDisclosed")}
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 6: DATA ROOM */}
          <TabsContent value="data-room" className="space-y-6">
            <Card className="border border-border/80 bg-card p-6">
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="size-6" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-lg font-bold text-foreground">{t("dataRoomTitle")}</h3>
                  <p className="text-xs text-muted-foreground">{t("dataRoomDescription")}</p>
                </div>
                <Button asChild size="lg" className="font-semibold text-xs h-10 px-6">
                  <Link href="/dashboard/deals">
                    <span>{t("executeNdaOpenRoom")}</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
