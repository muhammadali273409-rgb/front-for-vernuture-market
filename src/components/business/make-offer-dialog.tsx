"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateOffer } from "@/hooks/use-offers";
import { offerSchema, type OfferValues } from "@/lib/validations/offer";
import { useTranslation } from "@/i18n/client";

export function MakeOfferDialog({ businessId, currency }: { businessId: string; currency: string }) {
  const { t } = useTranslation("offers");
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [open, setOpen] = React.useState(false);
  const createOffer = useCreateOffer(businessId);

  const form = useForm<OfferValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: { amount: 0, currency, terms: "" },
  });

  function onSubmit(values: OfferValues) {
    createOffer.mutate(
      { amount: values.amount, currency: values.currency, terms: values.terms || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          router.push("/dashboard/offers");
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next && !user) {
          router.push(`/login?next=/marketplace`);
          return;
        }
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <HandCoins className="size-4" />
          {t("makeAnOffer")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("makeAnOffer")}</DialogTitle>
          <DialogDescription>{t("offerDialogDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("offerAmountCurrency", { currency })}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="1" {...field} />
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
                    <Textarea rows={4} placeholder={t("termsPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createOffer.isPending}>
                {createOffer.isPending ? t("common:submitting") : t("submitOffer")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
