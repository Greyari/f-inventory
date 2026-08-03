// ---- Master data ----
export interface Item {
  id: string;
  itemName: string;
  category: string;
  unit: string;
  minStockLevel: number;
  description?: string;
}

/**
 * Satu master untuk Project Ref, Cost Centre, dan Cost Code.
 * Contoh: { code: "CYB-16-05", description: "BATCHING PLANT 5", category: "BUILDING MAINTENANCE (CYB-00)" }
 * Dipakai 3x independen di form Barang Masuk/Keluar (nilainya bisa sama, bisa beda).
 */
export interface JobCode {
  id: string;
  code: string;
  description: string;
  category: string;
  isActive: boolean;
}

// ---- Stock Batch: 1 baris = 1 kedatangan stok (dari NPR/DO atau Tambah
// Langsung), dengan sisa qty-nya sendiri. Ganti total konsep "lot pooled". ----
export type StockBatchSourceType = "stock_in" | "direct";

export interface StockBatch {
  id: string;
  itemId: string;
  item?: Item;
  projectRefId: string;
  projectRef?: JobCode;
  costCentreId: string;
  costCentre?: JobCode;
  costCodeId: string;
  costCode?: JobCode;
  // Pembeda utama "punya project mana" — walau job code sama, project_name beda = batch beda
  projectName: string;
  sourceType: StockBatchSourceType;
  // Cuma terisi kalau sourceType = "direct"
  reason?: string | null;
  qtyReceived: number;
  qtyRemaining: number;
  isDepleted: boolean;
  // Traceability: link balik ke NPR/DO asalnya (null kalau sourceType = "direct")
  sourceStockIn?: { id: string; prNo: string; status: StockInStatus } | null;
  createdAt: string;
}

// Ringkasan per kombinasi (item+project ref+cost centre+cost code+project
// name), dipakai buat list "Stok Tersisa" biar tetap ringkas (gak nampilin
// tiap batch 1-1). Dari endpoint GET /stock-lots.
export interface StockLotSummary {
  itemId: string;
  item?: Item;
  projectRefId: string;
  projectRef?: JobCode;
  costCentreId: string;
  costCentre?: JobCode;
  costCodeId: string;
  costCode?: JobCode;
  projectName: string;
  balance: number;
  batchCount: number;
}

// ---- Riwayat koreksi manual (Super Admin) ke qty_remaining 1 batch ----
export interface StockBatchAdjustmentLog {
  id: string;
  oldQtyRemaining: number;
  newQtyRemaining: number;
  reason: string;
  stockBatch?: {
    id: string;
    projectName: string;
    projectRef?: string;
    costCentre?: string;
    costCode?: string;
  } | null;
  user?: { id: string; name: string } | null;
  createdAt: string;
}

// ---- Barang Masuk ----
// npr -> po -> do. Stok baru bertambah begitu status jadi "do".
export type StockInStatus = "npr" | "po" | "do";

export interface StockInItem {
  id: string;
  itemId: string;
  item?: Item;
  qty: number;
  // Terisi begitu status naik jadi "po"
  vendorName?: string | null;
  price?: number | null;
}

export interface StockIn {
  id: string;
  prNo: string;
  status: StockInStatus;
  // 1 foto per tahap untuk keseluruhan record (bukan per item)
  poPhotoUrl?: string | null;
  doPhotoUrl?: string | null;
  dateRaised: string;
  projectName: string;
  projectRefId: string;
  projectRef?: JobCode;
  costCentreId: string;
  costCentre?: JobCode;
  costCodeId: string;
  costCode?: JobCode;
  items: StockInItem[];
  createdAt: string;
}

// ---- Riwayat perubahan (activity log) ----
export type StockInActivityAction = "created" | "updated" | "status_changed" | "override_updated";

export interface StockInActivityLog {
  id: string;
  action: StockInActivityAction;
  fromStatus?: StockInStatus | null;
  toStatus?: StockInStatus | null;
  // Bentuknya beda-beda tergantung action:
  // - updated / override_updated: { [field]: { old: string; new: string } | true }
  // - status_changed (khusus npr->po): { items: { vendorName; price }[] }
  changes?: Record<string, unknown> | null;
  // Wajib terisi untuk action = "override_updated" (alasan edit di luar alur)
  reason?: string | null;
  user?: { id: string; name: string } | null;
  createdAt: string;
}

// ---- Barang Keluar ----
export interface StockOutAllocation {
  stockBatchId: string;
  projectRefId: string;
  projectRef?: JobCode;
  costCentreId: string;
  costCentre?: JobCode;
  costCodeId: string;
  costCode?: JobCode;
  qty: number;
  // Traceability: batch ini asalnya dari mana (link ke NPR/DO, atau "direct")
  batch?: {
    projectName: string;
    sourceType: StockBatchSourceType;
    stockInId?: string | null;
    stockInPrNo?: string | null;
  } | null;
}

export interface StockOutItem {
  itemId: string;
  item?: Item;
  qty: number;
  allocations: StockOutAllocation[];
}

export interface StockOut {
  id: string;
  bNo: string;
  dateIssued: string;
  issuedTo?: string;
  // Project/cost TUJUAN pemakaian barang ini (beda dengan asal/sumber di allocations)
  projectName: string;
  projectRefId: string;
  projectRef?: JobCode;
  costCentreId: string;
  costCentre?: JobCode;
  costCodeId: string;
  costCode?: JobCode;
  items: StockOutItem[];
  createdAt: string;
}

// ---- Riwayat perubahan (activity log) Barang Keluar ----
// Cuma ada 'created' & 'updated' — gak ada status bertahap kayak StockIn.
export type StockOutActivityAction = "created" | "updated";

export interface StockOutActivityLog {
  id: string;
  action: StockOutActivityAction;
  // { [field]: { old: string; new: string } | true }
  changes?: Record<string, unknown> | null;
  // Wajib terisi untuk action = "updated" (edit cuma bisa oleh Super Admin)
  reason?: string | null;
  user?: { id: string; name: string } | null;
  createdAt: string;
}
