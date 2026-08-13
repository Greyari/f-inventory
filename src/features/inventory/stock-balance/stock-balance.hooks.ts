import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import type { ApiSuccess } from "@/types/api.types";
import type {
  StockLotSummary,
  StockBatch,
  StockBatchAdjustmentLog,
  Item,
  StockIn,
  StockOut,
} from "@/types/inventory.types";

export const stockLotApi = {
  list: async (search?: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockLotSummary[]>>("/stock-lots", {
      params: { search },
    });
    return data.data;
  },
};

export function useStockLots(search?: string) {
  return useQuery({
    queryKey: ["stock-lots", search],
    queryFn: () => stockLotApi.list(search),
  });
}

export interface ItemStockHistory {
  item: Item;
  totalIn: number;
  totalOut: number;
  totalManualAdjustment: number;
  balance: number;
  batches: StockBatch[];
  stockIns: StockIn[];
  stockOuts: StockOut[];
  adjustmentLogs: StockBatchAdjustmentLog[];
}

export const itemHistoryApi = {
  get: async (itemId: string) => {
    const { data } = await apiClient.get<ApiSuccess<ItemStockHistory>>(`/items/${itemId}/history`);
    return data.data;
  },
};

export function useItemStockHistory(itemId?: string) {
  return useQuery({
    queryKey: ["item-stock-history", itemId],
    queryFn: () => itemHistoryApi.get(itemId as string),
    enabled: !!itemId,
  });
}

function invalidateStockQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["stock-lots"] });
  qc.invalidateQueries({ queryKey: ["item-stock-history"] });
  qc.invalidateQueries({ queryKey: ["available-batches"] });
}

// ---- Tambah Stok Langsung (Super Admin, tanpa lewat PR->PO->DO) ----
export interface AddDirectStockPayload {
  itemId: string;
  projectRefId: string;
  costCentreId: string;
  costCodeId: string;
  // Wajib — inilah yang bedain batch ini "punya project mana"
  projectName: string;
  qty: number;
  reason: string;
}

export const stockLotAdjustmentApi = {
  addDirect: async (payload: AddDirectStockPayload) => {
    const { data } = await apiClient.post<ApiSuccess<StockBatch>>("/stock-lots/direct-add", payload);
    return data;
  },
  adjust: async (stockBatchId: string, payload: { newQtyRemaining: number; reason: string }) => {
    const { data } = await apiClient.patch<ApiSuccess<StockBatch>>(`/stock-lots/${stockBatchId}/adjust`, payload);
    return data;
  },
};

export function useAddDirectStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockLotAdjustmentApi.addDirect,
    onSuccess: (result) => {
      toast.success(result.message);
      invalidateStockQueries(qc);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to add stock")),
  });
}

// ---- Koreksi Saldo Batch (Super Admin) ----
export function useAdjustStockLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      stockBatchId,
      newQtyRemaining,
      reason,
    }: {
      stockBatchId: string;
      newQtyRemaining: number;
      reason: string;
    }) => stockLotAdjustmentApi.adjust(stockBatchId, { newQtyRemaining, reason }),
    onSuccess: (result) => {
      toast.success(result.message);
      invalidateStockQueries(qc);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to correct batch balance")),
  });
}
