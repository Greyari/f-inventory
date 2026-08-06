import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { History, ChevronDown, Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useActivityLogs, useActivityLogFilterOptions } from "./activity-log.hooks";
import type { ActivityLog } from "./activity-log.api";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  created: "bg-emerald-100 text-emerald-700",
  updated: "bg-amber-100 text-amber-700",
  deleted: "bg-red-100 text-red-700",
  status_changed: "bg-sky-100 text-sky-700",
  override_updated: "bg-red-100 text-red-700",
  direct_addition: "bg-emerald-100 text-emerald-700",
  adjusted: "bg-amber-100 text-amber-700",
};

function actionColor(action: string) {
  return ACTION_COLORS[action] ?? "bg-muted text-muted-foreground";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

// Label field yang enak dibaca untuk kunci-kunci umum di 'changes'
const FIELD_LABELS: Record<string, string> = {
  prNo: "No. PR", bNo: "No. B", dateRaised: "Tanggal", dateIssued: "Tanggal",
  projectName: "Project", projectRefId: "Project Ref", costCentreId: "Cost Centre",
  costCodeId: "Cost Code", items: "Daftar Item", issuedTo: "Diserahkan Ke",
  poPhoto: "Foto PO", doPhoto: "Foto DO",
};

export default function ActivityLogPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [subjectType, setSubjectType] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailLog, setDetailLog] = useState<ActivityLog | null>(null);

  const { data: filterOptions } = useActivityLogFilterOptions();
  const { data, isLoading } = useActivityLogs({
    search: debouncedSearch || undefined,
    subjectType: subjectType || undefined,
    action: action || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit: 20,
  });

  useEffect(() => setPage(1), [debouncedSearch, subjectType, action, dateFrom, dateTo]);

  const columns: Column<ActivityLog>[] = [
    {
      header: t("activityLog.colTime"),
      accessor: (r) => <span className="whitespace-nowrap text-xs">{formatDate(r.createdAt)}</span>,
    },
    {
      header: t("activityLog.colModule"),
      accessor: (r) => <span className="text-xs font-medium">{r.subjectType}</span>,
      hideOnMobile: true,
    },
    {
      header: t("activityLog.colAction"),
      accessor: (r) => (
        <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", actionColor(r.action))}>
          {r.action}
        </span>
      ),
    },
    {
      header: t("activityLog.colDescription"),
      accessor: (r) => <span className="text-sm">{r.description}</span>,
    },
    {
      header: t("activityLog.colUser"),
      accessor: (r) => <span className="text-xs text-muted-foreground">{r.user?.name ?? t("stockIn.activityLogSystem")}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-muted-foreground" />
        <div>
          <h2 className="text-2xl font-semibold">{t("activityLog.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("activityLog.subtitle")}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border bg-background p-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label={t("activityLog.filterModule")}
          value={subjectType}
          onChange={setSubjectType}
          options={filterOptions?.subjectTypes ?? []}
          allLabel={t("activityLog.allModules")}
        />
        <FilterSelect
          label={t("activityLog.filterAction")}
          value={action}
          onChange={setAction}
          options={filterOptions?.actions ?? []}
          allLabel={t("activityLog.allActions")}
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("activityLog.filterDateFrom")}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("activityLog.filterDateTo")}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("activityLog.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        rowActions={(row) =>
          row.changes && Object.keys(row.changes).length > 0 ? (
            <Button variant="ghost" size="icon" title={t("activityLog.viewDetail")} onClick={() => setDetailLog(row)}>
              <Eye className="h-4 w-4" />
            </Button>
          ) : null
        }
      />

      <ActivityLogDetailDialog log={detailLog} onOpenChange={(open) => !open && setDetailLog(null)} />
    </div>
  );
}

function ActivityLogDetailDialog({ log, onOpenChange }: { log: ActivityLog | null; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  if (!log) return null;

  const changes = (log.changes ?? {}) as Record<string, unknown>;
  const fieldKeys = Object.keys(changes);

  return (
    <Dialog open={!!log} onOpenChange={onOpenChange}>
      <DialogContent title={t("activityLog.detailTitle")} className="max-w-lg">
        <div className="mb-3 rounded-md border bg-muted/20 p-3 text-sm">
          <p className="font-medium">{log.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {log.subjectType} · {log.user?.name ?? t("stockIn.activityLogSystem")} · {formatDate(log.createdAt)}
          </p>
        </div>

        {fieldKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("activityLog.noChangeDetail")}</p>
        ) : (
          <div className="space-y-2">
            {fieldKeys.map((key) => {
              const label = FIELD_LABELS[key] ?? key;
              const entry = changes[key];
              const isDiff = entry && typeof entry === "object" && ("old" in (entry as object) || "new" in (entry as object));

              if (isDiff) {
                const { old: oldVal, new: newVal } = entry as { old?: unknown; new?: unknown };
                return (
                  <div key={key} className="rounded-md border p-2 text-xs">
                    <p className="mb-1 font-medium text-foreground">{label}</p>
                    <p className="text-muted-foreground">
                      <span className="text-destructive">{oldVal !== undefined ? String(oldVal) : "-"}</span>
                      {" → "}
                      <span className="text-emerald-700">{newVal !== undefined ? String(newVal) : "-"}</span>
                    </p>
                  </div>
                );
              }

              return (
                <div key={key} className="rounded-md border p-2 text-xs">
                  <p className="mb-1 font-medium text-foreground">{label}</p>
                  <p className="text-muted-foreground">{String(entry)}</p>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-md border border-border bg-background px-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{allLabel}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}