"use client";

import { MailWarning } from "lucide-react";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";
import { useTranslation } from "@/i18n/client";
import type { CurrentUser } from "@/types/domain";

/** Shown across the dashboard until the account's email is verified. */
export function VerifyEmailBanner({ user }: { user: CurrentUser }) {
  const { t } = useTranslation("auth");
  if (user.emailVerifiedAt) return null;

  return (
    <div
      role="status"
      className="flex flex-col gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
    >
      <p className="flex items-start gap-2">
        <MailWarning className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>{t("verifyBanner.text", { email: user.email })}</span>
      </p>
      <ResendVerificationButton email={user.email} className="shrink-0" />
    </div>
  );
}
