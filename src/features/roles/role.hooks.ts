import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { roleApi, permissionApi } from "./role.api";
import type { ListParams } from "@/types/api.types";

const KEY = "roles";

export function useRoles(params: ListParams = {}) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => roleApi.list(params),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: permissionApi.list,
    staleTime: 5 * 60 * 1000, // daftar permission jarang berubah, gak perlu sering re-fetch
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roleApi.create,
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create role")),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; description?: string; permissionIds?: string[] };
    }) => roleApi.update(id, payload),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update role")),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roleApi.remove,
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete role")),
  });
}
