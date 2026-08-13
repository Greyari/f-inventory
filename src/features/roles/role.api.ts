import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { Role, Permission } from "@/types/auth.types";

export const roleApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<Role[]>>("/roles", { params });
    return data;
  },
  create: async (payload: { name: string; description?: string; permissionIds: string[] }) => {
    const { data } = await apiClient.post<ApiSuccess<Role>>("/roles", payload);
    return data;
  },
  update: async (
    id: string,
    payload: { name?: string; description?: string; permissionIds?: string[] }
  ) => {
    const { data } = await apiClient.patch<ApiSuccess<Role>>(`/roles/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiSuccess<null>>(`/roles/${id}`);
    return data;
  },
};

export const permissionApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiSuccess<Permission[]>>("/permissions");
    return data.data;
  },
};
