import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { watchlistApi } from "@/lib/api/watchlist";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";
import { useCurrentUser } from "@/hooks/use-current-user";

export function useWatchlist() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.watchlist,
    queryFn: () => watchlistApi.list(),
    enabled: Boolean(user),
    retry: false,
  });
}

export function useToggleWatchlist() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["business", "errors"]);

  return useMutation<void, Error, { businessId: string; watching: boolean }, { previous?: import("@/types/domain").WatchlistItem[] }>({
    mutationFn: async ({ businessId, watching }) => {
      if (watching) {
        await watchlistApi.remove(businessId);
      } else {
        await watchlistApi.add(businessId);
      }
    },
    onMutate: async ({ businessId, watching }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.watchlist });
      const previous = queryClient.getQueryData<import("@/types/domain").WatchlistItem[]>(queryKeys.watchlist);
      queryClient.setQueryData<import("@/types/domain").WatchlistItem[]>(queryKeys.watchlist, (old) => {
        if (!old) return old;
        return watching ? old.filter((item) => item.businessId !== businessId) : old;
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.watchlist, context.previous);
      }
      toast.error(friendlyErrorMessage(error, t));
    },
    onSuccess: (_data, { watching }) => {
      toast.success(watching ? t("buyer.toastRemovedFromWatchlist") : t("buyer.toastAddedToWatchlist"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist });
    },
  });
}
