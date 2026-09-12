"use client";

import {
  ShieldCheck,
  Globe,
  DollarSign,
  UserCheck,
  Building,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verificationStatusKey } from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";

const VERIFICATION_STEPS = [
  { id: "identity", status: "VERIFIED", icon: UserCheck },
  { id: "entity", status: "VERIFIED", icon: Building },
  { id: "revenue", status: "VERIFIED", icon: DollarSign },
  { id: "domain", status: "VERIFIED", icon: Globe },
  { id: "traffic", status: "IN_REVIEW", icon: Activity },
] as const;

export default function VerificationPage() {
  const { t } = useTranslation("verification");

  return (
    <div className="space-y-6">
      <PageHeader title={t("page.title")} description={t("page.description")} />

      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{t("trustScore", { score: 98 })}</h3>
              <p className="text-xs text-muted-foreground">{t("trustScoreDescription")}</p>
            </div>
          </div>
          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1">
            {t("verifiedPartner")}
          </Badge>
        </div>
      </div>

      <Card className="border border-border/80 bg-card">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base font-semibold">{t("auditStagesTitle")}</CardTitle>
          <CardDescription className="text-xs">{t("auditStagesDescription")}</CardDescription>
        </CardHeader>

        <CardContent className="divide-y divide-border/60 p-0">
          {VERIFICATION_STEPS.map((step) => {
            const Icon = step.icon;
            const isVerified = step.status === "VERIFIED";

            return (
              <div key={step.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{t(`steps.${step.id}.title`)}</h4>
                    <p className="text-[11px] text-muted-foreground">{t(`steps.${step.id}.description`)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={isVerified ? "default" : "secondary"}
                    className={isVerified ? "bg-emerald-600 text-white font-semibold" : "font-semibold"}
                  >
                    {t(`status.${verificationStatusKey[step.status]}`)}
                    {isVerified ? " ✓" : ""}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
