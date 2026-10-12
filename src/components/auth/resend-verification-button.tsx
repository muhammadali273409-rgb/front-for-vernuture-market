"use client";

import { MailCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResendVerification } from "@/hooks/use-auth-mutations";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

/**
 * "Resend verification email". The backend answers the same way whether or
 * not the account exists and sends at most one email per minute, so the
 * success text is deliberately generic.
 */
export function ResendVerificationButton({ email, className }: { email: string; className?: string }) {
  const { t } = useTranslation(["auth", "errors"]);
  const resend = useResendVerification();

  if (resend.isSuccess) {
    return (
      <p role="status" className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
        <MailCheck className="size-4 shrink-0" />
        {t("auth:verifyBanner.sent")}
      </p>
    );
  }

  return (
    <div className={className}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={resend.isPending || !email}
        onClick={() => resend.mutate(email)}
      >
        <RefreshCw className={resend.isPending ? "size-4 animate-spin" : "size-4"} />
        {resend.isPending ? t("auth:verifyBanner.sending") : t("auth:verifyBanner.resend")}
      </Button>
      {resend.isError && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {friendlyErrorMessage(resend.error, t)}
        </p>
      )}
    </div>
  );
}
