import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { JobCode } from "@/types/inventory.types";

export const jobCodeApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<JobCode[]>>("/job-codes", { params });
    return data;
  },
  create: async (payload: Partial<JobCode>) => {
    const { data } = await apiClient.post<ApiSuccess<JobCode>>("/job-codes", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<JobCode>) => {
    const { data } = await apiClient.patch<ApiSuccess<JobCode>>(`/job-codes/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/job-codes/${id}`);
  },
};
