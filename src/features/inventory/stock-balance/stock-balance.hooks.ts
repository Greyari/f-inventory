import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { ApiSuccess } from "@/types/api.types";
import type { StockLot } from "@/types/inventory.types";

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
