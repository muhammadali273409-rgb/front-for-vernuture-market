"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin, useLogout } from "@/hooks/use-auth-mutations";
import { useTranslation } from "@/i18n/client";

export function AdminLoginForm() {
  const { t } = useTranslation(["admin", "auth"] as const);
  const router = useRouter();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const isBusy = loginMutation.isPending || logoutMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.user.role !== "ADMIN") {
            // Real credentials, real account — just not an Admin. The
            // backend already authenticated them, so there's a live session
            // right now; the admin entry point must never leave a non-admin
            // signed in behind an "access denied" screen, so it's cleared
            // immediately rather than left ambiguous.
            logoutMutation.mutate(undefined, {
              onSettled: () => setError(t("admin:login.accessDenied")),
            });
            return;
          }
          router.push("/admin");
        },
        onError: () => {
          setError(t("admin:login.invalidCredentials"));
        },
      },
    );
  }

  return (
    <Card className="w-full max-w-sm border border-border/80 shadow-lg">
      <CardHeader className="items-center space-y-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <CardTitle className="text-lg font-bold">{t("admin:login.title")}</CardTitle>
        <CardDescription className="text-xs">{t("admin:login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="text-xs">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-xs">
              {t("auth:email")}
            </Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-xs">
              {t("auth:password")}
            </Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>
          <Button type="submit" disabled={isBusy} className="mt-2 h-9 w-full text-xs font-semibold">
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" />
                <span>{t("admin:login.signingIn")}</span>
              </span>
            ) : (
              t("auth:signIn")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
