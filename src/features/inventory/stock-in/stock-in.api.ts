import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { StockIn } from "@/types/inventory.types";

export const stockInApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<StockIn[]>>("/stock-in", { params });
    return data;
  },
  create: async (payload: Partial<StockIn> & { items: unknown[] }) => {
    const { data } = await apiClient.post<ApiSuccess<StockIn>>("/stock-in", payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/stock-in/${id}`);
  },
};
