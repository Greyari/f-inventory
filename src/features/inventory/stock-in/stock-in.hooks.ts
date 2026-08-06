import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { stockInApi, type MarkStockInPoItemPayload, type OverrideUpdateStockInPayload, type StockInPayload } from "./stock-in.api";
import type { ListParams } from "@/types/api.types";

const KEY = "stock-in";
const ACTIVITY_KEY = "stock-in-activity-logs";

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

export function useStockInActivityLogs(id?: string) {
  return useQuery({
    queryKey: [ACTIVITY_KEY, id],
    queryFn: () => stockInApi.activityLogs(id as string),
    enabled: !!id,
  });
}

export function useCreateStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockInApi.create,
    onSuccess: () => {
      toast.success("PR berhasil dicatat");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mencatat PR")),
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
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui data")),
  });
}

export function useMarkStockInPo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items, poPhoto }: { id: string; items: MarkStockInPoItemPayload[]; poPhoto: File }) =>
      stockInApi.markAsPo(id, items, poPhoto),
    onSuccess: (_data, variables) => {
      toast.success("Status berhasil diubah menjadi PO");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mengubah status ke PO")),
  });
}

export function useMarkStockInDo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, doPhoto }: { id: string; doPhoto: File }) => stockInApi.markAsDo(id, doPhoto),
    onSuccess: (_data, variables) => {
      toast.success("Status berhasil diubah menjadi DO, stok sudah ditambahkan");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mengubah status ke DO")),
  });
}

export function useOverrideUpdateStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OverrideUpdateStockInPayload }) =>
      stockInApi.overrideUpdate(id, payload),
    onSuccess: (_data, variables) => {
      toast.success("Data berhasil diperbarui (edit Super Admin)");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menyimpan perubahan")),
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
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus data")),
  });
}