"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateListing, usePublishListing, useUnpublishListing } from "@/hooks/use-businesses";
import { listingDetailsSchema, type ListingDetailsValues } from "@/lib/validations/business";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";
import type { OwnedBusiness } from "@/types/domain";

export function ListingSettingsForm({ business }: { business: OwnedBusiness }) {
  const { t } = useTranslation(["business", "errors"]);
  const updateListing = useUpdateListing(business.id);
  const publish = usePublishListing(business.id);
  const unpublish = useUnpublishListing(business.id);

  const form = useForm<ListingDetailsValues>({
    resolver: zodResolver(listingDetailsSchema),
    defaultValues: {
      headline: business.listing?.headline ?? "",
      askingPrice: business.listing?.askingPrice ?? undefined,
      currency: business.listing?.currency ?? "USD",
    },
  });

  function onSubmit(values: ListingDetailsValues) {
    updateListing.mutate(
      { headline: values.headline || undefined, askingPrice: values.askingPrice, currency: values.currency },
      {
        onSuccess: () => toast.success(t("business:seller.toastListingUpdated")),
        onError: (error) => toast.error(friendlyErrorMessage(error, t)),
      },
    );
  }

  const isPublished = business.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("business:seller.headline")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("business:seller.headlinePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="askingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("business:askingPrice")}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("business:seller.currency")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={updateListing.isPending}>
            {updateListing.isPending ? t("common:saving") : t("business:seller.saveListingDetails")}
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-3 border-t pt-4">
        {isPublished ? (
          <Button
            variant="outline"
            onClick={() => unpublish.mutate(undefined, {
              onSuccess: () => toast.success(t("business:seller.toastListingUnpublished")),
              onError: (e) => toast.error(friendlyErrorMessage(e, t)),
            })}
            disabled={unpublish.isPending}
          >
            {unpublish.isPending ? t("business:seller.pausing") : t("business:seller.unpublishListing")}
          </Button>
        ) : (
          <Button
            onClick={() => publish.mutate(undefined, {
              onSuccess: () => toast.success(t("business:seller.toastListingPublished")),
              onError: (e) => toast.error(friendlyErrorMessage(e, t)),
            })}
            disabled={publish.isPending}
          >
            {publish.isPending ? t("business:seller.publishingEllipsis") : t("business:seller.publishListing")}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">{t("business:seller.publishRequirements")}</p>
      </div>
    </div>
  );
}
