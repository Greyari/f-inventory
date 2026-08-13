import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { Item } from "@/types/inventory.types";

export const itemApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<Item[]>>("/items", { params });
    return data;
  },
  create: async (payload: Partial<Item>) => {
    const { data } = await apiClient.post<ApiSuccess<Item>>("/items", payload);
    return data;
  },
  update: async (id: string, payload: Partial<Item>) => {
    const { data } = await apiClient.patch<ApiSuccess<Item>>(`/items/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiSuccess<null>>(`/items/${id}`);
    return data;
  },
};
