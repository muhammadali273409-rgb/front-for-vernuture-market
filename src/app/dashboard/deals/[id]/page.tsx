"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { DealRoomView } from "@/components/deals/deal-room-view";
import { useDeal } from "@/hooks/use-deals";
import { useTranslation } from "@/i18n/client";

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: deal, isLoading, isError, refetch } = useDeal(id);
  const { t } = useTranslation("deals");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
          <Link href="/dashboard/deals">
            <ArrowLeft className="size-3.5" />
            <span>{t("backToDealRooms")}</span>
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !deal ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DealRoomView deal={deal} />
      )}
    </div>
  );
}
