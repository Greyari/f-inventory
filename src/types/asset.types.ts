export interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  // Nama orang (mis. "Budi Santoso") ATAU nama ruangan (mis. "Ruang Meeting Lt. 2")
  recipient: string;
  qty: number;
  condition?: string | null;
  acquiredDate?: string | null;
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