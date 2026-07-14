import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-100 text-blue-700",
  CHECKED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  ORDERED: "bg-indigo-100 text-indigo-700",
  RECEIVED: "bg-teal-100 text-teal-700",
  CLOSED: "bg-slate-200 text-slate-600",
  REJECTED: "bg-red-100 text-red-700",
  OK: "bg-green-100 text-green-700",
  LOW_STOCK: "bg-red-100 text-red-700",
};

const LABEL_MAP: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Diajukan",
  CHECKED: "Dicek",
  APPROVED: "Disetujui",
  ORDERED: "Dipesan",
  RECEIVED: "Diterima",
  CLOSED: "Selesai",
  REJECTED: "Ditolak",
  OK: "Aman",
  LOW_STOCK: "Stok Rendah",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
        COLOR_MAP[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {LABEL_MAP[status] ?? status}
    </span>
  );
}
