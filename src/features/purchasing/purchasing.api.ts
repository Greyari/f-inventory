import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { Purchase } from "@/types/inventory.types";

export const purchasingApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<Purchase[]>>("/purchases", {
      params,
    });
    return data;
  },

  detail: async (id: string) => {
    const { data } = await apiClient.get<ApiSuccess<Purchase>>(`/purchases/${id}`);
    return data.data;
  },

  create: async (payload: Partial<Purchase>) => {
    const { data } = await apiClient.post<ApiSuccess<Purchase>>("/purchases", payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<Purchase>) => {
    const { data } = await apiClient.patch<ApiSuccess<Purchase>>(
      `/purchases/${id}`,
      payload
    );
    return data.data;
  },

  updateStatus: async (
    id: string,
    payload: { status: Purchase["status"]; name?: string; rejectReason?: string }
  ) => {
    const { data } = await apiClient.patch<ApiSuccess<Purchase>>(
      `/purchases/${id}/status`,
      payload
    );
    return data.data;
  },

  remove: async (id: string) => {
    await apiClient.delete(`/purchases/${id}`);
  },
};
