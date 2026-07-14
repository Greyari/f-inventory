import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
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

function extractErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) ? (error.response?.data?.message ?? fallback) : fallback;
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roleApi.create,
    onSuccess: () => {
      toast.success("Role berhasil dibuat");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal membuat role")),
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
    onSuccess: () => {
      toast.success("Role berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui role")),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: roleApi.remove,
    onSuccess: () => {
      toast.success("Role berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus role")),
  });
}
