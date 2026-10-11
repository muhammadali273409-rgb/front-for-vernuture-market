"use client";

import * as React from "react";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListingFacets } from "@/hooks/use-listings";
import { useTranslation } from "@/i18n/client";
import { categoryLabel } from "@/lib/marketplace/categories";
import {
  SORT_OPTIONS,
  countActiveFilters,
  parseAmount,
  rangeKeys,
  type MarketplaceFilters,
  type RangeField,
  type SortOption,
} from "@/lib/marketplace/filters";
import type { BusinessCategory } from "@/types/domain";

const RANGE_COMMIT_DELAY_MS = 600;
const ANY = "__any__";

interface ListingFiltersProps {
  filters: MarketplaceFilters;
  categories: BusinessCategory[];
  onChange: (patch: Partial<MarketplaceFilters>) => void;
  onReset: () => void;
}

export function ListingFilters({ filters, categories, onChange, onReset }: ListingFiltersProps) {
  const { t } = useTranslation("marketplace");
  const { data: facets } = useListingFacets();
  const activeCount = countActiveFilters(filters);

  const selectedCategory =
    filters.category ?? categories.find((c) => c.id === filters.categoryId)?.slug ?? ANY;

  const businessModels = facets?.businessModels ?? [];
  const modelOptions =
    filters.businessModel &&
    !businessModels.some((m) => m.value.toLowerCase() === filters.businessModel!.toLowerCase())
      ? [{ value: filters.businessModel, count: 0 }, ...businessModels]
      : businessModels;
  const selectedModel =
    modelOptions.find((m) => m.value.toLowerCase() === filters.businessModel?.toLowerCase())?.value ?? ANY;

  return (
    <div className="space-y-5 rounded-xl border border-border/80 bg-card p-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">{t("filters")}</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0.2 text-[10px] font-bold">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <RotateCcw className="mr-1 size-3" />
            {t("common:reset")}
          </Button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("industryCategory")}</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => onChange({ category: value === ANY ? undefined : value })}
        >
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder={t("allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t("allCategories")}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {categoryLabel(t, category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RangeFilter
        field="price"
        label={t("askingPriceUsd")}
        filters={filters}
        onChange={onChange}
      />
      <RangeFilter
        field="revenue"
        label={t("monthlyRevenueRange")}
        hint={t("monthlyRevenueHint")}
        filters={filters}
        onChange={onChange}
      />
      <RangeFilter
        field="profit"
        label={t("monthlyProfitRange")}
        hint={t("monthlyProfitHint")}
        filters={filters}
        onChange={onChange}
      />

      {/* Business model — options come from live listings */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("businessModel")}</Label>
        <Select
          value={selectedModel}
          onValueChange={(value) => onChange({ businessModel: value === ANY ? undefined : value })}
          disabled={modelOptions.length === 0}
        >
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder={t("anyBusinessModel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t("anyBusinessModel")}</SelectItem>
            {modelOptions.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.count > 0 ? `${model.value} (${model.count})` : model.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Verification */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
        <div className="flex items-start gap-2">
          <Checkbox
            id="verified"
            className="mt-0.5"
            checked={filters.verified ?? false}
            onCheckedChange={(checked) => onChange({ verified: checked === true ? true : undefined })}
          />
          <Label htmlFor="verified" className="flex cursor-pointer flex-col items-start gap-0.5 text-xs font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              {t("verifiedOnly")}
            </span>
            <span className="font-normal text-muted-foreground">{t("verifiedOnlyHint")}</span>
          </Label>
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-1.5 border-t border-border/60 pt-3">
        <Label className="text-xs font-medium">{t("sortResults")}</Label>
        <Select value={filters.sort} onValueChange={(value) => onChange({ sort: value as SortOption })}>
          <SelectTrigger className="h-8 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`sortOptions.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * Min/max inputs keep a local draft while the user types and commit it once
 * typing settles (or on blur / Enter) — one request per finished edit, not
 * one per keystroke. Invalid input is flagged and never sent.
 */
function RangeFilter({
  field,
  label,
  hint,
  filters,
  onChange,
}: {
  field: RangeField;
  label: string;
  hint?: string;
  filters: MarketplaceFilters;
  onChange: (patch: Partial<MarketplaceFilters>) => void;
}) {
  const { t } = useTranslation("marketplace");
  const [minKey, maxKey] = rangeKeys(field);
  const committedMin = filters[minKey];
  const committedMax = filters[maxKey];
  const committed = `${committedMin ?? ""}|${committedMax ?? ""}`;

  const [draft, setDraft] = React.useState({ min: String(committedMin ?? ""), max: String(committedMax ?? "") });
  const [syncedCommitted, setSyncedCommitted] = React.useState(committed);

  // URL changed underneath us (clear all, chip removed, back button): show it.
  if (committed !== syncedCommitted) {
    setSyncedCommitted(committed);
    setDraft({ min: String(committedMin ?? ""), max: String(committedMax ?? "") });
  }

  const min = draft.min.trim() === "" ? undefined : parseAmount(draft.min);
  const max = draft.max.trim() === "" ? undefined : parseAmount(draft.max);
  const invalid =
    (draft.min.trim() !== "" && min === undefined) || (draft.max.trim() !== "" && max === undefined);
  const inverted = min !== undefined && max !== undefined && min > max;
  const error = invalid ? t("rangeInvalid") : inverted ? t("rangeInverted") : null;

  const commit = React.useCallback(() => {
    if (error) return;
    if (min === committedMin && max === committedMax) return;
    onChange({ [minKey]: min, [maxKey]: max });
  }, [error, min, max, committedMin, committedMax, minKey, maxKey, onChange]);

  React.useEffect(() => {
    const timer = setTimeout(commit, RANGE_COMMIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [commit]);

  const inputProps = {
    type: "text",
    inputMode: "numeric" as const,
    className: "h-8 text-xs font-mono",
    "aria-invalid": Boolean(error),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter") commit();
    },
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex items-center gap-1.5">
        <Input
          {...inputProps}
          aria-label={`${label} — ${t("minPlaceholder")}`}
          placeholder={t("minPlaceholder")}
          value={draft.min}
          onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
        />
        <span className="text-xs text-muted-foreground">–</span>
        <Input
          {...inputProps}
          aria-label={`${label} — ${t("maxPlaceholder")}`}
          placeholder={t("maxPlaceholder")}
          value={draft.max}
          onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : (
        hint && <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
