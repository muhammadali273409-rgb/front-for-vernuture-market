"use client";

import type { ComponentType } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Globe,
  DollarSign,
  UserCheck,
  Building,
  Activity,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verificationTypeKey, verificationStatusKey } from "@/lib/utils/labels";
import { verificationScore } from "@/lib/utils/metrics";
import { useTranslation } from "@/i18n/client";
import type { ListingVerificationBadge, VerificationType } from "@/types/domain";

const ALL_VERIFICATION_TYPES: { type: VerificationType; icon: ComponentType<{ className?: string }> }[] = [
  { type: "IDENTITY", icon: UserCheck },
  { type: "BUSINESS", icon: Building },
  { type: "OWNERSHIP", icon: ClipboardCheck },
  { type: "REVENUE", icon: DollarSign },
  { type: "FINANCIAL", icon: FileCheck },
  { type: "DOMAIN", icon: Globe },
  { type: "TRAFFIC", icon: Activity },
];

export function TrustVerificationCenter({
  verifications = [],
}: {
  verifications?: ListingVerificationBadge[];
}) {
  const { t } = useTranslation("verification");
  const score = verificationScore(verifications);

  return (
    <Card className="border border-border/80 bg-card">
      <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">{t("sixLayerAuditTitle")}</CardTitle>
          </div>
          <CardDescription className="text-xs">{t("sixLayerAuditDescription")}</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>{score !== null ? t("trustRating", { score }) : t("notYetVerified")}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_VERIFICATION_TYPES.map(({ type, icon: Icon }) => {
            const badge = verifications.find((v) => v.type === type);
            const status = badge?.status ?? null;
            const isVerified = status === "VERIFIED";
            const key = verificationTypeKey[type] ?? type;
            return (
              <div
                key={type}
                className="flex flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5 transition-colors hover:border-border"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex size-7 items-center justify-center rounded-md ${
                        isVerified
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isVerified
                          ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                          : "border-border text-[10px] font-semibold text-muted-foreground"
                      }
                    >
                      {isVerified
                        ? t("verifiedCheck")
                        : status
                          ? t(`status.${verificationStatusKey[status] ?? status}`)
                          : t("notSubmitted")}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">{t(`layers.${key}.title`)}</h4>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{t(`layers.${key}.description`)}</p>
                </div>

                <div className="mt-3 flex items-center justify-end border-t border-border/40 pt-2 text-[10px] text-muted-foreground font-mono">
                  {isVerified ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      {t("activeLabel")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {t("pendingLabel")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
