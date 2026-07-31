import { apiClient } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import type { ApiSuccess } from "@/types/api.types";
import type { StockLot, Item, StockIn, StockOut } from "@/types/inventory.types";

export const stockLotApi = {
  list: async (search?: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockLot[]>>("/stock-lots", {
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
  balance: number;
  lots: StockLot[];
  stockIns: StockIn[];
  stockOuts: StockOut[];
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

// ---- Tambah Stok Langsung (Super Admin, tanpa lewat NPR->PO->DO) ----
export interface AddDirectStockPayload {
  itemId: string;
  projectRefId: string;
  costCentreId: string;
  costCodeId: string;
  qty: number;
  reason: string;
}

function extractErrorMessage(error: unknown, fallback: string) {
  return isAxiosError(error) ? (error.response?.data?.message ?? fallback) : fallback;
}

export const stockLotAdjustmentApi = {
  addDirect: async (payload: AddDirectStockPayload) => {
    const { data } = await apiClient.post<ApiSuccess<StockLot>>("/stock-lots/direct-add", payload);
    return data.data;
  },
};

export function useAddDirectStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stockLotAdjustmentApi.addDirect,
    onSuccess: () => {
      toast.success("Stok berhasil ditambahkan langsung");
      qc.invalidateQueries({ queryKey: ["stock-lots"] });
      qc.invalidateQueries({ queryKey: ["item-stock-history"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, "Gagal menambahkan stok")),
  });
}
