import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { ApiSuccess } from "@/types/api.types";

export interface LowStockItem {
  itemId: string;
  itemName: string;
  unit: string;
  balance: number;
  minStockLevel: number;
}

export interface RecentActivity {
  type: "in" | "out";
  id: string;
  prNo: string;
  date: string;
  projectName: string;
  itemCount: number;
}

export interface MonthlyTrendPoint {
  month: string;
  label: string;
  totalIn: number;
  totalOut: number;
}

export interface DashboardSummary {
  totalItems: number;
  lowStockCount: number;
  totalLots: number;
  stockInThisMonth: number;
  stockOutThisMonth: number;
  lowStockItems: LowStockItem[];
  recentActivity: RecentActivity[];
  monthlyTrend: MonthlyTrendPoint[];
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
