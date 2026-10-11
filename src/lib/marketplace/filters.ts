/**
 * Marketplace filter state <-> URL query string <-> GET /listings params.
 *
 * The URL is the single source of truth for what the marketplace shows, so a
 * filtered view survives a refresh and can be shared. Everything read from
 * the URL is validated here: anything malformed is dropped rather than sent
 * to the backend (which would reject it with a 400).
 *
 * Dependency-free on purpose — it's unit-tested with `node --test`.
 */

export const SORT_OPTIONS = ["recent", "price_asc", "price_desc", "revenue_desc", "profit_desc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

const SORT_TO_API: Record<SortOption, { sortBy: string; sortDir: "asc" | "desc" }> = {
  recent: { sortBy: "createdAt", sortDir: "desc" },
  price_asc: { sortBy: "price", sortDir: "asc" },
  price_desc: { sortBy: "price", sortDir: "desc" },
  revenue_desc: { sortBy: "revenue", sortDir: "desc" },
  profit_desc: { sortBy: "profit", sortDir: "desc" },
};

export const RANGE_FIELDS = ["price", "revenue", "profit"] as const;
export type RangeField = (typeof RANGE_FIELDS)[number];
type RangeKey = "minPrice" | "maxPrice" | "minRevenue" | "maxRevenue" | "minProfit" | "maxProfit";

export const PAGE_SIZE = 12;
const MAX_PAGE = 10_000;
const MAX_MONEY = 1_000_000_000_000;
const MAX_QUERY_LENGTH = 100;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface MarketplaceFilters {
  q?: string;
  /** Category slug (the shareable form). */
  category?: string;
  /** Legacy links carried a category UUID; still honoured. */
  categoryId?: string;
  businessModel?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Monthly revenue (latest MRR). */
  minRevenue?: number;
  maxRevenue?: number;
  /** Monthly profit (latest PROFIT). */
  minProfit?: number;
  maxProfit?: number;
  verified?: boolean;
  sort: SortOption;
  page: number;
}

export const DEFAULT_FILTERS: MarketplaceFilters = { sort: "recent", page: 1 };

interface ParamReader {
  get(name: string): string | null;
}

export function rangeKeys(field: RangeField): [RangeKey, RangeKey] {
  const suffix = field.charAt(0).toUpperCase() + field.slice(1);
  return [`min${suffix}` as RangeKey, `max${suffix}` as RangeKey];
}

/** A whole, non-negative amount within bounds — or undefined. */
export function parseAmount(raw: string | null | undefined): number | undefined {
  if (raw == null) return undefined;
  const trimmed = String(raw).trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) && value <= MAX_MONEY ? value : undefined;
}

function parseSort(params: ParamReader): SortOption {
  const sort = params.get("sort");
  if (sort && (SORT_OPTIONS as readonly string[]).includes(sort)) return sort as SortOption;

  // Older links used sortBy/sortDir.
  const sortBy = params.get("sortBy");
  const dir = params.get("sortDir") === "asc" ? "asc" : "desc";
  if (sortBy === "price" || sortBy === "askingPrice") return dir === "asc" ? "price_asc" : "price_desc";
  if (sortBy === "mrr" || sortBy === "revenue") return "revenue_desc";
  if (sortBy === "profit") return "profit_desc";
  return "recent";
}

export function parseFilters(params: ParamReader): MarketplaceFilters {
  const filters: MarketplaceFilters = { ...DEFAULT_FILTERS };

  const q = params.get("q")?.trim().slice(0, MAX_QUERY_LENGTH);
  if (q) filters.q = q;

  const category = params.get("category")?.trim().toLowerCase();
  if (category && SLUG.test(category) && category.length <= 80) {
    filters.category = category;
  } else {
    const categoryId = params.get("categoryId")?.trim();
    if (categoryId && UUID.test(categoryId)) filters.categoryId = categoryId;
  }

  const businessModel = params.get("businessModel")?.trim().slice(0, 80);
  if (businessModel) filters.businessModel = businessModel;

  for (const field of RANGE_FIELDS) {
    const [minKey, maxKey] = rangeKeys(field);
    let min = parseAmount(params.get(minKey));
    let max = parseAmount(params.get(maxKey));
    if (field === "revenue" && min === undefined) min = parseAmount(params.get("minMrr"));
    // A hand-edited URL with the bounds reversed means the same range.
    if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
    if (min !== undefined) filters[minKey] = min;
    if (max !== undefined) filters[maxKey] = max;
  }

  if (params.get("verified") === "true") filters.verified = true;

  filters.sort = parseSort(params);

  const page = parseAmount(params.get("page"));
  filters.page = page && page >= 1 && page <= MAX_PAGE ? page : 1;

  return filters;
}

/** Canonical query string (stable key order, defaults omitted) — no leading "?". */
export function serializeFilters(filters: MarketplaceFilters): string {
  const search = new URLSearchParams();
  if (filters.q) search.set("q", filters.q);
  if (filters.category) search.set("category", filters.category);
  else if (filters.categoryId) search.set("categoryId", filters.categoryId);
  if (filters.businessModel) search.set("businessModel", filters.businessModel);
  for (const field of RANGE_FIELDS) {
    for (const key of rangeKeys(field)) {
      const value = filters[key];
      if (value !== undefined) search.set(key, String(value));
    }
  }
  if (filters.verified) search.set("verified", "true");
  if (filters.sort !== "recent") search.set("sort", filters.sort);
  if (filters.page > 1) search.set("page", String(filters.page));
  return search.toString();
}

/**
 * Apply a change. Anything other than a page change sends the user back to
 * page 1 — page 3 of the old result set means nothing for the new one.
 */
export function updateFilters(
  filters: MarketplaceFilters,
  patch: Partial<MarketplaceFilters>,
): MarketplaceFilters {
  const next: MarketplaceFilters = { ...filters, ...patch };
  if ("category" in patch || "categoryId" in patch) {
    // Selecting a category (or "All") replaces any legacy id-based one.
    if (!("categoryId" in patch)) delete next.categoryId;
  }
  for (const key of Object.keys(next) as (keyof MarketplaceFilters)[]) {
    if (next[key] === undefined || next[key] === "" || next[key] === false) delete next[key];
  }
  next.sort = next.sort ?? "recent";
  next.page = "page" in patch && patch.page ? patch.page : 1;
  return next;
}

export function clearFilters(filters: MarketplaceFilters): MarketplaceFilters {
  // Keep only the sort order — it's a preference, not a filter.
  return { ...DEFAULT_FILTERS, sort: filters.sort };
}

/** Query params for GET /listings. */
export function toApiParams(filters: MarketplaceFilters, limit = PAGE_SIZE): Record<string, string | number> {
  const params: Record<string, string | number> = { page: filters.page, limit, ...SORT_TO_API[filters.sort] };
  if (filters.q) params.q = filters.q;
  if (filters.category) params.category = filters.category;
  else if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.businessModel) params.businessModel = filters.businessModel;
  for (const field of RANGE_FIELDS) {
    for (const key of rangeKeys(field)) {
      const value = filters[key];
      if (value !== undefined) params[key] = value;
    }
  }
  if (filters.verified) params.verified = "true";
  return params;
}

/** Number of active filters (a min/max pair counts once; search and sort don't count). */
export function countActiveFilters(filters: MarketplaceFilters): number {
  let count = 0;
  if (filters.category || filters.categoryId) count++;
  if (filters.businessModel) count++;
  for (const field of RANGE_FIELDS) {
    const [minKey, maxKey] = rangeKeys(field);
    if (filters[minKey] !== undefined || filters[maxKey] !== undefined) count++;
  }
  if (filters.verified) count++;
  return count;
}

export function hasAnyCriteria(filters: MarketplaceFilters): boolean {
  return Boolean(filters.q) || countActiveFilters(filters) > 0;
}
