import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create user")),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userApi.update(id, payload),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update user")),
  });
}

export function useSetActiveStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userApi.setActiveStatus(id, isActive),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error, variables) => {
      toast.error(
        getErrorMessage(error, variables.isActive ? "Failed to activate user" : "Failed to deactivate user")
      );
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.remove,
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete user")),
  });
}
