import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { profileApi } from "./profile.api";

export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to change password"));
    },
  });
}
