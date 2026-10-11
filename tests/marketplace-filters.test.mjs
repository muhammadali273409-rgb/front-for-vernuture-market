// Run with `npm test` (Node's built-in test runner; Node >= 22.18 strips the
// TypeScript types of the imported module natively).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clearFilters,
  countActiveFilters,
  parseFilters,
  serializeFilters,
  toApiParams,
  updateFilters,
} from "../src/lib/marketplace/filters.ts";

const parse = (qs) => parseFilters(new URLSearchParams(qs));

test("round-trips every supported filter through the URL", () => {
  const qs =
    "q=ai+tools&category=saas-ai&businessModel=SaaS&minPrice=1000&maxPrice=100000" +
    "&minRevenue=1000&maxRevenue=50000&minProfit=0&maxProfit=20000&verified=true&sort=price_asc&page=3";
  const filters = parse(qs);
  assert.deepEqual(filters, {
    q: "ai tools",
    category: "saas-ai",
    businessModel: "SaaS",
    minPrice: 1000,
    maxPrice: 100000,
    minRevenue: 1000,
    maxRevenue: 50000,
    minProfit: 0,
    maxProfit: 20000,
    verified: true,
    sort: "price_asc",
    page: 3,
  });
  assert.equal(serializeFilters(filters), qs);
  assert.deepEqual(parse(serializeFilters(filters)), filters);
});

test("drops malformed and malicious values instead of sending them", () => {
  const filters = parse(
    "category=saas'%20OR%201=1&minPrice=-5&maxPrice=abc&minRevenue=1e9&sort=passwordHash&page=0&verified=yes&categoryId=not-a-uuid",
  );
  assert.deepEqual(filters, { sort: "recent", page: 1 });
});

test("trims search and treats whitespace-only as no search", () => {
  assert.equal(parse("q=%20%20saas%20%20").q, "saas");
  assert.equal(parse("q=%20%20%20").q, undefined);
  assert.equal(parse("q=" + "x".repeat(150)).q.length, 100);
});

test("swaps a reversed range rather than producing an impossible query", () => {
  const filters = parse("minPrice=500&maxPrice=100");
  assert.equal(filters.minPrice, 100);
  assert.equal(filters.maxPrice, 500);
});

test("understands legacy links", () => {
  const filters = parse(
    "categoryId=c0a80101-0000-4000-8000-000000000001&minMrr=2000&sortBy=price&sortDir=asc",
  );
  assert.equal(filters.categoryId, "c0a80101-0000-4000-8000-000000000001");
  assert.equal(filters.minRevenue, 2000);
  assert.equal(filters.sort, "price_asc");
});

test("changing a filter resets to page 1; changing the page does not", () => {
  const onPage3 = parse("category=saas-ai&page=3");
  assert.equal(updateFilters(onPage3, { minPrice: 10 }).page, 1);
  assert.equal(updateFilters(onPage3, { sort: "price_desc" }).page, 1);
  assert.equal(updateFilters(onPage3, { page: 4 }).page, 4);
  assert.equal(updateFilters(onPage3, { page: 4 }).category, "saas-ai");
});

test("selecting All categories clears the category (including a legacy id)", () => {
  const legacy = parse("categoryId=c0a80101-0000-4000-8000-000000000001&minPrice=5");
  const all = updateFilters(legacy, { category: undefined });
  assert.equal(all.category, undefined);
  assert.equal(all.categoryId, undefined);
  assert.equal(all.minPrice, 5, "other filters are kept");
  assert.equal(serializeFilters(all), "minPrice=5");
});

test("clear all keeps only the sort preference", () => {
  const filters = parse("q=x&category=saas-ai&minPrice=1&verified=true&sort=profit_desc&page=2");
  assert.deepEqual(clearFilters(filters), { sort: "profit_desc", page: 1 });
});

test("maps to the backend's GET /listings contract", () => {
  const params = toApiParams(parse("category=fintech-api&minRevenue=100&verified=true&sort=revenue_desc&page=2"));
  assert.deepEqual(params, {
    page: 2,
    limit: 12,
    sortBy: "revenue",
    sortDir: "desc",
    category: "fintech-api",
    minRevenue: 100,
    verified: "true",
  });
  assert.deepEqual(toApiParams(parse("")), { page: 1, limit: 12, sortBy: "createdAt", sortDir: "desc" });
});

test("counts active filters, a range once", () => {
  assert.equal(countActiveFilters(parse("")), 0);
  assert.equal(countActiveFilters(parse("q=ai&sort=price_asc")), 0, "search and sort are not filters");
  assert.equal(countActiveFilters(parse("category=saas-ai&minPrice=1&maxPrice=9&minProfit=1&verified=true")), 4);
});
