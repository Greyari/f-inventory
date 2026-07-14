import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { ApiSuccess } from "@/types/api.types";

export interface DashboardSummary {
  totalItems: number;
  lowStockCount: number;
  purchasePending: number;
  purchaseApprovedThisMonth: number;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiSuccess<DashboardSummary>>("/dashboard/summary");
      return data.data;
    },
  });
}
