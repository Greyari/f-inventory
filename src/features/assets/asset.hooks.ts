import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { assetApi, type AssetPayload } from "./asset.api";
import type { ListParams } from "@/types/api.types";

const KEY = "assets";

function extractErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) ? (error.response?.data?.message ?? fallback) : fallback;
}

export function useAssets(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => assetApi.list(params),
  });
}

export function useAssetSummary() {
  return useQuery({
    queryKey: [KEY, "summary"],
    queryFn: assetApi.summary,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssetPayload) => assetApi.create(payload),
    onSuccess: () => {
      toast.success("Aset berhasil ditambahkan");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menambahkan aset")),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AssetPayload> }) =>
      assetApi.update(id, payload),
    onSuccess: () => {
      toast.success("Aset berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal memperbarui aset")),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetApi.remove(id),
    onSuccess: () => {
      toast.success("Aset berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menghapus aset")),
  });
}
