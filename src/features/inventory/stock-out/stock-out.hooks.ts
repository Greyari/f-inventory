import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { stockOutApi } from "./stock-out.api";
import type { ListParams } from "@/types/api.types";

const KEY = "stock-out";

export function useStockOuts(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => stockOutApi.list(params),
  });
}

export function useStockOutDetail(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => stockOutApi.detail(id as string),
    enabled: !!id,
  });
}

export function useCreateStockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockOutApi.create,
    onSuccess: () => {
      toast.success("Barang keluar berhasil dicatat");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["stock-lot-balance"] });
    },
    onError: (error) => {
      // Backend balikin pesan spesifik kalau stok gak cukup (422)
      const message = isAxiosError(error) ? error.response?.data?.message : null;
      toast.error(message || "Gagal mencatat barang keluar");
    },
  });
}

export function useDeleteStockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockOutApi.remove,
    onSuccess: () => {
      toast.success("Data barang keluar berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["stock-lot-balance"] });
    },
    onError: () => toast.error("Gagal menghapus data"),
  });
}
