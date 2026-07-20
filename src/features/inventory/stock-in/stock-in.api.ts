import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { StockIn } from "@/types/inventory.types";

export interface StockInPayload {
  referenceNo: string;
  dateReceived: string;
  approvedBy: string;
  projectName: string;
  projectRefId: string;
  costCentreId: string;
  costCodeId: string;
  items: { itemId: string; qty: number; location?: string }[];
}

export const stockInApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<StockIn[]>>("/stock-in", { params });
    return data;
  },
  detail: async (id: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockIn>>(`/stock-in/${id}`);
    return data.data;
  },
  create: async (payload: StockInPayload) => {
    const { data } = await apiClient.post<ApiSuccess<StockIn>>("/stock-in", payload);
    return data.data;
  },
  update: async (id: string, payload: StockInPayload) => {
    const { data } = await apiClient.patch<ApiSuccess<StockIn>>(`/stock-in/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/stock-in/${id}`);
  },
};
