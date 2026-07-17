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

export const stockOutSchema = z.object({
  referenceNo: z.string().min(1, "Nomor referensi wajib diisi"),
  dateIssued: z.string().min(1, "Tanggal wajib diisi"),
  approvedBy: z.string().min(1, "Nama yang meng-acc wajib diisi"),
  issuedTo: z.string().optional(),
  projectName: z.string().min(1, "Nama project wajib diisi"),
  projectRefId: z.string().min(1, "Project Ref wajib dipilih"),
  costCentreId: z.string().min(1, "Cost Centre wajib dipilih"),
  costCodeId: z.string().min(1, "Cost Code wajib dipilih"),
  items: z.array(stockOutItemSchema).min(1, "Minimal 1 item"),
});

export type StockOutFormValues = z.infer<typeof stockOutSchema>;

export const emptyStockOutValues = (): StockOutFormValues => ({
  referenceNo: "",
  dateIssued: new Date().toISOString().slice(0, 10),
  approvedBy: "",
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
