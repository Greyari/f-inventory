import { z } from "zod";

export const allocationSchema = z.object({
  projectRefId: z.string().min(1, "Wajib dipilih"),
  costCentreId: z.string().min(1, "Wajib dipilih"),
  costCodeId: z.string().min(1, "Wajib dipilih"),
  qty: z.coerce.number().min(0.01, "Qty harus > 0"),
});

export const stockOutItemSchema = z.object({
  itemId: z.string().min(1, "Item wajib dipilih"),
  allocations: z.array(allocationSchema).min(1, "Minimal 1 sumber stok"),
});

const baseFields = {
  bNo: z.string().min(1, "Nomor referensi wajib diisi"),
  dateIssued: z.string().min(1, "Tanggal wajib diisi"),
  issuedTo: z.string().optional(),
  projectName: z.string().min(1, "Nama project wajib diisi"),
  projectRefId: z.string().min(1, "Project Ref wajib dipilih"),
  costCentreId: z.string().min(1, "Cost Centre wajib dipilih"),
  costCodeId: z.string().min(1, "Cost Code wajib dipilih"),
  items: z.array(stockOutItemSchema).min(1, "Minimal 1 item"),
};

// Dipakai pas CREATE — gak butuh reason.
export const stockOutSchema = z.object(baseFields);

// Dipakai pas EDIT (cuma Super Admin) — reason WAJIB diisi.
export const stockOutEditSchema = z.object({
  ...baseFields,
  reason: z.string().min(5, "Alasan wajib diisi, jelaskan sedikit lebih detail"),
});

export type StockOutFormValues = z.infer<typeof stockOutSchema>;
export type StockOutEditFormValues = z.infer<typeof stockOutEditSchema>;

export const emptyStockOutValues = (): StockOutFormValues => ({
  bNo: "",
  dateIssued: new Date().toISOString().slice(0, 10),
  issuedTo: "",
  projectName: "",
  projectRefId: "",
  costCentreId: "",
  costCodeId: "",
  items: [
    {
      itemId: "",
      allocations: [{ projectRefId: "", costCentreId: "", costCodeId: "", qty: 1 }],
    },
  ],
});

// Import di sini (bukan di atas) buat hindari circular import dgn types/inventory.types
import type { StockOut } from "@/types/inventory.types";

export const valuesFromStockOut = (data: StockOut): StockOutEditFormValues => ({
  bNo: data.bNo,
  dateIssued: data.dateIssued,
  issuedTo: data.issuedTo ?? "",
  projectName: data.projectName,
  projectRefId: data.projectRefId,
  costCentreId: data.costCentreId,
  costCodeId: data.costCodeId,
  items: data.items.map((it) => ({
    itemId: it.itemId,
    allocations: it.allocations.map((a) => ({
      projectRefId: a.projectRefId,
      costCentreId: a.costCentreId,
      costCodeId: a.costCodeId,
      qty: a.qty,
    })),
  })),
  reason: "",
});
