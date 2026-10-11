import type { BusinessCategory } from "@/types/domain";

/**
 * The marketplace's headline categories, shown first and in this order.
 * They're real rows (seeded by the backend migration
 * 20261011120000_marketplace_filters_and_buyer_conversations), matched by slug.
 */
export const FEATURED_CATEGORY_SLUGS = [
  "saas-ai",
  "developer-tools",
  "fintech-api",
  "e-commerce",
  "media-newsletters",
] as const;

export function orderCategories(categories: BusinessCategory[]): BusinessCategory[] {
  const rank = (c: BusinessCategory) => {
    const index = (FEATURED_CATEGORY_SLUGS as readonly string[]).indexOf(c.slug);
    return index === -1 ? FEATURED_CATEGORY_SLUGS.length : index;
  };
  return [...categories].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

type Translate = (key: string, options: { defaultValue: string }) => string;

/** Translated label for a known category slug, falling back to its stored name. */
export function categoryLabel(t: Translate, category: Pick<BusinessCategory, "name" | "slug">): string {
  return t(`marketplace:categories.${category.slug}`, { defaultValue: category.name });
}
