import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { StockOut } from "@/types/inventory.types";

export interface StockOutAllocationPayload {
  projectRefId: string;
  costCentreId: string;
  costCodeId: string;
  qty: number;
}

export interface StockOutItemPayload {
  itemId: string;
  qty: number;
  allocations: StockOutAllocationPayload[];
}

export interface StockOutPayload {
  referenceNo: string;
  dateIssued: string;
  approvedBy: string;
  issuedTo?: string;
  projectName: string;
  projectRefId: string;
  costCentreId: string;
  costCodeId: string;
  items: StockOutItemPayload[];
}

export const stockOutApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<StockOut[]>>("/stock-out", { params });
    return data;
  },
  detail: async (id: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockOut>>(`/stock-out/${id}`);
    return data.data;
  },
  create: async (payload: StockOutPayload) => {
    const { data } = await apiClient.post<ApiSuccess<StockOut>>("/stock-out", payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/stock-out/${id}`);
  },
};

export const stockLotBalanceApi = {
  get: async (params: {
    itemId: string;
    projectRefId: string;
    costCentreId: string;
    costCodeId: string;
  }) => {
    const { data } = await apiClient.get<ApiSuccess<{ balance: number }>>("/stock-lots/balance", {
      params,
    });
    return data.data.balance;
  },
};
