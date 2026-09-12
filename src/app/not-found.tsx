import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";

export default async function NotFound() {
  const t = await getT("errors");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Compass className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="text-sm text-muted-foreground max-w-sm">{t("notFoundDescription")}</p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/">{t("goHome")}</Link>
        </Button>
        <Button asChild>
          <Link href="/marketplace">{t("browseMarketplace")}</Link>
        </Button>
      </div>
    </div>
  );
}
