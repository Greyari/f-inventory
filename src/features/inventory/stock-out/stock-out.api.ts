import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { StockOut, StockOutActivityLog, StockBatch } from "@/types/inventory.types";

export interface StockOutAllocationPayload {
  stockBatchId: string;
  qty: number;
}

export interface StockOutItemPayload {
  itemId: string;
  qty: number;
  allocations: StockOutAllocationPayload[];
}

export interface StockOutPayload {
  bNo: string;
  dateIssued: string;
  issuedTo?: string;
  projectName: string;
  projectRefId: string;
  costCentreId: string;
  costCodeId: string;
  items: StockOutItemPayload[];
}

// Cuma dipakai pas edit — hanya bisa dilakukan Super Admin, reason wajib.
export type UpdateStockOutPayload = StockOutPayload & { reason: string };

export const stockOutApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<StockOut[]>>("/stock-out", { params });
    return data;
  },
  detail: async (id: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockOut>>(`/stock-out/${id}`);
    return data.data;
  },
  activityLogs: async (id: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockOutActivityLog[]>>(`/stock-out/${id}/activity-logs`);
    return data.data;
  },
  create: async (payload: StockOutPayload) => {
    const { data } = await apiClient.post<ApiSuccess<StockOut>>("/stock-out", payload);
    return data;
  },
  update: async (id: string, payload: UpdateStockOutPayload) => {
    const { data } = await apiClient.patch<ApiSuccess<StockOut>>(`/stock-out/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiSuccess<null>>(`/stock-out/${id}`);
    return data;
  },
};

// Daftar BATCH (bukan lot pooled lagi) yang masih ada sisanya untuk 1 item.
// Dipakai buat form Barang Keluar — admin pilih manual batch mana yang
// mau ditarik, sekalian kelihatan asalnya (link PR/DO atau "direct").
export const stockBatchApi = {
  listAvailableByItem: async (itemId: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockBatch[]>>(`/items/${itemId}/available-batches`);
    return data.data;
  },
};
