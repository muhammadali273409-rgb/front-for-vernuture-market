"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteBusiness } from "@/hooks/use-businesses";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

interface DeleteBusinessDialogProps {
  business: { id: string; name: string } | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

/** Confirmation dialog for deleting a project. Open while `business` is set. */
export function DeleteBusinessDialog({ business, onOpenChange, onDeleted }: DeleteBusinessDialogProps) {
  const { t } = useTranslation(["business", "common", "errors"]);
  const deleteBusiness = useDeleteBusiness();

  function handleConfirm() {
    if (!business) return;
    deleteBusiness.mutate(business.id, {
      onSuccess: () => {
        toast.success(t("project.toastDeleted"));
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (error) => toast.error(friendlyErrorMessage(error, t, { showValidationDetail: true })),
    });
  }

  return (
    <AlertDialog open={business !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("project.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("project.deleteDescription", { name: business?.name ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteBusiness.isPending}>{t("common:cancel")}</AlertDialogCancel>
          {/* A plain button (not AlertDialogAction) so the dialog stays open until the request settles. */}
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteBusiness.isPending}>
            {deleteBusiness.isPending ? t("project.deletingEllipsis") : t("project.deleteConfirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
