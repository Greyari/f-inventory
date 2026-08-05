import type { StockInStatus } from "@/types/inventory.types";
import { cn } from "@/lib/utils";

const STYLES: Record<StockInStatus, string> = {
  pr: "bg-amber-100 text-amber-800 border-amber-200",
  po: "bg-sky-100 text-sky-800 border-sky-200",
  do: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const LABELS: Record<StockInStatus, string> = {
  pr: "PR",
  po: "PO",
  do: "DO",
};

export function StockInStatusBadge({ status }: { status: StockInStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STYLES[status]
      )}
    >
      {LABELS[status]}
    </span>
  );
}
