import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { StockIn, StockInActivityLog } from "@/types/inventory.types";

export interface StockInPayload {
  prNo: string;
  dateReceived: string;
  projectName: string;
  projectRefId: string;
  costCentreId: string;
  costCodeId: string;
  items: { itemId: string; qty: number }[];
}

export interface MarkStockInPoItemPayload {
  stockInItemId: string;
  vendorName: string;
  price: number;
}

// PHP tidak parse body multipart untuk method PATCH langsung, jadi semua
// request yang bawa file dikirim sebagai POST + method spoofing (Laravel
// otomatis translate ini jadi PATCH di sisi server).
function withMethodSpoof(formData: FormData) {
  formData.append("_method", "PATCH");
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
  activityLogs: async (id: string) => {
    const { data } = await apiClient.get<ApiSuccess<StockInActivityLog[]>>(`/stock-in/${id}/activity-logs`);
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
  /** NPR -> PO: vendor + harga per item, plus 1 foto PO untuk seluruh record. */
  markAsPo: async (id: string, items: MarkStockInPoItemPayload[], poPhoto: File) => {
    const formData = new FormData();
    items.forEach((item, index) => {
      formData.append(`items[${index}][stockInItemId]`, item.stockInItemId);
      formData.append(`items[${index}][vendorName]`, item.vendorName);
      formData.append(`items[${index}][price]`, String(item.price));
    });
    formData.append("poPhoto", poPhoto);

    const { data } = await apiClient.post<ApiSuccess<StockIn>>(
      `/stock-in/${id}/mark-po`,
      withMethodSpoof(formData),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },
  /** PO -> DO: 1 foto DO. Di titik ini stok baru ditambahkan di backend. */
  markAsDo: async (id: string, doPhoto: File) => {
    const formData = new FormData();
    formData.append("doPhoto", doPhoto);

    const { data } = await apiClient.post<ApiSuccess<StockIn>>(
      `/stock-in/${id}/mark-do`,
      withMethodSpoof(formData),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/stock-in/${id}`);
  },
};