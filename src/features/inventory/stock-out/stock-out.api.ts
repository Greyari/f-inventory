import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { StockOut } from "@/types/inventory.types";

export const stockOutApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<StockOut[]>>("/stock-out", { params });
    return data;
  },
  create: async (payload: Partial<StockOut> & { items: unknown[] }) => {
    const { data } = await apiClient.post<ApiSuccess<StockOut>>("/stock-out", payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/stock-out/${id}`);
  },
};
