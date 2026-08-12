import { apiClient } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api.types";

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  changePassword: async (payload: ChangePasswordPayload) => {
    const { data } = await apiClient.post<ApiSuccess<null>>("/auth/change-password", payload);
    return data;
  },
};
