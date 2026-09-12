"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { useTranslation } from "@/i18n/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
  const { t } = useTranslation("auth");
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[440px] p-0 border-none bg-transparent shadow-2xl">
        <DialogTitle className="sr-only">{t("authentication")}</DialogTitle>
        <AuthFormCard
          initialTab={initialTab}
          isModal={true}
          onClose={onClose}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
