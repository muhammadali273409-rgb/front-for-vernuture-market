import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { offersApi, type CreateOfferInput } from "@/lib/api/offers";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

export function useMyOffers() {
  return useQuery({
    queryKey: queryKeys.offers,
    queryFn: () => offersApi.listMine(),
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: queryKeys.offer(id),
    queryFn: () => offersApi.getOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateOffer(businessId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["offers", "errors"]);
  return useMutation({
    mutationFn: (input: CreateOfferInput) => offersApi.create(businessId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers });
      toast.success(t("toast.submitted"));
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}

function useOfferAction(
  mutationFn: (id: string, input?: CreateOfferInput) => Promise<unknown>,
  successMessageKey: string,
) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["offers", "errors"]);
  return useMutation({
    mutationFn: (vars: { id: string; input?: CreateOfferInput }) => mutationFn(vars.id, vars.input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers });
      queryClient.invalidateQueries({ queryKey: queryKeys.offer(vars.id) });
      toast.success(t(successMessageKey));
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}

export function useCounterOffer() {
  return useOfferAction((id, input) => offersApi.counter(id, input!), "toast.countered");
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["offers", "errors"]);
  return useMutation({
    mutationFn: (id: string) => offersApi.accept(id),
    onSuccess: (deal, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers });
      queryClient.invalidateQueries({ queryKey: queryKeys.offer(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.deals });
      toast.success(t("toast.acceptedDealRoom"));
      return deal;
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}

export function useRejectOffer() {
  return useOfferAction((id) => offersApi.reject(id), "toast.rejected");
}

export function useWithdrawOffer() {
  return useOfferAction((id) => offersApi.withdraw(id), "toast.withdrawn");
}
