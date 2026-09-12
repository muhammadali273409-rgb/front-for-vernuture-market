"use client";

import { use } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BusinessStatusBadge } from "@/components/business/business-status-badge";
import { AddMetricDialog } from "@/components/business/add-metric-dialog";
import { MetricsTable } from "@/components/business/metrics-table";
import { ListingSettingsForm } from "@/components/business/listing-settings-form";
import { DocumentManager } from "@/components/business/document-manager";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBusinessSchema, type CreateBusinessValues } from "@/lib/validations/business";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

function OverviewTab({ businessId, values }: { businessId: string; values: CreateBusinessValues }) {
  const { t } = useTranslation(["business", "settings", "common", "errors"]);
  const updateBusiness = useUpdateBusiness(businessId);
  const form = useForm<CreateBusinessValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: values,
  });

  function onSubmit(next: CreateBusinessValues) {
    updateBusiness.mutate(
      {
        name: next.name,
        description: next.description || undefined,
        businessModel: next.businessModel || undefined,
        country: next.country || undefined,
        website: next.website || undefined,
      },
      {
        onSuccess: () => toast.success(t("business:seller.toastUpdated")),
        onError: (error) => toast.error(friendlyErrorMessage(error, t)),
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
            <FormItem>
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
            <FormItem>
              <FormLabel>{t("business:description")}</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="businessModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("business:businessModel")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
  const { data: business, isLoading, isError, error, refetch } = useBusiness(id);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={business.name}
        description={business.listing?.headline ?? t("seller.manageListingDescription")}
        action={<BusinessStatusBadge status={business.status} />}
      />

      <Card>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">{t("seller.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="financials">{t("seller.tabs.financials")}</TabsTrigger>
              <TabsTrigger value="listing">{t("seller.tabs.listing")}</TabsTrigger>
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
                  website: business.website ?? "",
                }}
              />
            </TabsContent>

            <TabsContent value="financials" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{t("seller.financialMetrics")}</h3>
                <AddMetricDialog businessId={business.id} />
              </div>
              <MetricsTable metrics={business.metrics ?? []} />
            </TabsContent>

            <TabsContent value="listing" className="pt-4">
              <ListingSettingsForm business={business} />
            </TabsContent>

            <TabsContent value="documents" className="pt-4">
              <DocumentManager businessId={business.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
