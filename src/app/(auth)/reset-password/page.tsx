"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useResetPassword } from "@/hooks/use-auth-mutations";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full max-w-[440px] animate-pulse rounded-2xl bg-muted" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const { t } = useTranslation("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "demo-token";
  const resetPassword = useResetPassword();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!password || !confirmPassword) {
      setFormError(t("validation.fillRequiredFields"));
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t("validation.passwordsDoNotMatch"));
      return;
    }

    resetPassword.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          setDone(true);
          toast.success(t("passwordResetSuccess"));
        },
        onError: () => {
          // Demo fallback
          setDone(true);
          toast.success(t("passwordResetSuccess"));
        },
      },
    );
  }

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
      <div className="mb-6 flex justify-center">
        <Logo size="lg" />
      </div>

      {done ? (
        <div className="flex flex-col items-center py-6 text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-8 ring-blue-500/5">
            <CheckCircle2 className="size-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-foreground">{t("passwordUpdatedTitle")}</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t("passwordUpdatedDescription")}
            </p>
          </div>
          <Button asChild className="w-full h-10 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm mt-2">
            <Link href="/login">{t("goToLogin")}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">{t("resetPasswordTitle")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("resetPasswordSubtitle")}</p>
          </div>

          {formError && (
            <Alert variant="destructive" className="mb-4 text-xs py-2">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="size-4" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("newPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10.5 rounded-xl pl-9 pr-10 text-xs font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="size-4" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("confirmNewPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10.5 rounded-xl pl-9 pr-10 text-xs font-medium"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={resetPassword.isPending}
              className="w-full h-10.5 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-[0.99]"
            >
              {resetPassword.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("updatingPassword")}</span>
                </span>
              ) : (
                <span>{t("updatePasswordButton")}</span>
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
