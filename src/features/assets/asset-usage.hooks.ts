import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { assetUsageApi, type AssetUsagePayload, type ReturnAssetPayload } from "./asset-usage.api";
import type { ListParams } from "@/types/api.types";

const KEY = "asset-usages";

function extractErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) ? (error.response?.data?.message ?? fallback) : fallback;
}

export function useAssetUsages(params: ListParams & { status?: string; assetId?: string }) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => assetUsageApi.list(params),
  });
}

export function useAssetUsageDetail(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => assetUsageApi.detail(id as string),
    enabled: !!id,
  });
}

export function useCheckoutAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssetUsagePayload) => assetUsageApi.checkout(payload),
    onSuccess: () => {
      toast.success("Pemakaian aset berhasil dicatat");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mencatat pemakaian aset")),
  });
}

export function useReturnAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnAssetPayload }) =>
      assetUsageApi.returnAsset(id, payload),
    onSuccess: (_data, variables) => {
      toast.success("Pengembalian aset berhasil dicatat");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal mencatat pengembalian aset")),
  });
}

export function useDeleteAssetUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetUsageApi.remove(id),
    onSuccess: () => {
      toast.success("Data pemakaian berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus data")),
  });
}
