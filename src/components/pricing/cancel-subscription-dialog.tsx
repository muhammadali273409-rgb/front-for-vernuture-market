"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/client";
import { formatDate } from "@/i18n/format";
import type { Locale } from "@/i18n/settings";
import { useCancelSubscription } from "@/hooks/use-subscription";
import { toast } from "sonner";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "cancel" | "downgrade";
  planName: string;
  periodEndDate: string | null;
  onCancelled?: () => void;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  variant,
  planName,
  periodEndDate,
  onCancelled,
}: CancelSubscriptionDialogProps) {
  const { t, i18n } = useTranslation(["pricing", "common"] as const);
  const cancelMutation = useCancelSubscription();

  const formattedDate = periodEndDate
    ? formatDate(periodEndDate, i18n.language as Locale)
    : formatDate(new Date(), i18n.language as Locale);

  const isDowngrade = variant === "downgrade";

  function handleConfirm() {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("cancelDialog.toastCancelled", { date: formattedDate }));
        onOpenChange(false);
        onCancelled?.();
      },
      onError: () => {
        toast.error(t("common:somethingWentWrong"));
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !cancelMutation.isPending && onOpenChange(next)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-warning/10 text-warning">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle>{isDowngrade ? t("downgradeDialog.title") : t("cancelDialog.title")}</DialogTitle>
          <DialogDescription>
            {isDowngrade
              ? t("downgradeDialog.description", { plan: planName, date: formattedDate })
              : t("cancelDialog.description", { plan: planName, date: formattedDate })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cancelMutation.isPending}>
            {isDowngrade ? t("downgradeDialog.cancel") : t("cancelDialog.keep")}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={cancelMutation.isPending}>
            {cancelMutation.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" />
                {t("cancelDialog.cancelling")}
              </span>
            ) : isDowngrade ? (
              t("downgradeDialog.confirm")
            ) : (
              t("cancelDialog.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
