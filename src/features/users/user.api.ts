import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { User } from "@/types/auth.types";

// ini untuk apa?
export type UpdateUserPayload = Partial<Pick<User, "name" | "email" | "roleId" | "isActive">> & {
  password?: string;
};

export const userApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<User[]>>("/users", { params });
    return data;
  },
  create: async (payload: { name: string; email: string; password: string; roleId: string }) => {
    const { data } = await apiClient.post<ApiSuccess<User>>("/users", payload);
    return data.data;
  },
  update: async (id: string, payload: UpdateUserPayload) => {
    const { data } = await apiClient.patch<ApiSuccess<User>>(`/users/${id}`, payload);
    return data.data;
  },
  setActiveStatus: async (id: string, isActive: boolean) => {
    const { data } = await apiClient.patch<ApiSuccess<User>>(`/users/${id}`, { isActive });
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },
};