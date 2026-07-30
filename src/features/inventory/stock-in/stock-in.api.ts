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

export interface OverrideStockInItemPayload {
  itemId: string;
  qty: number;
  vendorName?: string;
  price?: number;
}

export interface OverrideUpdateStockInPayload {
  prNo?: string;
  dateReceived?: string;
  projectName?: string;
  projectRefId?: string;
  costCentreId?: string;
  costCodeId?: string;
  items?: OverrideStockInItemPayload[];
  poPhoto?: File;
  doPhoto?: File;
  reason: string;
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
  /** Edit bebas oleh Super Admin — bypass batasan alur normal. Reason wajib. */
  overrideUpdate: async (id: string, payload: OverrideUpdateStockInPayload) => {
    const formData = new FormData();
    if (payload.prNo !== undefined) formData.append("prNo", payload.prNo);
    if (payload.dateReceived !== undefined) formData.append("dateReceived", payload.dateReceived);
    if (payload.projectName !== undefined) formData.append("projectName", payload.projectName);
    if (payload.projectRefId !== undefined) formData.append("projectRefId", payload.projectRefId);
    if (payload.costCentreId !== undefined) formData.append("costCentreId", payload.costCentreId);
    if (payload.costCodeId !== undefined) formData.append("costCodeId", payload.costCodeId);
    if (payload.items) {
      payload.items.forEach((item, index) => {
        formData.append(`items[${index}][itemId]`, item.itemId);
        formData.append(`items[${index}][qty]`, String(item.qty));
        if (item.vendorName !== undefined) formData.append(`items[${index}][vendorName]`, item.vendorName);
        if (item.price !== undefined) formData.append(`items[${index}][price]`, String(item.price));
      });
    }
    if (payload.poPhoto) formData.append("poPhoto", payload.poPhoto);
    if (payload.doPhoto) formData.append("doPhoto", payload.doPhoto);
    formData.append("reason", payload.reason);

    const { data } = await apiClient.post<ApiSuccess<StockIn>>(
      `/stock-in/${id}/override`,
      withMethodSpoof(formData),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },
};
