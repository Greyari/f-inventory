export interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  // Nama orang (mis. "Budi Santoso") ATAU nama ruangan (mis. "Ruang Meeting Lt. 2")
  qty: number;
  inUseQty: number;
  availableQty: number;
  notes?: string | null;
  createdAt: string;
}

export interface AssetCategorySummary {
  category: string;
  count: number;
  totalQty: number;
}

export interface AssetSummary {
  totalAssets: number;
  totalQty: number;
  byCategory: AssetCategorySummary[];
}

export type AssetUsageStatus = "IN_USE" | "RETURNED";

export type ReturnCondition = "Baik" | "Rusak Ringan" | "Rusak Berat" | "Hilang";

export interface AssetUsage {
  id: string;
  assetId: string;
  asset?: Asset;
  usedBy: string;
  purpose: string;
  qty: number;
  checkoutDate: string;
  status: AssetUsageStatus;
  returnDate?: string | null;
  returnCondition?: ReturnCondition | null;
  returnNotes?: string | null;
  returnPhotoUrl?: string | null;
  processedByName?: string | null;
  createdAt: string;
}
