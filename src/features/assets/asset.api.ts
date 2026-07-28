import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { Asset, AssetSummary } from "@/types/asset.types";

export interface AssetPayload {
  assetCode: string;
  assetName: string;
  category: string;
  recipient: string;
  qty: number;
  condition?: string;
  acquiredDate?: string;
  notes?: string;
}

export const assetApi = {
  list: async (params: ListParams) => {
    const { data } = await apiClient.get<ApiSuccess<Asset[]>>("/assets", { params });
    return data;
  },
  create: async (payload: AssetPayload) => {
    const { data } = await apiClient.post<ApiSuccess<Asset>>("/assets", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<AssetPayload>) => {
    const { data } = await apiClient.patch<ApiSuccess<Asset>>(`/assets/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/assets/${id}`);
  },
  summary: async () => {
    const { data } = await apiClient.get<ApiSuccess<AssetSummary>>("/assets/summary");
    return data.data;
  },
};
