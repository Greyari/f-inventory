import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { ApiSuccess } from "@/types/api.types";
import type { StockBalance } from "@/types/inventory.types";

export const stockBalanceApi = {
  summary: async (search?: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockBalance[]>>("/stock-balance", {
      params: { search },
    });
    return data.data;
  },
};

export function useStockBalances(search?: string) {
  return useQuery({
    queryKey: ["stock-balance", search],
    queryFn: () => stockBalanceApi.summary(search),
  });
}
