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

export type RecentActivityType = "in" | "out" | "asset_checkout" | "asset_return";

export interface RecentActivity {
  type: RecentActivityType;
  id: string;
  refNo: string;
  date: string;
  subtitle: string;
  itemCount: number;
}

export interface MonthlyTrendPoint {
  month: string;
  label: string;
  totalIn: number;
  totalOut: number;
}

export interface AssetCategoryCount {
  category: string;
  count: number;
}

export interface DashboardSummary {
  totalItems: number;
  lowStockCount: number;
  totalBatches: number;
  stockInThisMonth: number;
  stockOutThisMonth: number;
  lowStockItems: LowStockItem[];
  recentActivity: RecentActivity[];
  monthlyTrend: MonthlyTrendPoint[];
  totalAssets: number;
  assetsByCategory: AssetCategoryCount[];
  // Total qty aset yang lagi dipakai (status IN_USE), digabung lintas semua aset
  assetsInUseQty: number;
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