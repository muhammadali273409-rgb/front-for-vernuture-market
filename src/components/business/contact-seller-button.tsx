"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useStartBusinessConversation } from "@/hooks/use-conversations";
import { isBuyerRole } from "@/lib/auth/roles";
import { MESSAGE_MAX_LENGTH, messageSchema, type MessageValues } from "@/lib/validations/offer";
import { useTranslation } from "@/i18n/client";

interface ContactSellerButtonProps {
  businessId: string;
  /** Only used to recognise the seller's own listing in the UI — never sent to the API. */
  sellerId: string;
  size?: "sm" | "default";
}

/**
 * Opens (or reopens) the buyer's conversation with this listing's seller.
 * The backend works out who the seller is from the business; the client
 * only says which business.
 */
export function ContactSellerButton({ businessId, sellerId, size = "default" }: ContactSellerButtonProps) {
  const { t } = useTranslation("business");
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const [open, setOpen] = React.useState(false);
  const startConversation = useStartBusinessConversation();

  const form = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { body: "" },
  });

  const isOwnListing = user?.id === sellerId;
  const canContact = !user || (isBuyerRole(user.role) && !isOwnListing);
  const disabledReason = isOwnListing
    ? t("buyer.ownListing")
    : user && !isBuyerRole(user.role)
      ? t("buyer.buyersOnly")
      : undefined;

  function handleClick() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  }

  function onSubmit(values: MessageValues) {
    startConversation.mutate(
      { businessId, message: values.body },
      {
        onSuccess: (conversation) => {
          if (conversation.created === false) toast.success(t("buyer.addedToConversation"));
          setOpen(false);
          form.reset();
          router.push(`/dashboard/messages/${conversation.id}`);
        },
        // On failure the hook shows the error; the dialog and the typed text stay.
      },
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className={size === "sm" ? "h-8 text-xs" : undefined}
        disabled={isLoading || !canContact}
        title={disabledReason}
        onClick={handleClick}
      >
        <MessageSquare className="size-4" />
        {t("buyer.contactSeller")}
      </Button>
      {disabledReason && <span className="sr-only">{disabledReason}</span>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("buyer.messageSellerTitle")}</DialogTitle>
            <DialogDescription>{t("buyer.messageSellerDescription")}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("buyer.messageLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        maxLength={MESSAGE_MAX_LENGTH}
                        placeholder={t("buyer.messagePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={startConversation.isPending}>
                  {startConversation.isPending ? t("buyer.sending") : t("buyer.sendMessage")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
