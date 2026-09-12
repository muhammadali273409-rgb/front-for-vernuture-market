"use client";

import * as React from "react";
import { Briefcase, Loader2, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";

type GoogleRole = "BUYER" | "SELLER";

interface GoogleRoleSelectDialogProps {
  open: boolean;
  onCancel: () => void;
  onContinue: (role: GoogleRole) => void;
  isSubmitting: boolean;
}

/**
 * Shown once, only for a Google identity that has no VentureMarket account
 * yet (the backend replied `needsRole: true`) — never for an existing
 * account, which always signs straight in with its stored role. Only Buyer
 * and Seller are offered; Admin is not a selectable value anywhere in this
 * component, and the backend independently rejects anything else it might
 * be sent regardless.
 */
export function GoogleRoleSelectDialog({
  open,
  onCancel,
  onContinue,
  isSubmitting,
}: GoogleRoleSelectDialogProps) {
  const { t } = useTranslation(["auth"] as const);
  const [selected, setSelected] = React.useState<GoogleRole | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isSubmitting) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={!isSubmitting}
        onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
        onInteractOutside={(e) => isSubmitting && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("auth:googleRoleModal.title")}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setSelected("BUYER")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all disabled:opacity-60",
              selected === "BUYER"
                ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500"
                : "border-border/80 hover:border-blue-500/60",
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="size-5" />
            </span>
            <span className="text-sm font-semibold text-foreground">{t("auth:roleBuyer")}</span>
            <span className="text-[11px] leading-snug text-muted-foreground">
              {t("auth:googleRoleModal.buyerDescription")}
            </span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setSelected("SELLER")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all disabled:opacity-60",
              selected === "SELLER"
                ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500"
                : "border-border/80 hover:border-blue-500/60",
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="size-5" />
            </span>
            <span className="text-sm font-semibold text-foreground">{t("auth:roleSeller")}</span>
            <span className="text-[11px] leading-snug text-muted-foreground">
              {t("auth:googleRoleModal.sellerDescription")}
            </span>
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            {t("auth:googleRoleModal.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!selected || isSubmitting}
            onClick={() => selected && onContinue(selected)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>{t("auth:googleRoleModal.creatingAccount")}</span>
              </span>
            ) : (
              t("auth:googleRoleModal.continue")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
