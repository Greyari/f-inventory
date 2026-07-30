import { useTranslation } from "react-i18next";
import { PlusCircle, ShieldAlert, Loader2 } from "lucide-react";
import { useStockOutActivityLogs } from "./stock-out.hooks";
import type { StockOutActivityLog } from "@/types/inventory.types";

const FIELD_LABELS: Record<string, string> = {
  bNo: "No. B",
  dateIssued: "Tanggal keluar",
  issuedTo: "Diserahkan ke",
  projectName: "Nama project",
  projectRefId: "Project Ref",
  costCentreId: "Cost Centre",
  costCodeId: "Cost Code",
  items: "Item & sumber stok",
};

// Field yang nilainya manusiawi (bukan UUID) — ini yang ditampilkan old -> new-nya
const READABLE_FIELDS = new Set(["bNo", "dateIssued", "issuedTo", "projectName"]);

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ChangedFieldsList({ changes }: { changes: Record<string, unknown> }) {
  const fieldKeys = Object.keys(changes);
  if (fieldKeys.length === 0) return null;

  return (
    <ul className="mt-1 space-y-0.5">
      {fieldKeys.map((key) => {
        const label = FIELD_LABELS[key] ?? key;
        const entry = changes[key];
        const isReadable = READABLE_FIELDS.has(key) && entry && typeof entry === "object" && "old" in (entry as object);

        if (isReadable) {
          const { old: oldVal, new: newVal } = entry as { old: string; new: string };
          return (
            <li key={key} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{label}</span>: {oldVal || "-"} → {newVal || "-"}
            </li>
          );
        }

        return (
          <li key={key} className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{label}</span> diubah
          </li>
        );
      })}
    </ul>
  );
}

function ActivityDescription({ log }: { log: StockOutActivityLog }) {
  if (log.action === "created") {
    return <span>Data barang keluar dibuat</span>;
  }

  // updated (selalu oleh Super Admin, selalu ada reason)
  const changes = (log.changes ?? {}) as Record<string, unknown>;
  return (
    <div>
      <span className="font-medium text-destructive">Diedit oleh Super Admin</span>
      <ChangedFieldsList changes={changes} />
      {log.reason && (
        <p className="mt-1.5 rounded border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs italic text-destructive">
          “{log.reason}”
        </p>
      )}
    </div>
  );
}

export function StockOutActivityTimeline({ stockOutId }: { stockOutId: string }) {
  const { t } = useTranslation();
  const { data: logs, isLoading } = useStockOutActivityLogs(stockOutId);

  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="mb-3 text-sm font-semibold">{t("stockOut.activityLog")}</p>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {!isLoading && (!logs || logs.length === 0) && (
        <p className="text-xs text-muted-foreground">{t("stockOut.activityLogEmpty")}</p>
      )}

      {!isLoading && logs && logs.length > 0 && (
        <ol className="space-y-4">
          {logs.map((log, index) => (
            <li key={log.id} className="relative pl-6">
              {index < logs.length - 1 && (
                <span className="absolute left-[7px] top-5 h-full w-px bg-border" aria-hidden />
              )}
              <span className="absolute left-0 top-0.5">
                {log.action === "created" ? (
                  <PlusCircle className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                )}
              </span>

              <div className="text-sm">
                <ActivityDescription log={log} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {log.user?.name ?? t("stockIn.activityLogSystem")} · {formatDate(log.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
