"use client";

import * as React from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { FileText, Download, Upload, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyBusinesses } from "@/hooks/use-businesses";
import { useDownloadDocument, useUploadDocument } from "@/hooks/use-documents";
import { documentsApi } from "@/lib/api/documents";
import { formatDate } from "@/lib/utils/format";
import { DOCUMENT_CATEGORIES, documentCategoryKey, documentVisibilityKey } from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

/** Mirrors the backend's allowed types (documents.service.ts ALLOWED_MIME_TYPES). */
const ACCEPTED_FILES = ".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.xlsx,.docx,.zip";

export default function DocumentsPage() {
  const { t, i18n } = useTranslation("documents");
  const locale = i18n.language as Locale;
  const {
    data: businesses = [],
    isLoading: businessesLoading,
    isError: businessesError,
    refetch: refetchBusinesses,
  } = useMyBusinesses();

  const documentQueries = useQueries({
    queries: businesses.map((b) => ({
      queryKey: ["business", b.id, "documents"],
      queryFn: () => documentsApi.listForBusiness(b.id),
    })),
  });

  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>();
  const businessId = selectedBusinessId ?? businesses[0]?.id ?? "";
  const [category, setCategory] = React.useState("OTHER");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const upload = useUploadDocument(businessId);
  const download = useDownloadDocument();

  const isLoading = businessesLoading || documentQueries.some((q) => q.isLoading);
  const documentsError = documentQueries.some((q) => q.isError);
  const documents = documentQueries
    .flatMap((q) => q.data ?? [])
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // The only things the backend needs to accept an upload: a business you own.
  // Anything that stops it is said out loud under the button, never a silent grey state.
  const blockedReason = businessesLoading
    ? null
    : businessesError
      ? t("upload.blockedLoadFailed")
      : businesses.length === 0
        ? t("upload.blockedNoBusiness")
        : null;
  const canUpload = !businessesLoading && !blockedReason && Boolean(businessId);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !businessId) return;
    upload.mutate({ file, category, visibility: "PRIVATE" });
  }

  function handleDownload(id: string) {
    download.mutate(id, {
      onSuccess: ({ url }) => window.open(url, "_blank", "noopener,noreferrer"),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        action={
          <Button
            size="sm"
            className="h-9 gap-1.5 font-semibold text-xs"
            disabled={!canUpload || upload.isPending}
            aria-describedby={blockedReason ? "upload-blocked-reason" : undefined}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            <span>{upload.isPending ? t("common:uploading") : t("uploadDocument")}</span>
          </Button>
        }
      />
      <input ref={fileInputRef} type="file" accept={ACCEPTED_FILES} className="hidden" onChange={handleFileSelected} />

      {blockedReason ? (
        <div
          id="upload-blocked-reason"
          role="status"
          className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{blockedReason}</p>
          {businessesError ? (
            <Button size="sm" variant="outline" onClick={() => refetchBusinesses()}>
              {t("common:tryAgain")}
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href="/dashboard/businesses/new">
                <Plus className="size-4" />
                {t("upload.addBusiness")}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        canUpload && (
          <div className="flex flex-wrap items-end gap-3">
            {businesses.length > 1 && (
              <label className="space-y-1 text-xs font-medium">
                <span>{t("upload.business")}</span>
                <Select value={businessId} onValueChange={setSelectedBusinessId}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            )}
            <label className="space-y-1 text-xs font-medium">
              <span>{t("upload.category")}</span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`category.${documentCategoryKey[c]}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <p className="pb-2 text-xs text-muted-foreground">{t("upload.allowedFiles")}</p>
          </div>
        )
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : businessesError ? null : documentsError ? (
        <ErrorState onRetry={() => documentQueries.forEach((q) => q.isError && q.refetch())} />
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
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-foreground">{doc.name}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {t("categoryLabel")}{" "}
                        <span className="font-medium text-foreground">
                          {t(`category.${documentCategoryKey[doc.category] ?? "other"}`)}
                        </span>{" "}
                        · {t("uploadedOn", { date: formatDate(doc.createdAt, locale) })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-sm border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      🔒 {t(`visibility.${documentVisibilityKey[doc.visibility] ?? "private"}`)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs"
                      disabled={download.isPending}
                      onClick={() => handleDownload(doc.id)}
                    >
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
