import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { purchasingApi } from "./purchasing.api";
import type { ListParams } from "@/types/api.types";
import type { Purchase } from "@/types/inventory.types";

const KEY = "purchases";

export function usePurchases(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => purchasingApi.list(params),
  });
}

export function usePurchaseDetail(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => purchasingApi.detail(id as string),
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Purchase>) => purchasingApi.create(payload),
    onSuccess: () => {
      toast.success("PR berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal membuat PR"),
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Purchase> }) =>
      purchasingApi.update(id, payload),
    onSuccess: (_data, variables) => {
      toast.success("PR berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: [KEY, variables.id] });
    },
    onError: () => toast.error("Gagal memperbarui PR"),
  });
}

export function useUpdatePurchaseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      name,
      rejectReason,
    }: {
      id: string;
      status: Purchase["status"];
      name?: string;
      rejectReason?: string;
    }) => purchasingApi.updateStatus(id, { status, name, rejectReason }),
    onSuccess: (_data, variables) => {
      toast.success("Status PR berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: [KEY, variables.id] });
    },
    onError: () => toast.error("Gagal memperbarui status PR"),
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchasingApi.remove(id),
    onSuccess: () => {
      toast.success("PR berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menghapus PR"),
  });
}
