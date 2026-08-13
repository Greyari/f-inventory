import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { assetApi, type AssetPayload } from "./asset.api";
import type { ListParams } from "@/types/api.types";

const KEY = "assets";

export function useAssets(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => assetApi.list(params),
  });
}

export function useAsset(id?: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => assetApi.detail(id as string),
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssetPayload) => assetApi.create(payload),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to add asset")),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AssetPayload> }) =>
      assetApi.update(id, payload),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update asset")),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetApi.remove(id),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete asset")),
  });
}
