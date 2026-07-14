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

export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  location?: string;
  status: "ACTIVE" | "CLOSED";
}

/**
 * Satu master untuk Project Ref, Cost Centre, dan Cost Code.
 * Contoh: { code: "CYB-16-05", description: "BATCHING PLANT 5", category: "BUILDING MAINTENANCE (CYB-00)" }
 * Dipakai 3x independen di form PO (nilainya bisa sama, bisa beda).
 */
export interface JobCode {
  id: string;
  code: string;
  description: string;
  category: string;
  isActive: boolean;
}

export type Department =
  | "NEW_SHIP"
  | "REPAIR"
  | "ENGINEERING"
  | "SHIPPING"
  | "LOGISTICS";

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
}

// ---- Purchasing ----
export type PurchaseStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "CHECKED"
  | "APPROVED"
  | "ORDERED"
  | "RECEIVED"
  | "CLOSED"
  | "REJECTED";

export interface PurchaseItem {
  id?: string;
  itemId?: string;           // opsional: link ke master item kalau sudah terdaftar
  item?: Item;
  description: string;       // free text, sesuai kolom "Description" di form
  qty: number;
  unit: string;
  stockBalance?: number;     // read-only, diisi backend dari /stock-balance
  purpose: string;
  unitPrice?: number;
  remarks?: string;
}

export interface Purchase {
  id: string;
  prNumber: string;
  department: Department;
  projectName: string;         // field "Project" (teks bebas, mis. "Batching Plant 5")
  projectRefId: string;        // FK ke JobCode
  projectRef?: JobCode;
  costCentreId: string;        // FK ke JobCode
  costCentre?: JobCode;
  costCodeId: string;          // FK ke JobCode
  costCode?: JobCode;
  dateRaised: string;
  dateRequired?: string;
  raisedByName: string;
  checkedByName?: string;
  approvedByName?: string;
  rejectReason?: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

// ---- Inventory transactions ----
export interface StockMovementItem {
  itemId: string;
  item?: Item;
  qty: number;
  location?: string;
}

export interface StockIn {
  id: string;
  referenceNo: string;
  purchaseId?: string;
  dateReceived: string;
  items: StockMovementItem[];
  createdAt: string;
}

export interface StockOut {
  id: string;
  referenceNo: string;
  projectId: string;
  project?: Project;
  dateIssued: string;
  issuedTo: string;
  items: StockMovementItem[];
  createdAt: string;
}

export type StockStatus = "OK" | "LOW_STOCK";

export interface StockBalance {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  minStockLevel: number;
  status: StockStatus;
}
