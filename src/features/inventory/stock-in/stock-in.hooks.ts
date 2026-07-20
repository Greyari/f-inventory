import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { stockInApi, type StockInPayload } from "./stock-in.api";
import type { ListParams } from "@/types/api.types";

const KEY = "stock-in";

function extractErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) ? (error.response?.data?.message ?? fallback) : fallback;
}

export function useStockIns(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => stockInApi.list(params),
  });
}

export function useStockInDetail(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => stockInApi.detail(id as string),
    enabled: !!id,
  });
}

export function useCreateStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockInApi.create,
    onSuccess: () => {
      toast.success("Barang masuk berhasil dicatat");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mencatat barang masuk")),
  });
}

export function useUpdateStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StockInPayload }) =>
      stockInApi.update(id, payload),
    onSuccess: (_data, variables) => {
      toast.success("Barang masuk berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui data")),
  });
}

export function useDeleteStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockInApi.remove,
    onSuccess: () => {
      toast.success("Data barang masuk berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus data")),
  });
}
