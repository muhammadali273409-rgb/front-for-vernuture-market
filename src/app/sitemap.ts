import type { MetadataRoute } from "next";
import { listingsApi } from "@/lib/api/listings";
import { publicApiFetch } from "@/lib/api/public";
import type { ApiFetcher } from "@/lib/api/fetcher-type";

const BASE_URL = "https://front-for-vernuture-market-production.up.railway.app";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/marketplace", priority: 0.9, changeFrequency: "daily" },
  { path: "/marketplace/compare", priority: 0.5, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" },
  { path: "/register", priority: 0.3, changeFrequency: "yearly" },
];

/**
 * Individual listing pages, paginated from the public search endpoint.
 * Best-effort: if the backend is unreachable at build time, the sitemap
 * still ships with the static routes above rather than failing the build.
 */
async function getListingEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    let cursor: string | undefined;
    do {
      const { data, pagination } = await listingsApi.search(
        { cursor, limit: 100 },
        publicApiFetch as unknown as ApiFetcher,
      );
      for (const listing of data) {
        entries.push({
          url: `${BASE_URL}/marketplace/${listing.slug}`,
          lastModified: listing.publishedAt ? new Date(listing.publishedAt) : undefined,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      cursor = pagination.hasMore ? (pagination.nextCursor ?? undefined) : undefined;
    } while (cursor);
  } catch {
    return [];
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const listingEntries = await getListingEntries();

  return [...staticEntries, ...listingEntries];
}
