import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { User } from "@/types/auth.types";

export const userApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<User[]>>("/users", { params });
    return data;
  },
  create: async (payload: { name: string; email: string; password: string; roleId: string }) => {
    const { data } = await apiClient.post<ApiSuccess<User>>("/users", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<User>) => {
    const { data } = await apiClient.patch<ApiSuccess<User>>(`/users/${id}`, payload);
    return data.data;
  },
  resetPassword: async (id: string) => {
    const { data } = await apiClient.patch<ApiSuccess<{ temporaryPassword: string }>>(
      `/users/${id}/reset-password`
    );
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },
};
