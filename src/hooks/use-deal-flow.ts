"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { agreementsApi } from "@/lib/api/agreements";
import { dealsApi } from "@/lib/api/deals";
import { documentsApi } from "@/lib/api/documents";
import { dueDiligenceApi, type CreateDueDiligenceRequestInput } from "@/lib/api/due-diligence";
import { transactionsApi } from "@/lib/api/transactions";
import { friendlyErrorMessage } from "@/lib/api/error";
import { queryKeys } from "@/lib/query/keys";
import { useTranslation } from "@/i18n/client";
import type { Deal, DueDiligenceStatus } from "@/types/domain";

export function useAgreements(dealId: string) {
  return useQuery({
    queryKey: queryKeys.agreements(dealId),
    queryFn: () => agreementsApi.list(dealId),
    enabled: Boolean(dealId),
  });
}

/** Only fetched once the deal can have a payment — earlier it would always be null. */
export function useDealTransaction(dealId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.transaction(dealId),
    queryFn: () => transactionsApi.getOne(dealId),
    enabled: Boolean(dealId) && enabled,
  });
}

export function usePaymentConfig() {
  return useQuery({
    queryKey: queryKeys.paymentConfig,
    queryFn: () => transactionsApi.config(),
    staleTime: 10 * 60 * 1000,
  });
}

/** SHA-256 hex of a file, computed in the browser. */
export async function sha256Hex(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Every write the deal room can make. Each one refreshes the whole deal
 * (status, DD items, agreements, payment, documents) on success and shows
 * the backend's real reason on failure.
 */
export function useDealFlowMutations(deal: Pick<Deal, "id" | "businessId">) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["deals", "errors"]);

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.deals }),
      queryClient.invalidateQueries({ queryKey: ["business", deal.businessId, "documents"] }),
    ]);

  function action<TInput = void, TResult = unknown>(toastKey: string, fn: (input: TInput) => Promise<TResult>) {
    return {
      mutationFn: fn,
      onSuccess: async () => {
        await refresh();
        toast.success(t(`flow.toast.${toastKey}`));
      },
      onError: (error: unknown) => {
        toast.error(friendlyErrorMessage(error, t));
        // A stale page is the usual cause of a state conflict — show the truth.
        void refresh();
      },
    };
  }

  /** Uploads into the deal so both parties can open it. */
  const uploadDealFile = (file: File, category: string) =>
    documentsApi.upload(deal.businessId, file, {
      dealId: deal.id,
      category,
      visibility: "DEAL_PARTICIPANTS",
    });

  return {
    startNda: useMutation(action("ndaStarted", () => dealsApi.updateStatus(deal.id, "NDA"))),
    signNda: useMutation(action("ndaSigned", () => dealsApi.signNda(deal.id))),
    cancel: useMutation(action("cancelled", () => dealsApi.updateStatus(deal.id, "CANCELLED"))),

    createDueDiligenceRequest: useMutation(
      action("ddRequested", (input: CreateDueDiligenceRequestInput) => dueDiligenceApi.create(deal.id, input)),
    ),
    answerDueDiligenceItem: useMutation(
      action("ddAnswered", async (input: { itemId: string; response?: string; file?: File | null }) => {
        const document = input.file ? await uploadDealFile(input.file, "OTHER") : undefined;
        return dueDiligenceApi.updateItem(deal.id, input.itemId, {
          status: "UPLOADED",
          response: input.response?.trim() || undefined,
          documentId: document?.id,
        });
      }),
    ),
    reviewDueDiligenceItem: useMutation(
      action("ddReviewed", (input: { itemId: string; status: DueDiligenceStatus }) =>
        dueDiligenceApi.updateItem(deal.id, input.itemId, { status: input.status }),
      ),
    ),
    closeDueDiligence: useMutation(action("ddClosed", () => dealsApi.updateStatus(deal.id, "AGREEMENT"))),

    createAgreement: useMutation(
      action("agreementCreated", (title: string) => agreementsApi.create(deal.id, { title })),
    ),
    addAgreementVersion: useMutation(
      action(
        "versionAdded",
        async (input: { agreementId: string; file?: File | null; contentUrl?: string }) => {
          if (input.file) {
            const [document, contentHash] = await Promise.all([
              uploadDealFile(input.file, "LEGAL"),
              sha256Hex(input.file),
            ]);
            return agreementsApi.addVersion(deal.id, input.agreementId, {
              documentId: document.id,
              contentHash,
              contentUrl: input.contentUrl || undefined,
            });
          }
          return agreementsApi.addVersion(deal.id, input.agreementId, { contentUrl: input.contentUrl });
        },
      ),
    ),
    signAgreement: useMutation(
      action("agreementSigned", (input: { agreementId: string; versionId: string }) =>
        agreementsApi.sign(deal.id, input.agreementId, input.versionId),
      ),
    ),

    markPaid: useMutation(action("markedPaid", (reference?: string) => transactionsApi.markPaid(deal.id, reference))),
    payByCard: useMutation({
      mutationFn: () => transactionsApi.create(deal.id),
      onSuccess: (transaction) => {
        if (transaction.checkoutUrl) window.location.assign(transaction.checkoutUrl);
        else void refresh();
      },
      onError: (error: unknown) => toast.error(friendlyErrorMessage(error, t)),
    }),

    confirmTransfer: useMutation(action("transferConfirmed", () => dealsApi.confirmTransfer(deal.id))),
    confirmReceipt: useMutation(action("receiptConfirmed", () => dealsApi.confirmReceipt(deal.id))),
  };
}

export type DealFlowMutations = ReturnType<typeof useDealFlowMutations>;
