"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UpdateProfileInput } from "@/lib/api/users";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import type { CurrentUser } from "@/types/domain";
import { useTranslation } from "@/i18n/client";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["settings", "errors"]);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => usersApi.updateProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData<CurrentUser | null>(queryKeys.me, (old) =>
        old ? { ...old, profile } : old,
      );
      toast.success(t("toastProfileUpdated"));
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}
