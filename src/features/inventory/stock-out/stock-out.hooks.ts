import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { stockOutApi, type StockOutPayload, type UpdateStockOutPayload } from "./stock-out.api";
import type { ListParams } from "@/types/api.types";

const KEY = "stock-out";
const ACTIVITY_KEY = "stock-out-activity-logs";

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

export function useStockOutActivityLogs(id?: string) {
  return useQuery({
    queryKey: [ACTIVITY_KEY, id],
    queryFn: () => stockOutApi.activityLogs(id as string),
    enabled: !!id,
  });
}

export function useCreateStockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockOutPayload) => stockOutApi.create(payload),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to record stock out")),
  });
}

export function useUpdateStockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStockOutPayload }) =>
      stockOutApi.update(id, payload),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update data")),
  });
}

export function useDeleteStockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockOutApi.remove,
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete data")),
  });
}
