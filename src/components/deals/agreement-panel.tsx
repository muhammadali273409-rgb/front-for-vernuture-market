"use client";

import { CheckCircle2, Circle, ExternalLink, FilePlus2, FileSignature, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useOpenDocument } from "@/components/deals/due-diligence-panel";
import type { DealFlowMutations } from "@/hooks/use-deal-flow";
import { latestVersion, type DealSide } from "@/lib/deals/flow";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import { cn } from "@/lib/utils";
import type { Agreement, AgreementStatus, Deal } from "@/types/domain";

const STATUS_TONE: Record<AgreementStatus, string> = {
  DRAFT: "",
  PENDING_SIGNATURE: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PARTIALLY_SIGNED: "border-primary/40 bg-primary/10 text-primary",
  SIGNED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  VOID: "text-muted-foreground line-through",
};

interface AgreementPanelProps {
  deal: Deal;
  side: DealSide | null;
  viewerId: string | undefined;
  agreements: Agreement[];
  mutations: DealFlowMutations;
  onCreate: () => void;
  onAddVersion: (agreementId: string) => void;
}

export function AgreementPanel({
  deal,
  side,
  viewerId,
  agreements,
  mutations,
  onCreate,
  onAddVersion,
}: AgreementPanelProps) {
  const { t, i18n } = useTranslation("deals");
  const locale = i18n.language as Locale;
  const openDoc = useOpenDocument();
  const editable = deal.status === "AGREEMENT";
  const principals = deal.participants.filter((p) => p.role === "BUYER" || p.role === "SELLER");
  const sign = mutations.signAgreement;

  return (
    <Card className="border border-border/80 bg-card">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{t("flow.agreement.title")}</CardTitle>
            <CardDescription className="text-xs">{t("flow.agreement.description")}</CardDescription>
          </div>
          {editable && side && agreements.every((a) => a.status === "VOID") && (
            <Button size="sm" onClick={onCreate}>
              <FilePlus2 className="size-3.5" />
              {t("flow.action.createAgreement")}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {agreements.length === 0 ? (
          <EmptyState
            icon={FileSignature}
            title={t("flow.agreement.emptyTitle")}
            description={editable ? t("flow.agreement.emptyActive") : t("flow.agreement.emptyLater")}
          />
        ) : (
          agreements.map((agreement) => {
            const latest = latestVersion(agreement);
            const versions = [...(agreement.versions ?? [])].sort((a, b) => b.version - a.version);
            const iSigned = latest?.signatures.some((s) => s.userId === viewerId) ?? false;
            const canSign =
              editable && side !== null && latest !== undefined && !iSigned && agreement.status !== "SIGNED";
            const canAddVersion = editable && side !== null && agreement.status !== "SIGNED" && agreement.status !== "VOID";

            return (
              <div key={agreement.id} className="space-y-3 border-b border-border/60 p-4 last:border-b-0" data-testid="agreement">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">{agreement.title}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      {t("flow.agreement.createdOn", { date: formatDate(agreement.createdAt, locale) })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("w-fit text-[10px] font-semibold", STATUS_TONE[agreement.status])}
                    data-testid="agreement-status"
                  >
                    {t(`flow.agreementStatus.${agreement.status}`)}
                  </Badge>
                </div>

                {agreement.reviewRequired && agreement.status !== "SIGNED" && (
                  <p className="text-[11px] text-muted-foreground">{t("flow.agreement.reviewNotice")}</p>
                )}

                {versions.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border/80 p-3 text-xs text-muted-foreground">
                    {t("flow.agreement.noVersions")}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {versions.map((version) => {
                      const isLatest = version.id === latest?.id;
                      const signedBy = new Map(version.signatures.map((s) => [s.userId, s.signedAt]));
                      return (
                        <li
                          key={version.id}
                          className={cn(
                            "rounded-md border p-3 text-xs",
                            isLatest ? "border-border" : "border-border/50 opacity-70",
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold">
                              {t("flow.agreement.version", { n: version.version })}
                              {isLatest && (
                                <Badge variant="secondary" className="ml-2 text-[10px]">
                                  {t("flow.agreement.latest")}
                                </Badge>
                              )}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDateTime(version.createdAt, locale)}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {version.documentId && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1 px-2 text-xs"
                                disabled={openDoc.isPending}
                                onClick={() => openDoc.open(version.documentId!)}
                              >
                                <FileText className="size-3.5" />
                                {t("flow.agreement.openFile")}
                              </Button>
                            )}
                            {version.contentUrl && (
                              <Button asChild size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs">
                                <a href={version.contentUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="size-3.5" />
                                  {t("flow.agreement.openLink")}
                                </a>
                              </Button>
                            )}
                            {!version.documentId && !version.contentUrl && (
                              <span className="text-[11px] text-muted-foreground">{t("flow.agreement.noFile")}</span>
                            )}
                            {version.contentHash && (
                              <span className="font-mono text-[10px] text-muted-foreground" title={version.contentHash}>
                                SHA-256 {version.contentHash.slice(0, 12)}…
                              </span>
                            )}
                          </div>

                          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                            {principals.map((p) => {
                              const signedAt = signedBy.get(p.userId);
                              return (
                                <li key={p.userId} className="flex items-center gap-1.5" data-testid="agreement-signer">
                                  {signedAt ? (
                                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Circle className="size-3.5 text-muted-foreground" />
                                  )}
                                  <span className="font-medium">{t(`flow.actor.${p.role}`)}</span>
                                  <span className="text-muted-foreground">
                                    {signedAt
                                      ? t("flow.agreement.signedOn", { date: formatDateTime(signedAt, locale) })
                                      : t("flow.agreement.notSigned")}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {(canSign || canAddVersion) && (
                  <div className="flex flex-wrap gap-2">
                    {canSign && latest && (
                      <Button
                        size="sm"
                        disabled={sign.isPending}
                        onClick={() => sign.mutate({ agreementId: agreement.id, versionId: latest.id })}
                        data-testid="agreement-sign"
                      >
                        <FileSignature className="size-3.5" />
                        {t("flow.action.signAgreement")}
                      </Button>
                    )}
                    {canAddVersion && (
                      <Button size="sm" variant="outline" onClick={() => onAddVersion(agreement.id)}>
                        <FilePlus2 className="size-3.5" />
                        {latest ? t("flow.agreement.newVersion") : t("flow.action.addAgreementVersion")}
                      </Button>
                    )}
                  </div>
                )}
                {editable && iSigned && agreement.status !== "SIGNED" && (
                  <p className="text-xs text-muted-foreground">{t("flow.agreement.youSigned")}</p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
