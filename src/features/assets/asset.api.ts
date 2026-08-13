import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { Asset, AssetSummary } from "@/types/asset.types";

export interface AssetPayload {
  assetCode: string;
  assetName: string;
  category: string;
  qty: number;
  notes?: string;
}

export const assetApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<Asset[]>>("/assets", { params });
    return data;
  },
  detail: async (id: string) => {
    const { data } = await apiClient.get<ApiSuccess<Asset>>(`/assets/${id}`);
    return data.data;
  },
  create: async (payload: AssetPayload) => {
    const { data } = await apiClient.post<ApiSuccess<Asset>>("/assets", payload);
    return data;
  },
  update: async (id: string, payload: Partial<AssetPayload>) => {
    const { data } = await apiClient.patch<ApiSuccess<Asset>>(`/assets/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiSuccess<null>>(`/assets/${id}`);
    return data;
  },
  summary: async () => {
    const { data } = await apiClient.get<ApiSuccess<AssetSummary>>("/assets/summary");
    return data.data;
  },
};
