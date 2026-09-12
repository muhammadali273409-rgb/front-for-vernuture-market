"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api/documents";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

export function useBusinessDocuments(businessId: string) {
  return useQuery({
    queryKey: ["business", businessId, "documents"],
    queryFn: () => documentsApi.listForBusiness(businessId),
    enabled: Boolean(businessId),
  });
}

export function useUploadDocument(businessId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["documents", "errors"]);
  return useMutation({
    mutationFn: ({
      file,
      category,
      visibility,
      dealId,
    }: {
      file: File;
      category?: string;
      visibility?: string;
      dealId?: string;
    }) => documentsApi.upload(businessId, file, { category, visibility, dealId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", businessId, "documents"] });
      toast.success(t("toastUploaded"));
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}

export function useDeleteDocument(businessId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["documents", "errors"]);
  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", businessId, "documents"] });
      toast.success(t("toastDeleted"));
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}

export function useDownloadDocument() {
  const { t } = useTranslation("errors");
  return useMutation({
    mutationFn: (id: string) => documentsApi.getDownloadUrl(id),
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}
