import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { stockInApi, type MarkStockInPoItemPayload, type OverrideUpdateStockInPayload, type StockInPayload } from "./stock-in.api";
import type { ListParams } from "@/types/api.types";

const KEY = "stock-in";
const ACTIVITY_KEY = "stock-in-activity-logs";

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
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to record PR")),
  });
}

export function useUpdateStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StockInPayload }) => stockInApi.update(id, payload),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update data")),
  });
}

export function useMarkStockInPo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items, poPhoto }: { id: string; items: MarkStockInPoItemPayload[]; poPhoto: File }) =>
      stockInApi.markAsPo(id, items, poPhoto),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to change status to PO")),
  });
}

export function useMarkStockInDo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, doPhoto }: { id: string; doPhoto: File }) => stockInApi.markAsDo(id, doPhoto),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to change status to DO")),
  });
}

export function useOverrideUpdateStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OverrideUpdateStockInPayload }) =>
      stockInApi.overrideUpdate(id, payload),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, variables.id] });
      qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to save changes")),
  });
}

export function useDeleteStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockInApi.remove,
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["available-batches"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete data")),
  });
}
