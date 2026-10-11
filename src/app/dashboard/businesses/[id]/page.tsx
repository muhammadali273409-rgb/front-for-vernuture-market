"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BusinessStatusBadge } from "@/components/business/business-status-badge";
import { AddMetricDialog } from "@/components/business/add-metric-dialog";
import { MetricsTable } from "@/components/business/metrics-table";
import { ListingSettingsForm } from "@/components/business/listing-settings-form";
import { DocumentManager } from "@/components/business/document-manager";
import { BusinessImageManager } from "@/components/business/business-image-manager";
import { DeleteBusinessDialog } from "@/components/business/delete-business-dialog";
import { PublishChecklist } from "@/components/business/publish-checklist";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";
import { useCategories } from "@/hooks/use-listings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBusinessSchema, type CreateBusinessValues } from "@/lib/validations/business";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";
import { categoryLabel, orderCategories } from "@/lib/marketplace/categories";
import {
  PUBLISH_FIELD_TAB,
  focusPublishField,
  isPublishField,
  publishFieldDomId,
} from "@/lib/business/publish-fields";
import type { OwnedBusiness, PublishField } from "@/types/domain";

/** Marks fields a publish attempt was refused for, so FormMessage shows them in red. */
function useHighlightErrors(
  highlight: PublishField[],
  fields: PublishField[],
  setError: (name: never, error: { type: string; message: string }) => void,
) {
  useEffect(() => {
    for (const field of highlight) {
      if (fields.includes(field)) {
        setError(field as never, { type: "required", message: "validation:requiredToPublish" });
      }
    }
  }, [highlight, fields, setError]);
}

const OVERVIEW_FIELDS: PublishField[] = ["name", "description", "categoryId", "businessModel"];

/** Mirrors the backend's edit lock; the backend still rejects edits on its own. */
const LOCKED_STATUSES: OwnedBusiness["status"][] = ["PENDING_REVIEW", "SOLD", "SUSPENDED", "ARCHIVED"];

/** Statuses a seller can delete from; a live listing must be unpublished first. */
const DELETABLE_STATUSES: OwnedBusiness["status"][] = ["DRAFT", "REJECTED", "PAUSED"];

function OverviewTab({
  businessId,
  values,
  highlight,
}: {
  businessId: string;
  values: CreateBusinessValues;
  highlight: PublishField[];
}) {
  const { t } = useTranslation(["business", "settings", "common", "errors"]);
  const updateBusiness = useUpdateBusiness(businessId);
  const { data: rawCategories } = useCategories();
  const categories = orderCategories(rawCategories ?? []);
  const form = useForm<CreateBusinessValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: values,
  });
  useHighlightErrors(highlight, OVERVIEW_FIELDS, form.setError as never);

  function onSubmit(next: CreateBusinessValues) {
    updateBusiness.mutate(
      {
        name: next.name,
        description: next.description || undefined,
        categoryId: next.categoryId || undefined,
        businessModel: next.businessModel || undefined,
        country: next.country || undefined,
        city: next.city || undefined,
        website: next.website || undefined,
      },
      {
        onSuccess: () => toast.success(t("business:seller.toastUpdated")),
        onError: (error) => toast.error(friendlyErrorMessage(error, t, { showValidationDetail: true })),
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem id={publishFieldDomId("name")}>
              <FormLabel>{t("business:businessName")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem id={publishFieldDomId("description")}>
              <FormLabel>{t("business:description")}</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem id={publishFieldDomId("categoryId")}>
                <FormLabel>{t("business:category")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("business:seller.selectCategoryPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {categoryLabel(t, category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="businessModel"
            render={({ field }) => (
              <FormItem id={publishFieldDomId("businessModel")}>
                <FormLabel>{t("business:businessModel")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("business:country")}</FormLabel>
                <FormControl>
                  <Input maxLength={2} {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("business:project.city")}</FormLabel>
                <FormControl>
                  <Input maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("business:website")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateBusiness.isPending}>
          {updateBusiness.isPending ? t("common:saving") : t("settings:saveChanges")}
        </Button>
      </form>
    </Form>
  );
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation("business");
  const { id } = use(params);
  const router = useRouter();
  const { data: business, isLoading, isError, error, refetch } = useBusiness(id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState("overview");
  // Fields a publish attempt was just refused for (also arrives as ?missing=… from other pages).
  const [blocked, setBlocked] = useState<PublishField[]>(() =>
    typeof window === "undefined"
      ? []
      : (new URLSearchParams(window.location.search).get("missing")?.split(",").filter(isPublishField) ?? []),
  );

  const goToField = useCallback((field: PublishField) => {
    setTab(PUBLISH_FIELD_TAB[field]);
    // Let the tab render before scrolling to the field.
    setTimeout(() => focusPublishField(field), 60);
  }, []);

  const onPublishBlocked = useCallback(
    (missing: PublishField[]) => {
      setBlocked(missing);
      if (missing[0]) goToField(missing[0]);
    },
    [goToField],
  );

  // Stop highlighting a field once the backend no longer reports it missing.
  const missingKey = (business?.missingForPublish ?? []).join(",");
  const highlight = useMemo(
    () => blocked.filter((field) => missingKey.split(",").includes(field)),
    [blocked, missingKey],
  );

  // Arrived with ?missing=… (from "My projects" or the marketplace): jump to the first field once loaded.
  const businessLoaded = Boolean(business);
  useEffect(() => {
    if (!businessLoaded || blocked.length === 0) return;
    const timer = setTimeout(() => goToField(blocked[0]), 0);
    return () => clearTimeout(timer);
    // Only once, when the project first loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessLoaded]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !business) {
    return <ErrorState error={error} onRetry={() => refetch()} title={t("unableToLoad")} />;
  }

  const isLive = business.status === "PUBLISHED" && business.listing?.status === "PUBLISHED";
  const canDelete = DELETABLE_STATUSES.includes(business.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={business.name}
        description={business.listing?.headline ?? t("seller.manageListingDescription")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <BusinessStatusBadge status={business.status} />
            {isLive && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/marketplace/${business.slug}`} target="_blank">
                  <ExternalLink className="size-4" />
                  {t("project.viewOnMarketplace")}
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (canDelete) setConfirmDelete(true);
                else toast.error(t("project.unpublishBeforeDelete"));
              }}
            >
              <Trash2 className="size-4" />
              {t("project.delete")}
            </Button>
          </div>
        }
      />

      <p className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
        {isLive ? t("project.liveNotice") : t("project.draftNotice")}
      </p>

      {!isLive && (
        <PublishChecklist
          missing={business.missingForPublish ?? []}
          blocked={highlight.length > 0}
          onGoToField={goToField}
        />
      )}

      <Card>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">{t("seller.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="listing">{t("seller.tabs.listing")}</TabsTrigger>
              <TabsTrigger value="media">{t("project.mediaTab")}</TabsTrigger>
              <TabsTrigger value="financials">{t("seller.tabs.financials")}</TabsTrigger>
              <TabsTrigger value="documents">{t("seller.tabs.documents")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-4">
              <OverviewTab
                businessId={business.id}
                values={{
                  name: business.name,
                  description: business.description ?? "",
                  categoryId: business.categoryId ?? "",
                  businessModel: business.businessModel ?? "",
                  foundedAt: business.foundedAt ?? "",
                  country: business.country ?? "",
                  city: business.city ?? "",
                  website: business.website ?? "",
                }}
                highlight={highlight}
              />
            </TabsContent>

            <TabsContent value="listing" className="pt-4">
              <ListingSettingsForm business={business} highlight={highlight} onPublishBlocked={onPublishBlocked} />
            </TabsContent>

            <TabsContent value="media" className="pt-4">
              <BusinessImageManager
                businessId={business.id}
                images={business.images ?? []}
                disabled={LOCKED_STATUSES.includes(business.status)}
              />
            </TabsContent>

            <TabsContent value="financials" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{t("seller.financialMetrics")}</h3>
                <AddMetricDialog businessId={business.id} />
              </div>
              <MetricsTable metrics={business.metrics ?? []} />
            </TabsContent>

            <TabsContent value="documents" className="pt-4">
              <DocumentManager businessId={business.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DeleteBusinessDialog
        business={confirmDelete ? { id: business.id, name: business.name } : null}
        onOpenChange={setConfirmDelete}
        onDeleted={() => router.push("/dashboard/businesses")}
      />
    </div>
  );
}
