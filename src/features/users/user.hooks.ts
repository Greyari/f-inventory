import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userApi } from "./user.api";
import type { ListParams } from "@/types/api.types";
import type { User } from "@/types/auth.types";

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
    onSuccess: () => {
      toast.success("User berhasil ditambahkan");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menambahkan user"),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      userApi.update(id, payload),
    onSuccess: () => {
      toast.success("User berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal memperbarui user"),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: userApi.resetPassword,
    onSuccess: (data) => {
      toast.success(`Password baru: ${data.temporaryPassword}`, { duration: 10000 });
    },
    onError: () => toast.error("Gagal reset password"),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      toast.success("User berhasil dinonaktifkan");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menonaktifkan user"),
  });
}
