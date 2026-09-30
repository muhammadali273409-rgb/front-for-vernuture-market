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
import { useUpdateListing, useListingStatusAction, type ListingStatusAction } from "@/hooks/use-businesses";
import { listingDetailsSchema, type ListingDetailsValues } from "@/lib/validations/business";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";
import type { OwnedBusiness } from "@/types/domain";

const LOCKED_STATUSES: OwnedBusiness["status"][] = ["PENDING_REVIEW", "SOLD", "SUSPENDED", "ARCHIVED"];

export function ListingSettingsForm({ business }: { business: OwnedBusiness }) {
  const { t } = useTranslation(["business", "errors"]);
  const updateListing = useUpdateListing(business.id);
  const statusAction = useListingStatusAction(business.id);

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

  // Mirrors the backend's edit lock; the backend still rejects edits on its own.
  const isLocked = LOCKED_STATUSES.includes(business.status);

  function runAction(action: ListingStatusAction, successKey: string) {
    statusAction.mutate(action, {
      onSuccess: () => toast.success(t(successKey)),
      onError: (e) => toast.error(friendlyErrorMessage(e, t, { showValidationDetail: true })),
    });
  }

  const pending = statusAction.isPending;

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
          <Button type="submit" disabled={updateListing.isPending || isLocked}>
            {updateListing.isPending ? t("common:saving") : t("business:seller.saveListingDetails")}
          </Button>
        </form>
      </Form>

      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        {(business.status === "DRAFT" || business.status === "REJECTED") && (
          <>
            <Button onClick={() => runAction("submitForReview", "business:seller.toastSubmittedForReview")} disabled={pending}>
              {pending ? t("business:seller.submittingEllipsis") : t("business:seller.submitForReview")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {business.status === "REJECTED"
                ? t("business:seller.rejectedNotice")
                : t("business:seller.publishRequirements")}
            </p>
          </>
        )}
        {business.status === "PENDING_REVIEW" && (
          <>
            <Button
              variant="outline"
              onClick={() => runAction("withdrawSubmission", "business:seller.toastSubmissionWithdrawn")}
              disabled={pending}
            >
              {t("business:seller.withdrawSubmission")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("business:seller.pendingReviewNotice")}</p>
          </>
        )}
        {business.status === "PUBLISHED" && (
          <Button
            variant="outline"
            onClick={() => runAction("unpublish", "business:seller.toastListingUnpublished")}
            disabled={pending}
          >
            {pending ? t("business:seller.pausing") : t("business:seller.unpublishListing")}
          </Button>
        )}
        {business.status === "PAUSED" && (
          <>
            <Button onClick={() => runAction("resume", "business:seller.toastListingResumed")} disabled={pending}>
              {pending ? t("business:seller.resumingEllipsis") : t("business:seller.resumeListing")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("business:seller.pausedNotice")}</p>
          </>
        )}
        {isLocked && business.status !== "PENDING_REVIEW" && (
          <p className="text-xs text-muted-foreground">{t("business:seller.lockedNotice")}</p>
        )}
      </div>
    </div>
  );
}
