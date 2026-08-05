import { apiClient } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api.types";

export interface ActivityLog {
  id: string;
  subjectType: string;
  subjectId: string | null;
  subjectLabel: string | null;
  action: string;
  description: string;
  changes?: Record<string, unknown> | null;
  user?: { id: string; name: string } | null;
  createdAt: string;
}

export interface ActivityLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  subjectType?: string;
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ActivityLogFilterOptions {
  subjectTypes: string[];
  actions: string[];
}

export const activityLogApi = {
  list: async (params: ActivityLogListParams) => {
    const { data } = await apiClient.get<ApiSuccess<ActivityLog[]>>("/activity-logs", { params });
    return data;
  },
  filterOptions: async () => {
    const { data } = await apiClient.get<ApiSuccess<ActivityLogFilterOptions>>("/activity-logs/filter-options");
    return data.data;
  },
};
