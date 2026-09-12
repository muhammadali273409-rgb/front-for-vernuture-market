"use client";

import { useQueries } from "@tanstack/react-query";
import { FileText, Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBusinesses } from "@/hooks/use-businesses";
import { documentsApi } from "@/lib/api/documents";
import { formatDate } from "@/lib/utils/format";
import { documentCategoryKey, documentVisibilityKey } from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

export default function DocumentsPage() {
  const { t, i18n } = useTranslation("documents");
  const locale = i18n.language as Locale;
  const { data: businesses = [], isLoading: businessesLoading, isError: businessesError, refetch: refetchBusinesses } = useMyBusinesses();

  const documentQueries = useQueries({
    queries: businesses.map((b) => ({
      queryKey: ["business", b.id, "documents"],
      queryFn: () => documentsApi.listForBusiness(b.id),
      enabled: businesses.length > 0,
    })),
  });

  const isLoading = businessesLoading || documentQueries.some((q) => q.isLoading);
  const isError = businessesError || documentQueries.some((q) => q.isError);
  const documents = documentQueries.flatMap((q) => q.data ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        action={
          <Button size="sm" className="h-9 gap-1.5 font-semibold text-xs" disabled={businesses.length === 0}>
            <Upload className="size-3.5" />
            <span>{t("uploadDocument")}</span>
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetchBusinesses()} />
      ) : documents.length === 0 ? (
        <EmptyState icon={FileText} title={t("noDocumentsYet")} description={t("noDocumentsYetDescription")} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border border-border/80 bg-card p-4">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{t("totalFiles")}</span>
              <p className="font-mono text-xl font-bold text-foreground mt-0.5">
                {t("documentsCount", { count: documents.length })}
              </p>
              <span className="text-xs text-muted-foreground">{t("acrossAllDealRooms")}</span>
            </Card>
          </div>

          <Card className="border border-border/80 bg-card">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold">{t("dataRoomFilesPermissions")}</CardTitle>
              <CardDescription className="text-xs">{t("filesWatermarkedDescription")}</CardDescription>
            </CardHeader>

            <CardContent className="divide-y divide-border/60 p-0">
              {documents.map((doc) => (
                <div key={doc.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{doc.fileName}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {t("categoryLabel")}{" "}
                        <span className="font-medium text-foreground">
                          {t(`category.${documentCategoryKey[doc.category] ?? doc.category}`)}
                        </span>{" "}
                        · {t("versionNumber", { version: doc.version })} ·{" "}
                        {t("uploadedOn", { date: formatDate(doc.createdAt, locale) })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-sm border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      🔒 {t(`visibility.${documentVisibilityKey[doc.visibility] ?? doc.visibility}`)}
                    </span>
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                      <Download className="size-3.5" />
                      <span>{t("download")}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
