import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { StockOut, StockOutActivityLog, StockLot } from "@/types/inventory.types";

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
    return data.data;
  },
  update: async (id: string, payload: UpdateStockOutPayload) => {
    const { data } = await apiClient.patch<ApiSuccess<StockOut>>(`/stock-out/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/stock-out/${id}`);
  },
};

// Daftar semua lot (kombinasi Project Ref/Cost Centre/Cost Code yang punya saldo) untuk 1 item.
// Dipakai buat dropdown pilih sumber stok di form Barang Keluar.
export const stockLotsApi = {
  listByItem: async (itemId: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockLot[]>>("/stock-lots", {
      params: { itemId },
    });
    return data.data;
  },
};