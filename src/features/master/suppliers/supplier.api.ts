import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { Supplier } from "@/types/inventory.types";

export const supplierApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<Supplier[]>>("/suppliers", { params });
    return data;
  },
  create: async (payload: Partial<Supplier>) => {
    const { data } = await apiClient.post<ApiSuccess<Supplier>>("/suppliers", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<Supplier>) => {
    const { data } = await apiClient.patch<ApiSuccess<Supplier>>(`/suppliers/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};
