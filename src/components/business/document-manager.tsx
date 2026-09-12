"use client";

import * as React from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBusinessDocuments,
  useDeleteDocument,
  useDownloadDocument,
  useUploadDocument,
} from "@/hooks/use-documents";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

const CATEGORIES = ["FINANCIAL", "LEGAL", "TECHNICAL", "MARKETING", "OPERATIONS", "OTHER"];

export function DocumentManager({ businessId }: { businessId: string }) {
  const { t, i18n } = useTranslation(["documents", "errors"]);
  const locale = i18n.language as Locale;
  const { data: documents = [], isLoading, isError, error, refetch } = useBusinessDocuments(businessId);
  const upload = useUploadDocument(businessId);
  const deleteDocument = useDeleteDocument(businessId);
  const download = useDownloadDocument();
  const [category, setCategory] = React.useState("OTHER");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    upload.mutate({ file, category, visibility: "PRIVATE" });
    event.target.value = "";
  }

  function handleDownload(id: string) {
    download.mutate(id, {
      onSuccess: (result) => window.open(result.url, "_blank", "noopener,noreferrer"),
      onError: (err) => toast.error(friendlyErrorMessage(err, t)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={upload.isPending}>
          <Upload className="size-4" />
          {upload.isPending ? t("common:uploading") : t("documents:uploadDocument")}
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t("documents:noDocumentsYet")}
          description={t("documents:noDocumentsYetDescription")}
        />
      ) : (
        <div className="divide-y rounded-md border">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.category} · {t("documents:uploadedOn", { date: formatDate(doc.createdAt, locale) })}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc.id)}
                  aria-label={t("documents:download")}
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteDocument.mutate(doc.id)}
                  aria-label={t("documents:delete")}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
