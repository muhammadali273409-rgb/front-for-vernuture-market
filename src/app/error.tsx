"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

/**
 * True when the failure is the backend being down, asleep (Render free plan
 * cold start) or erroring. In production, errors thrown during server
 * rendering reach the browser with their message stripped and only a
 * `digest` — on this app those are almost always failed backend calls.
 */
function isServerFailure(error: Error & { digest?: string }): boolean {
  if (error instanceof ApiError) return error.status >= 500 || error.code === "NETWORK_ERROR";
  if (error.name === "TypeError" || error.name === "TimeoutError" || error.name === "AbortError") return true;
  return Boolean(error.digest);
}

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { t } = useTranslation("common");

  useEffect(() => {
    console.error("[RootErrorBoundary]", error.digest ? `digest=${error.digest}` : "", error);
  }, [error]);

  const reason =
    process.env.NODE_ENV === "development"
      ? error.message
      : isServerFailure(error)
        ? t("errors:SERVER_UNREACHABLE")
        : friendlyErrorMessage(error, t);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("somethingWentWrong")}</h1>
        <p className="text-sm text-muted-foreground max-w-sm">{reason}</p>
        {error.digest && <p className="text-xs text-muted-foreground/70">#{error.digest}</p>}
      </div>
      <Button onClick={retry}>{t("tryAgain")}</Button>
    </div>
  );
}
