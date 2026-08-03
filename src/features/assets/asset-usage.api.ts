import { apiClient } from "@/lib/axios";
import type { ApiSuccess, ListParams } from "@/types/api.types";
import type { AssetUsage, ReturnCondition } from "@/types/asset.types";

export interface AssetUsagePayload {
  assetId: string;
  usedBy: string;
  purpose: string;
  qty: number;
  checkoutDate: string;
}

export interface ReturnAssetPayload {
  returnDate: string;
  returnCondition: ReturnCondition;
  returnNotes?: string;
  returnPhoto?: File | null;
}

export const assetUsageApi = {
  list: async (params: ListParams & { status?: string; assetId?: string }) => {
    const { data } = await apiClient.get<ApiSuccess<AssetUsage[]>>("/asset-usages", { params });
    return data;
  },
  detail: async (id: string) => {
    const { data } = await apiClient.get<ApiSuccess<AssetUsage>>(`/asset-usages/${id}`);
    return data.data;
  },
  checkout: async (payload: AssetUsagePayload) => {
    const { data } = await apiClient.post<ApiSuccess<AssetUsage>>("/asset-usages", payload);
    return data.data;
  },
  returnAsset: async (id: string, payload: ReturnAssetPayload) => {
    const formData = new FormData();
    formData.append("returnDate", payload.returnDate);
    formData.append("returnCondition", payload.returnCondition);
    if (payload.returnNotes) formData.append("returnNotes", payload.returnNotes);
    if (payload.returnPhoto) formData.append("returnPhoto", payload.returnPhoto);

    const { data } = await apiClient.post<ApiSuccess<AssetUsage>>(
      `/asset-usages/${id}/return`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/asset-usages/${id}`);
  },
};
