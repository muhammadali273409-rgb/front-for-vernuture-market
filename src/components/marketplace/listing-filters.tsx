"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-listings";
import { useTranslation } from "@/i18n/client";
import type { SearchListingsParams } from "@/lib/api/listings";
import { ShieldCheck, RotateCcw } from "lucide-react";

interface ListingFiltersProps {
  values: SearchListingsParams;
  onChange: (values: SearchListingsParams) => void;
  onReset: () => void;
}

export function ListingFilters({ values, onChange, onReset }: ListingFiltersProps) {
  const { t } = useTranslation("marketplace");
  const { data: categories = [] } = useCategories();

  // Count active filters
  const activeCount = Object.entries(values).filter(
    ([k, v]) => v !== undefined && v !== "" && k !== "sortBy" && k !== "sortDir",
  ).length;

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
            <RotateCcw className="size-3 mr-1" />
            {t("common:reset")}
          </Button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("industryCategory")}</Label>
        <Select
          value={values.categoryId ?? "all"}
          onValueChange={(value) => onChange({ ...values, categoryId: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder={t("allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asking Price Range */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t("askingPriceUsd")}</Label>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={0}
            placeholder={t("minPricePlaceholder")}
            className="h-8 text-xs font-mono"
            value={values.minPrice ?? ""}
            onChange={(e) => onChange({ ...values, minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder={t("maxPricePlaceholder")}
            className="h-8 text-xs font-mono"
            value={values.maxPrice ?? ""}
            onChange={(e) => onChange({ ...values, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      {/* Minimum MRR */}
      <div className="space-y-1.5">
        <Label htmlFor="minMrr" className="text-xs font-medium">{t("minMrrLabel")}</Label>
        <Input
          id="minMrr"
          type="number"
          min={0}
          placeholder={t("minMrrPlaceholder")}
          className="h-8 text-xs font-mono"
          value={values.minMrr ?? ""}
          onChange={(e) => onChange({ ...values, minMrr: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      {/* Country Code */}
      <div className="space-y-1.5">
        <Label htmlFor="country" className="text-xs font-medium">{t("jurisdictionCountry")}</Label>
        <Input
          id="country"
          placeholder={t("countryPlaceholder")}
          maxLength={2}
          className="h-8 text-xs font-mono uppercase"
          value={values.country ?? ""}
          onChange={(e) => onChange({ ...values, country: e.target.value.toUpperCase() || undefined })}
        />
      </div>

      {/* Verified Only Checkbox */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="verified"
            checked={values.verified ?? false}
            onCheckedChange={(checked) => onChange({ ...values, verified: checked === true ? true : undefined })}
          />
          <Label htmlFor="verified" className="flex items-center gap-1 text-xs font-medium cursor-pointer">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("auditedTrustOnly")}</span>
          </Label>
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5 border-t border-border/60 pt-3">
        <Label className="text-xs font-medium">{t("sortResults")}</Label>
        <Select
          value={`${(values.sortBy as string) === "askingPrice" ? "price" : (values.sortBy ?? "createdAt")}:${values.sortDir ?? "desc"}`}
          onValueChange={(value) => {
            const [sortBy, sortDir] = value.split(":") as [SearchListingsParams["sortBy"], SearchListingsParams["sortDir"]];
            onChange({ ...values, sortBy, sortDir });
          }}
        >
          <SelectTrigger className="h-8 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">{t("newestFirst")}</SelectItem>
            <SelectItem value="createdAt:asc">{t("oldestFirst")}</SelectItem>
            <SelectItem value="price:asc">{t("priceLowToHigh")}</SelectItem>
            <SelectItem value="price:desc">{t("priceHighToLow")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
