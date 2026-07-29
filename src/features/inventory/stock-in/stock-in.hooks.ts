import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { stockInApi, type MarkStockInDoItemPayload, type StockInPayload } from "./stock-in.api";
import type { ListParams } from "@/types/api.types";

const KEY = "stock-in";

function extractErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) ? (error.response?.data?.message ?? fallback) : fallback;
}

export function useStockIns(params: ListParams & { status?: string }) {
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
      toast.success("NPR berhasil dicatat");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mencatat NPR")),
  });
}

export function useUpdateStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StockInPayload }) => stockInApi.update(id, payload),
    onSuccess: (_data, variables) => {
      toast.success("Data berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui data")),
  });
}

export function useMarkStockInDo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: MarkStockInDoItemPayload[] }) => stockInApi.markAsDo(id, items),
    onSuccess: (_data, variables) => {
      toast.success("Status berhasil diubah menjadi DO, stok sudah ditambahkan");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mengubah status ke DO")),
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
