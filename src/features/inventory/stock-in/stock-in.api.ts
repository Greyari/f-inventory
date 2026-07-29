import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { StockIn } from "@/types/inventory.types";

export interface StockInPayload {
  prNo: string;
  dateReceived: string;
  projectName: string;
  projectRefId: string;
  costCentreId: string;
  costCodeId: string;
  items: { itemId: string; qty: number }[];
}

export interface MarkStockInDoItemPayload {
  stockInItemId: string;
  vendorName: string;
  price: number;
  photos?: File[];
}

function buildMarkAsDoFormData(items: MarkStockInDoItemPayload[]) {
  const formData = new FormData();
  items.forEach((item, index) => {
    formData.append(`items[${index}][stockInItemId]`, item.stockInItemId);
    formData.append(`items[${index}][vendorName]`, item.vendorName);
    formData.append(`items[${index}][price]`, String(item.price));
    (item.photos ?? []).forEach((file) => {
      formData.append(`items[${index}][photos][]`, file);
    });
  });
  return formData;
}

export const stockInApi = {
  list: async (params: ListParams & { status?: string }) => {
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
  markAsDo: async (id: string, items: MarkStockInDoItemPayload[]) => {
    const formData = buildMarkAsDoFormData(items);
    // PHP tidak parse body multipart untuk method PATCH, jadi kita kirim
    // sebagai POST + method spoofing (Laravel otomatis translate ini jadi PATCH).
    formData.append("_method", "PATCH");
    const { data } = await apiClient.post<ApiSuccess<StockIn>>(`/stock-in/${id}/status`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/stock-in/${id}`);
  },
};
