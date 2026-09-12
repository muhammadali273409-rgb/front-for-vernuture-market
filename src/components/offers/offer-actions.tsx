"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAcceptOffer, useCounterOffer, useRejectOffer, useWithdrawOffer } from "@/hooks/use-offers";
import { offerSchema, type OfferValues } from "@/lib/validations/offer";
import { useTranslation } from "@/i18n/client";
import type { Offer } from "@/types/domain";

const OPEN_STATUSES = ["SUBMITTED", "VIEWED", "COUNTERED"];

export function OfferActions({ offer, currentUserId }: { offer: Offer; currentUserId?: string }) {
  const { t } = useTranslation(["offers", "common"]);
  const router = useRouter();
  const [counterOpen, setCounterOpen] = React.useState(false);
  const counterOffer = useCounterOffer();
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();
  const withdrawOffer = useWithdrawOffer();

  const isOpen = OPEN_STATUSES.includes(offer.status);
  const isRecipient = isOpen && offer.createdById !== currentUserId;
  const isCreator = isOpen && offer.createdById === currentUserId;

  const form = useForm<OfferValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: { amount: offer.amount, currency: offer.currency, terms: "" },
  });

  if (!isOpen) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {isRecipient && (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={acceptOffer.isPending}>{t("acceptOffer")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("acceptOfferTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("acceptOfferWarning")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common:cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    acceptOffer.mutate(offer.id, {
                      onSuccess: (deal) => router.push(`/dashboard/deals/${deal.id}`),
                    })
                  }
                >
                  {t("accept")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={counterOpen} onOpenChange={setCounterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">{t("counterShort")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("sendCounterOfferTitle")}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) =>
                    counterOffer.mutate(
                      { id: offer.id, input: { amount: values.amount, currency: values.currency, terms: values.terms || undefined } },
                      { onSuccess: () => setCounterOpen(false) },
                    ),
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offerAmountCurrency", { currency: offer.currency })}</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("termsOptional")}</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={counterOffer.isPending}>
                      {counterOffer.isPending ? t("sending") : t("sendCounter")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => rejectOffer.mutate({ id: offer.id })}
            disabled={rejectOffer.isPending}
          >
            {t("rejectShort")}
          </Button>
        </>
      )}

      {isCreator && (
        <Button
          variant="outline"
          onClick={() => withdrawOffer.mutate({ id: offer.id })}
          disabled={withdrawOffer.isPending}
        >
          {t("withdrawOffer")}
        </Button>
      )}
    </div>
  );
}
