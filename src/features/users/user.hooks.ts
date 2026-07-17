import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { userApi, type UpdateUserPayload } from "./user.api";
import type { ListParams } from "@/types/api.types";

const KEY = "users";

export function useUsers(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => userApi.list(params),
  });
}

export function useCreateUser() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      toast.success(t("users.toastCreated"));
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error(t("users.toastCreateFailed")),
  });
}

export function useUpdateUser() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userApi.update(id, payload),
    onSuccess: () => {
      toast.success(t("users.toastUpdated"));
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error(t("users.toastUpdateFailed")),
  });
}

export function useSetActiveStatus() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userApi.setActiveStatus(id, isActive),
    onSuccess: (_data, variables) => {
      toast.success(variables.isActive ? t("users.toastActivated") : t("users.toastDeactivated"));
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (_err, variables) => {
      toast.error(variables.isActive ? t("users.toastActivateFailed") : t("users.toastDeactivateFailed"));
    },
  });
}

export function useDeleteUser() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      toast.success(t("users.toastDeleted"));
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error(t("users.toastDeleteFailed")),
  });
}