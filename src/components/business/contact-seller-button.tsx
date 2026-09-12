"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageSquare } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useStartConversation } from "@/hooks/use-conversations";
import { messageSchema, type MessageValues } from "@/lib/validations/offer";
import { useTranslation } from "@/i18n/client";

export function ContactSellerButton({ businessId, ownerId }: { businessId: string; ownerId: string }) {
  const { t } = useTranslation("business");
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [open, setOpen] = React.useState(false);
  const startConversation = useStartConversation();

  const form = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { body: "" },
  });

  function onSubmit(values: MessageValues) {
    startConversation.mutate(
      { businessId, participantIds: [ownerId], initialMessage: values.body },
      { onSuccess: (conversation) => router.push(`/dashboard/messages/${conversation.id}`) },
    );
  }

  const isSelf = user?.id === ownerId;

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
        <Button variant="outline" disabled={isSelf}>
          <MessageSquare className="size-4" />
          {t("buyer.contactSeller")}
        </Button>
      </DialogTrigger>
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
                    <Textarea rows={5} placeholder={t("buyer.messagePlaceholder")} {...field} />
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
  );
}
