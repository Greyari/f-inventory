import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { stockInApi } from "./stock-in.api";
import type { ListParams } from "@/types/api.types";

const KEY = "stock-in";

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
    onError: () => toast.error("Gagal mencatat barang masuk"),
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
    onError: () => toast.error("Gagal menghapus data"),
  });
}
