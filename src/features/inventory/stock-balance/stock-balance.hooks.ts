import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
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
