import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { profileApi } from "./profile.api";

function getErrorMessage(error: unknown, fallback: string): string {
  return isAxiosError(error) ? (error.response?.data?.message ?? fallback) : fallback;
}

export function useChangePassword() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success(t("profile.toastPasswordChanged"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("profile.toastPasswordChangeFailed")));
    },
  });
}
