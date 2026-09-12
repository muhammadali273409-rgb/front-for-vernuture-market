"use client";

import { BadgeCheck, Clock, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/client";
import { verificationStatusKey, verificationTypeKey } from "@/lib/utils/labels";
import type { ListingVerificationBadge } from "@/types/domain";

export function VerificationBadges({ verifications }: { verifications: ListingVerificationBadge[] }) {
  const { t } = useTranslation("verification");

  if (verifications.length === 0) {
    return (
      <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
        <ShieldQuestion className="size-3.5" />
        {t("noVerificationsYet")}
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {verifications.map((v) => (
        <Badge
          key={v.type}
          variant={v.status === "VERIFIED" ? "default" : "outline"}
          className="gap-1 font-normal"
        >
          {v.status === "VERIFIED" ? <BadgeCheck className="size-3.5" /> : <Clock className="size-3.5" />}
          {t(`types.${verificationTypeKey[v.type] ?? v.type}`)} ·{" "}
          {t(`status.${verificationStatusKey[v.status] ?? v.status}`)}
        </Badge>
      ))}
    </div>
  );
}
