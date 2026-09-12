"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/hooks/use-auth-mutations";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const { t } = useTranslation(["auth", "errors"]);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verifyEmail = useVerifyEmail();
  const attempted = React.useRef(false);

  React.useEffect(() => {
    if (token && !attempted.current) {
      attempted.current = true;
      verifyEmail.mutate(token);
    }
  }, [token, verifyEmail]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth:emailVerification")}</CardTitle>
        <CardDescription>{t("auth:verifyingAccountDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
        {!token ? (
          <>
            <XCircle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{t("auth:missingVerificationToken")}</p>
          </>
        ) : verifyEmail.isPending ? (
          <>
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("auth:verifyingEmail")}</p>
          </>
        ) : verifyEmail.isSuccess ? (
          <>
            <CheckCircle2 className="size-8 text-primary" />
            <p className="text-sm text-muted-foreground">{t("auth:emailVerified")}</p>
            <Button asChild className="mt-2">
              <Link href="/login">{t("auth:login")}</Link>
            </Button>
          </>
        ) : verifyEmail.isError ? (
          <>
            <XCircle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{friendlyErrorMessage(verifyEmail.error, t)}</p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
