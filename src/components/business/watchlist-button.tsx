"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToggleWatchlist, useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/client";

export function WatchlistButton({ businessId }: { businessId: string }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: watchlist = [] } = useWatchlist();
  const toggle = useToggleWatchlist();
  const watching = watchlist.some((item) => item.businessId === businessId);

  return (
    <Button
      variant={watching ? "default" : "outline"}
      onClick={() => {
        if (!user) {
          router.push(`/login?next=/marketplace`);
          return;
        }
        toggle.mutate({ businessId, watching });
      }}
      disabled={toggle.isPending}
    >
      <Heart className={cn("size-4", watching && "fill-current")} />
      {watching ? t("watching") : t("watchlist")}
    </Button>
  );
}
