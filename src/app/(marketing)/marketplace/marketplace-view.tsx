"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ListingCardSkeleton } from "@/components/marketplace/listing-card-skeleton";
import { ListingFilters } from "@/components/marketplace/listing-filters";
import { useCategories, useListings } from "@/hooks/use-listings";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMyBusinesses } from "@/hooks/use-businesses";
import { useUiStore } from "@/stores/ui-store";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import { isSellerRole } from "@/lib/auth/roles";
import { formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { categoryLabel, orderCategories } from "@/lib/marketplace/categories";
import {
  RANGE_FIELDS,
  clearFilters,
  countActiveFilters,
  hasAnyCriteria,
  parseFilters,
  rangeKeys,
  serializeFilters,
  toApiParams,
  updateFilters,
  type MarketplaceFilters,
} from "@/lib/marketplace/filters";

const SEARCH_DEBOUNCE_MS = 350;

const chipClass = (selected: boolean) =>
  cn(
    "shrink-0 rounded-md border px-3 py-1 text-xs font-medium transition-all",
    selected
      ? "border-primary bg-primary/10 font-semibold text-primary"
      : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground",
  );

export function MarketplaceView() {
  const { t, i18n } = useTranslation("marketplace");
  const locale = i18n.language as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.toString();
  const { marketplaceView, setMarketplaceView } = useUiStore();
  const { data: user } = useCurrentUser();
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  // The URL is the single source of truth for what's shown — shareable and
  // refresh-proof. Everything in it is validated before reaching the API.
  const filters = React.useMemo(() => parseFilters(new URLSearchParams(rawQuery)), [rawQuery]);

  const categoriesQuery = useCategories();
  const categories = React.useMemo(() => orderCategories(categoriesQuery.data ?? []), [categoriesQuery.data]);

  const apiParams = React.useMemo(() => toApiParams(filters), [filters]);
  const listingsQuery = useListings(apiParams);
  const listings = listingsQuery.data?.data ?? [];
  const pagination = listingsQuery.data?.pagination;

  const navigate = React.useCallback(
    (next: MarketplaceFilters, { replace = false } = {}) => {
      const qs = serializeFilters(next);
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [pathname, router],
  );

  const change = React.useCallback(
    (patch: Partial<MarketplaceFilters>) => navigate(updateFilters(filters, patch)),
    [filters, navigate],
  );

  // Normalise junk, legacy or out-of-range params in place (no history entry),
  // including old category-UUID links, which become readable slugs.
  React.useEffect(() => {
    let canonical = filters;
    const legacyCategory = filters.categoryId && categories.find((c) => c.id === filters.categoryId);
    if (legacyCategory) {
      canonical = { ...filters, category: legacyCategory.slug };
      delete canonical.categoryId;
    }
    if (serializeFilters(canonical) !== rawQuery) navigate(canonical, { replace: true });
  }, [filters, categories, rawQuery, navigate]);

  // Search input: local while typing, synced to the URL once typing settles.
  const [searchInput, setSearchInput] = React.useState(filters.q ?? "");
  const [syncedQ, setSyncedQ] = React.useState(filters.q ?? "");
  if ((filters.q ?? "") !== syncedQ) {
    setSyncedQ(filters.q ?? "");
    setSearchInput(filters.q ?? "");
  }
  React.useEffect(() => {
    const term = searchInput.trim();
    if (term === (filters.q ?? "")) return;
    const timer = setTimeout(
      () => navigate(updateFilters(filters, { q: term || undefined }), { replace: true }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, filters, navigate]);

  function resetAll() {
    setSearchInput("");
    navigate(clearFilters(filters));
  }

  const activeCount = countActiveFilters(filters);
  const anyCriteria = hasAnyCriteria(filters);
  const pageHref = (page: number) => {
    const qs = serializeFilters({ ...filters, page });
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const activeChips = buildActiveChips(filters, categories, t, locale);

  // A seller searching for their own project that isn't live yet gets told
  // why it isn't in the results, with a way to fix that.
  const isSeller = isSellerRole(user?.role);
  const { data: myBusinesses = [] } = useMyBusinesses({ enabled: isSeller && Boolean(filters.q) });
  const term = filters.q?.toLowerCase();
  const myUnpublished = term
    ? myBusinesses.filter((b) => b.status !== "PUBLISHED" && b.name.toLowerCase().includes(term))
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">{t("eyebrow")}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("pageTitle")}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{t("pageDescription")}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchBusinesses")}
              className="h-9 pl-8 text-xs"
              maxLength={100}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="hidden items-center rounded-lg border border-border/80 bg-muted/20 p-0.5 sm:flex">
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-8", marketplaceView === "grid" ? "bg-card text-primary shadow-xs" : "text-muted-foreground")}
              onClick={() => setMarketplaceView("grid")}
              aria-label={t("gridView")}
              aria-pressed={marketplaceView === "grid"}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-8", marketplaceView === "list" ? "bg-card text-primary shadow-xs" : "text-muted-foreground")}
              onClick={() => setMarketplaceView("list")}
              aria-label={t("listView")}
              aria-pressed={marketplaceView === "list"}
            >
              <List className="size-4" />
            </Button>
          </div>

          {/* Mobile filters */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold lg:hidden">
                <SlidersHorizontal className="size-3.5" />
                <span>{t("filters")}</span>
                {activeCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,100vw)] overflow-y-auto p-4">
              <SheetHeader className="border-b p-0 pb-3">
                <SheetTitle className="text-sm font-bold">{t("filtersSheetTitle")}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                <ListingFilters filters={filters} categories={categories} onChange={change} onReset={resetAll} />
                <Button className="w-full" onClick={() => setFiltersOpen(false)}>
                  {pagination ? t("showResults", { count: pagination.total }) : t("showResultsPending")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Category chips — real categories from the backend, scrollable on mobile */}
      <div className="-mx-4 mt-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          onClick={() => change({ category: undefined })}
          className={chipClass(!filters.category && !filters.categoryId)}
          aria-pressed={!filters.category && !filters.categoryId}
        >
          {t("allCategories")}
        </button>
        {categoriesQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7 w-24 shrink-0" />)
        ) : categoriesQuery.isError ? (
          <button
            type="button"
            onClick={() => categoriesQuery.refetch()}
            className="shrink-0 text-xs text-destructive underline-offset-2 hover:underline"
          >
            {t("categoriesLoadError")}
          </button>
        ) : (
          categories.map((category) => {
            const selected = filters.category === category.slug || filters.categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={selected}
                onClick={() => change({ category: selected ? undefined : category.slug })}
                className={chipClass(selected)}
              >
                {categoryLabel(t, category)}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <ListingFilters filters={filters} categories={categories} onChange={change} onReset={resetAll} />
        </aside>

        <div className="min-w-0">
          {/* Result count + active filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-foreground" aria-live="polite">
              {pagination ? t("resultsCount", { count: pagination.total }) : " "}
            </span>
            {listingsQuery.isFetching && !listingsQuery.isLoading && (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-label={t("updatingResults")} />
            )}
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => {
                  if (chip.key === "q") setSearchInput("");
                  change(chip.clear);
                }}
                className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] text-foreground hover:border-border"
                aria-label={t("removeFilter", { filter: chip.label })}
              >
                {chip.label}
                <X className="size-3 text-muted-foreground" />
              </button>
            ))}
            {anyCriteria && (
              <Button variant="link" size="sm" className="h-auto p-0 text-[11px]" onClick={resetAll}>
                {t("clearAllFilters")}
              </Button>
            )}
          </div>

          {myUnpublished.map((business) => (
            <div
              key={business.id}
              role="status"
              className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm"
            >
              <span>
                <span className="font-semibold">{business.name}</span> — {t("ownUnpublishedHint")}
              </span>
              <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                <Link
                  href={
                    business.missingForPublish?.length
                      ? `/dashboard/businesses/${business.id}?missing=${business.missingForPublish.join(",")}`
                      : `/dashboard/businesses/${business.id}`
                  }
                >
                  <Pencil className="size-3.5" />
                  {t("editAndPublish")}
                </Link>
              </Button>
            </div>
          ))}

          {listingsQuery.isError ? (
            <ErrorState title={t("unableToLoad")} error={listingsQuery.error} onRetry={() => listingsQuery.refetch()} />
          ) : listingsQuery.isLoading ? (
            <div className={cn("grid gap-5", marketplaceView === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            pagination && pagination.total > 0 ? (
              // e.g. a shared link to a page that no longer exists
              <EmptyState
                icon={Store}
                title={t("pageOutOfRange")}
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link href={pageHref(1)}>{t("backToFirstPage")}</Link>
                  </Button>
                }
              />
            ) : anyCriteria ? (
              <EmptyState
                icon={Store}
                title={t("noMatchTitle")}
                description={t("noMatchDescription")}
                action={
                  <Button variant="outline" size="sm" onClick={resetAll}>
                    {t("clearAllFilters")}
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Store}
                title={t("noListingsYetTitle")}
                description={t("noListingsYetDescription")}
                action={
                  isSellerRole(user?.role) ? (
                    <Button size="sm" asChild>
                      <Link href="/dashboard/businesses/new">
                        <Plus className="size-4" />
                        {t("listYourBusiness")}
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            )
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-5 transition-opacity",
                  marketplaceView === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
                  listingsQuery.isPlaceholderData && "opacity-60",
                )}
              >
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <MarketplacePagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  hrefFor={pageHref}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MarketplacePagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  const { t } = useTranslation("marketplace");
  const pages = visiblePages(page, totalPages);

  return (
    <nav aria-label={t("pagination")} className="mt-10 flex items-center justify-center gap-1">
      <PageButton href={page > 1 ? hrefFor(page - 1) : undefined} label={t("previousPage")}>
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">{t("previousPage")}</span>
      </PageButton>
      {pages.map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "outline" : "ghost"}
            size="icon"
            className="size-8 text-xs"
            asChild
          >
            <Link href={hrefFor(p)} scroll aria-current={p === page ? "page" : undefined}>
              {p}
            </Link>
          </Button>
        ),
      )}
      <PageButton href={page < totalPages ? hrefFor(page + 1) : undefined} label={t("nextPage")}>
        <span className="hidden sm:inline">{t("nextPage")}</span>
        <ChevronRight className="size-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
      <Link href={href} aria-label={label}>
        {children}
      </Link>
    </Button>
  );
}

/** 1 … 4 5 6 … 20 */
function visiblePages(page: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}

type Translate = ReturnType<typeof useTranslation>["t"];

function buildActiveChips(
  filters: MarketplaceFilters,
  categories: { id: string; name: string; slug: string }[],
  t: Translate,
  locale: Locale,
): { key: string; label: string; clear: Partial<MarketplaceFilters> }[] {
  const chips: { key: string; label: string; clear: Partial<MarketplaceFilters> }[] = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”`, clear: { q: undefined } });

  const category = categories.find((c) => c.slug === filters.category || c.id === filters.categoryId);
  if (filters.category || filters.categoryId) {
    chips.push({
      key: "category",
      label: category ? categoryLabel(t, category) : (filters.category ?? t("category")),
      clear: { category: undefined },
    });
  }
  if (filters.businessModel) {
    chips.push({ key: "model", label: filters.businessModel, clear: { businessModel: undefined } });
  }

  const money = (value: number) => formatMoney(value, "USD", locale);
  const rangeLabels = { price: t("price"), revenue: t("monthlyRevenue"), profit: t("monthlyProfit") };
  for (const field of RANGE_FIELDS) {
    const [minKey, maxKey] = rangeKeys(field);
    const min = filters[minKey];
    const max = filters[maxKey];
    if (min === undefined && max === undefined) continue;
    const range =
      min !== undefined && max !== undefined
        ? `${money(min)}–${money(max)}`
        : min !== undefined
          ? `≥ ${money(min)}`
          : `≤ ${money(max!)}`;
    chips.push({ key: field, label: `${rangeLabels[field]}: ${range}`, clear: { [minKey]: undefined, [maxKey]: undefined } });
  }
  if (filters.verified) chips.push({ key: "verified", label: t("verifiedOnly"), clear: { verified: undefined } });
  return chips;
}
