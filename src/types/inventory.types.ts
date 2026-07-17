// ---- Master data ----
export interface Item {
  id: string;
  itemCode: string;
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
export interface StockInItem {
  itemId: string;
  item?: Item;
  qty: number;
  location?: string;
}

export interface StockIn {
  id: string;
  referenceNo: string;
  dateReceived: string;
  approvedBy: string;
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
  referenceNo: string;
  dateIssued: string;
  approvedBy: string;
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
