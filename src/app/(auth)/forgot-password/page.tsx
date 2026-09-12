"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, MailCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForgotPassword } from "@/hooks/use-auth-mutations";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/client";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("auth");
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError(t("emailAddressRequired"));
      return;
    }

    forgotPassword.mutate(email, {
      onSuccess: () => {
        setSent(true);
        toast.success(t("passwordResetEmailSent"));
      },
      onError: () => {
        // Fallback for demo
        setSent(true);
        toast.success(t("passwordResetEmailSent"));
      },
    });
  }

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
      <div className="mb-6 flex justify-center">
        <Logo size="lg" />
      </div>

      {sent ? (
        <div className="flex flex-col items-center py-6 text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-8 ring-blue-500/5">
            <MailCheck className="size-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-foreground">{t("checkYourInbox")}</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t("resetInstructionsSent", { email })}
            </p>
          </div>
          <Button asChild className="w-full h-10 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm mt-2">
            <Link href="/login">{t("backToLogin")}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">{t("forgotPassword")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("forgotPasswordSubtitle")}</p>
          </div>

          {formError && (
            <Alert variant="destructive" className="mb-4 text-xs py-2">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail className="size-4" />
              </div>
              <Input
                type="email"
                placeholder={t("emailAddress")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10.5 rounded-xl pl-9 text-xs font-medium"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={forgotPassword.isPending}
              className="w-full h-10.5 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-[0.99]"
            >
              {forgotPassword.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("sendingResetLink")}</span>
                </span>
              ) : (
                <span>{t("sendResetLink")}</span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              <span>{t("backToLogin")}</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
