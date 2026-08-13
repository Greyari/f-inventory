import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { assetUsageApi, type AssetUsagePayload, type ReturnAssetPayload } from "./asset-usage.api";
import type { ListParams } from "@/types/api.types";

const KEY = "asset-usages";

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
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to record asset usage")),
  });
}

export function useReturnAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnAssetPayload }) =>
      assetUsageApi.returnAsset(id, payload),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to record asset return")),
  });
}

export function useDeleteAssetUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetUsageApi.remove(id),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete record")),
  });
}
