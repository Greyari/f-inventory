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

// ---- Stock Lot: saldo stok per kombinasi item + project ref + cost centre + cost code ----
export interface StockLot {
  id: string;
  itemId: string;
  item?: Item;
  projectRefId: string;
  projectRef?: JobCode;
  costCentreId: string;
  costCentre?: JobCode;
  costCodeId: string;
  costCode?: JobCode;
  balance: number;
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
  dateReceived: string;
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
  projectRefId: string;
  projectRef?: JobCode;
  costCentreId: string;
  costCentre?: JobCode;
  costCodeId: string;
  costCode?: JobCode;
  qty: number;
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
// Cuma ada 'created' & 'updated'
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
