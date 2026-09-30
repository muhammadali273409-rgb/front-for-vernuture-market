import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/marketplace/listing-card";
import { RoleChoiceSection } from "@/components/onboarding/role-choice-section";
import { listingsApi } from "@/lib/api/listings";
import { publicApiFetch } from "@/lib/api/public";
import { formatCompactMoney } from "@/lib/utils/format";
import { getMetricValue } from "@/lib/utils/metrics";
import { getT, getServerLocale } from "@/i18n/server";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Metadata } from "next";

// Home uses an absolute title (no "· VentureMarket" suffix), so it composes
// its own Metadata directly rather than through lib/seo's pageMetadata helper.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("common");
  const title = t("meta.title");
  const description = t("meta.description");
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function HomePage() {
  const t = await getT("home");
  const locale = await getServerLocale();
  const { data: featuredListings } = await listingsApi.search(
    { limit: 6, sortBy: "createdAt", sortDir: "desc" },
    publicApiFetch as unknown as ApiFetcher,
  );
  const spotlight = featuredListings[0];
  const spotlightMrr = spotlight ? getMetricValue(spotlight.metrics, "MRR") : null;
  const checklistItems = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-background via-muted/20 to-background pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>{t("hero.badge")}</span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {t("hero.titlePart1")} <span className="text-primary">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">{t("hero.description")}</p>
          </div>

          {/* Onboarding decision: Buyer or Seller (signed-in users go straight to their workspace) */}
          <RoleChoiceSection />

          {/* Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="ghost" className="h-11 px-4 text-sm font-medium text-muted-foreground">
              <Link href="/marketplace">
                {t("hero.ctaExplore")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-11 px-4 text-sm font-medium text-muted-foreground">
              <Link href="/marketplace/compare">
                <Scale className="size-4 mr-1.5" />
                {t("hero.ctaCompare")}
              </Link>
            </Button>
          </div>

          {/* Live Product Showcase UI — reflects a real published listing, if one exists */}
          {spotlight && (
            <div className="relative mt-8 w-full max-w-5xl overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-2xl sm:p-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    VM
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{spotlight.name}</span>
                      {spotlight.category && (
                        <Badge variant="outline" className="border-border/60 bg-muted/40 text-[10px] font-semibold text-muted-foreground">
                          {spotlight.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{spotlight.headline}</p>
                  </div>
                </div>

                <div className="hidden text-right sm:block">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">{t("hero.showcase.askingPriceLabel")}</span>
                  <p className="font-mono text-xl font-bold text-foreground">
                    {formatCompactMoney(spotlight.askingPrice, spotlight.currency, locale)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-left">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">{t("hero.showcase.verifiedMrrLabel")}</span>
                  <p className="font-mono text-base font-bold text-foreground">
                    {formatCompactMoney(spotlightMrr, spotlight.currency, locale)}
                  </p>
                </div>
                <Button asChild size="sm" className="font-semibold">
                  <Link href={`/marketplace/${spotlight.slug}`}>
                    {t("featured.viewAll")}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. 4-STAGE ACQUISITION LIFECYCLE */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-semibold">
            {t("lifecycle.eyebrow")}
          </Badge>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("lifecycle.title")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("lifecycle.description")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">1</div>
            <h3 className="font-bold text-foreground">{t("lifecycle.step1Title")}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("lifecycle.step1Description")}</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">2</div>
            <h3 className="font-bold text-foreground">{t("lifecycle.step2Title")}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("lifecycle.step2Description")}</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-bold">3</div>
            <h3 className="font-bold text-foreground">{t("lifecycle.step3Title")}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("lifecycle.step3Description")}</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 font-bold">4</div>
            <h3 className="font-bold text-foreground">{t("lifecycle.step4Title")}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("lifecycle.step4Description")}</p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BUSINESSES SECTION */}
      {featuredListings.length > 0 && (
        <section className="border-t border-border/80 bg-muted/10 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">{t("featured.liveListings")}</span>
                </div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("featured.title")}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t("featured.description")}</p>
              </div>

              <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
                <Link href="/marketplace">
                  <span>{t("featured.viewAll")}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. 6-LAYER TRUST & VERIFICATION ARCHITECTURE */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="size-3.5 mr-1" />
              {t("trust.badge")}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("trust.title")}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("trust.description")}</p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t("trust.feature1Title")}</h4>
                  <p className="text-xs text-muted-foreground">{t("trust.feature1Description")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t("trust.feature2Title")}</h4>
                  <p className="text-xs text-muted-foreground">{t("trust.feature2Description")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t("trust.feature3Title")}</h4>
                  <p className="text-xs text-muted-foreground">{t("trust.feature3Description")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-bold uppercase text-foreground">{t("trust.checklistTitle")}</span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{t("trust.checklistPassed")}</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {checklistItems.map((n) => (
                <div key={n} className="flex items-center justify-between rounded-md bg-muted/30 p-2.5">
                  <span>{t(`trust.checklistItem${n}`)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t("trust.verified")} ✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="border-t border-border/80 bg-gradient-to-b from-card to-background py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("cta.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">{t("cta.description")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-11 px-6 font-semibold">
              <Link href="/marketplace">{t("cta.browseMarketplace")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6 font-semibold">
              <Link href="/register?role=SELLER">{t("cta.listAsSeller")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
