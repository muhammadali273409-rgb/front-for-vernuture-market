"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Store,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ListingCardSkeleton } from "@/components/marketplace/listing-card-skeleton";
import { ListingFilters } from "@/components/marketplace/listing-filters";
import { useInfiniteListings, useCategories } from "@/hooks/use-listings";
import { useUiStore } from "@/stores/ui-store";
import { useTranslation } from "@/i18n/client";
import type { SearchListingsParams } from "@/lib/api/listings";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id?: string | null): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

function paramsFromSearch(searchParams: URLSearchParams): SearchListingsParams {
  const sortBy = searchParams.get("sortBy");
  const normalizedSortBy =
    sortBy === "askingPrice" || sortBy === "price"
      ? "price"
      : sortBy === "mrr"
        ? "mrr"
        : sortBy === "createdAt"
          ? "createdAt"
          : undefined;

  return {
    categoryId: searchParams.get("categoryId") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    minMrr: searchParams.get("minMrr") ? Number(searchParams.get("minMrr")) : undefined,
    verified: searchParams.get("verified") === "true" ? true : undefined,
    country: searchParams.get("country") ?? undefined,
    sortBy: normalizedSortBy,
    sortDir: (searchParams.get("sortDir") as SearchListingsParams["sortDir"]) ?? undefined,
  };
}

const STATIC_QUICK_CATEGORIES = [
  { id: "all", key: "all" },
  { id: "SaaS", key: "saasAi" },
  { id: "Developer Tools", key: "devTools" },
  { id: "FinTech", key: "fintech" },
  { id: "E-Commerce", key: "ecommerce" },
  { id: "Media", key: "media" },
] as const;

export function MarketplaceView() {
  const { t } = useTranslation("marketplace");
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = paramsFromSearch(searchParams);
  const { marketplaceView, setMarketplaceView } = useUiStore();
  const [searchTerm, setSearchTerm] = React.useState("");
  const { data: categories = [] } = useCategories();

  // If categoryId in URL is a slug/name, resolve it to backend UUID if possible
  const resolvedCategoryId = React.useMemo(() => {
    if (!filters.categoryId || filters.categoryId === "all") return undefined;
    if (isValidUuid(filters.categoryId)) return filters.categoryId;
    const found = categories.find(
      (c) =>
        c.id === filters.categoryId ||
        c.name.toLowerCase() === filters.categoryId?.toLowerCase() ||
        c.slug.toLowerCase() === filters.categoryId?.toLowerCase(),
    );
    return found ? found.id : filters.categoryId;
  }, [filters.categoryId, categories]);

  const queryFilters = React.useMemo(
    () => ({
      ...filters,
      categoryId: resolvedCategoryId,
    }),
    [filters, resolvedCategoryId],
  );

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteListings(queryFilters);

  const rawListings = React.useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  // If category filter is by text name (e.g. static chip and not backend UUID), filter locally
  const activeCategoryFilter = filters.categoryId;
  const activeCategoryName = categories.find(
    (c) => c.id === activeCategoryFilter || c.name.toLowerCase() === activeCategoryFilter?.toLowerCase(),
  )?.name?.toLowerCase() ?? activeCategoryFilter?.toLowerCase();

  const filteredByCategory = React.useMemo(() => {
    if (!activeCategoryFilter || activeCategoryFilter === "all") return rawListings;
    if (isValidUuid(activeCategoryFilter)) return rawListings;
    return rawListings.filter(
      (l) => l.category && l.category.toLowerCase().includes(activeCategoryName ?? ""),
    );
  }, [rawListings, activeCategoryFilter, activeCategoryName]);

  const listings = React.useMemo(() => {
    if (!searchTerm) return filteredByCategory;
    const term = searchTerm.toLowerCase();
    return filteredByCategory.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.headline?.toLowerCase().includes(term) ||
        l.category?.toLowerCase().includes(term),
    );
  }, [filteredByCategory, searchTerm]);

  function updateFilters(next: SearchListingsParams) {
    const search = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value !== undefined && value !== "") search.set(key, String(value));
    });
    router.push(`/marketplace?${search.toString()}`);
  }

  const activeCategory = filters.categoryId ?? "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">{t("eyebrow")}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("pageTitle")}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{t("pageDescription")}</p>
        </div>

        {/* Search Bar & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="h-9 pl-8 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center rounded-lg border border-border/80 bg-muted/20 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`size-8 ${marketplaceView === "grid" ? "bg-card shadow-xs text-primary" : "text-muted-foreground"}`}
              onClick={() => setMarketplaceView("grid")}
              aria-label={t("gridView")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`size-8 ${marketplaceView === "list" ? "bg-card shadow-xs text-primary" : "text-muted-foreground"}`}
              onClick={() => setMarketplaceView("list")}
              aria-label={t("listView")}
            >
              <List className="size-4" />
            </Button>
          </div>

          {/* Mobile Filter Trigger Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold lg:hidden">
                <SlidersHorizontal className="size-3.5" />
                <span>{t("filters")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto p-4">
              <SheetHeader className="p-0 border-b pb-3">
                <SheetTitle className="text-sm font-bold">{t("filtersSheetTitle")}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ListingFilters
                  values={filters}
                  onChange={updateFilters}
                  onReset={() => router.push("/marketplace")}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Quick Category Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => updateFilters({ ...filters, categoryId: undefined })}
          className={`rounded-md border px-3 py-1 text-xs font-medium transition-all ${
            !filters.categoryId || filters.categoryId === "all"
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground"
          }`}
        >
          {t("quickCategories.all")}
        </button>

        {categories.length > 0
          ? categories.map((cat) => {
              const isSelected = filters.categoryId === cat.id || filters.categoryId?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    updateFilters({
                      ...filters,
                      categoryId: isSelected ? undefined : cat.id,
                    });
                  }}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })
          : STATIC_QUICK_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
              const isSelected = activeCategory.toLowerCase().includes(cat.id.toLowerCase());
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    updateFilters({
                      ...filters,
                      categoryId: isSelected ? undefined : cat.id,
                    });
                  }}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {t(`quickCategories.${cat.key}`)}
                </button>
              );
            })}
      </div>

      {/* Main Grid: Sidebar + Listings */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <ListingFilters values={filters} onChange={updateFilters} onReset={() => router.push("/marketplace")} />
        </aside>

        <div>
          {isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              icon={Store}
              title={t("noMatchTitle")}
              description={t("noMatchDescription")}
              action={
                <Button variant="outline" size="sm" onClick={() => router.push("/marketplace")}>
                  {t("clearAllFilters")}
                </Button>
              }
            />
          ) : (
            <>
              <div
                className={`grid gap-5 ${
                  marketplaceView === "grid"
                    ? "sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {hasNextPage && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="outline"
                    className="h-10 px-6 font-semibold"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? t("loadingMore") : t("loadMoreBusinesses")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
