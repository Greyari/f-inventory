import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  PackagePlus,
  PackageMinus,
  Boxes,
  Loader2,
  Pencil,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useItemStockHistory } from "./stock-balance.hooks";
import { useHasPermission } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { AdjustStockLotDialog } from "./AdjustStockLotDialog";
import type { StockBatch, StockBatchAdjustmentLog } from "@/types/inventory.types";

export default function StockItemDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const { data, isLoading } = useItemStockHistory(itemId);
  const canAdjust = useHasPermission("stock-lots.adjust");
  const [adjustingBatch, setAdjustingBatch] = useState<StockBatch | null>(null);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const { item, totalIn, totalOut, totalManualAdjustment, balance, batches, stockIns, stockOuts, adjustmentLogs } = data;

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={() => navigate("/inventory/stock-balance")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("stockBalance.backToList")}
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{item.itemName}</h2>
        <p className="text-sm text-muted-foreground">
          {item.category} · {t("item.unit")}: {item.unit}
        </p>
      </div>

      {/* Summary cards */}
      <div className={cn("mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3", totalManualAdjustment !== 0 && "lg:grid-cols-4")}>
        <SummaryCard icon={PackagePlus} color="text-blue-600 bg-blue-100" label={t("stockBalance.totalIn")} value={`${totalIn} ${item.unit}`} />
        <SummaryCard icon={PackageMinus} color="text-amber-600 bg-amber-100" label={t("stockBalance.totalOut")} value={`${totalOut} ${item.unit}`} />
        {totalManualAdjustment !== 0 && (
          <SummaryCard
            icon={ShieldAlert}
            color="text-purple-600 bg-purple-100"
            label={t("stockBalance.totalManualAdjustment")}
            value={`${totalManualAdjustment > 0 ? "+" : ""}${totalManualAdjustment} ${item.unit}`}
          />
        )}
        <SummaryCard icon={Boxes} color="text-green-600 bg-green-100" label={t("stockBalance.currentBalance")} value={`${balance} ${item.unit}`} highlight />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Batch list — pengganti "Rincian per Lot": 1 baris = 1 kedatangan
              stok, link ke PR/DO asalnya, abu-abu kalau udah habis. */}
          <div className="rounded-lg border bg-background">
            <div className="border-b p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">{t("stockBalance.batchList")}</h3>
            </div>
            {batches.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              <div className="divide-y">
                {batches.map((batch) => (
                  <BatchRow key={batch.id} batch={batch} unit={item.unit} canAdjust={canAdjust} onAdjust={() => setAdjustingBatch(batch)} />
                ))}
              </div>
            )}
          </div>

          {/* Stock In history */}
          <div className="rounded-lg border bg-background">
            <div className="border-b p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <PackagePlus className="h-4 w-4" /> {t("stockBalance.stockInHistory")}
              </h3>
            </div>
            {stockIns.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("stockBalance.noStockInHistory")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <th className="px-4 py-2">{t("stockIn.colReference")}</th>
                      <th className="px-4 py-2">{t("stockIn.coldateRaised")}</th>
                      <th className="px-4 py-2">{t("stockIn.colProject")}</th>
                      <th className="px-4 py-2">{t("stockIn.qty")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockIns.map((si) => (
                      <tr key={si.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium">
                          <Link to={`/inventory/stock-in/${si.id}`} className="text-primary hover:underline">
                            {si.prNo}
                          </Link>
                        </td>
                        <td className="px-4 py-2">{si.dateRaised}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {si.projectRef?.code} / {si.costCentre?.code} / {si.costCode?.code}
                        </td>
                        <td className="px-4 py-2 font-semibold text-blue-700">
                          +{si.items[0]?.qty ?? 0} {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stock Out history */}
          <div className="rounded-lg border bg-background">
            <div className="border-b p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <PackageMinus className="h-4 w-4" /> {t("stockBalance.stockOutHistory")}
              </h3>
            </div>
            {stockOuts.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("stockBalance.noStockOutHistory")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <th className="px-4 py-2">{t("stockOut.colReference")}</th>
                      <th className="px-4 py-2">{t("stockOut.colDateIssued")}</th>
                      <th className="px-4 py-2">{t("stockOut.colProject")}</th>
                      <th className="px-4 py-2">{t("stockOut.sourceBreakdown")}</th>
                      <th className="px-4 py-2">{t("stockIn.qty")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockOuts.map((so) => (
                      <tr key={so.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium">
                          <Link to={`/inventory/stock-out/${so.id}`} className="text-primary hover:underline">
                            {so.bNo}
                          </Link>
                        </td>
                        <td className="px-4 py-2">{so.dateIssued}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {so.projectRef?.code} / {so.costCentre?.code} / {so.costCode?.code}
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {so.items[0]?.allocations.map((a, i) => (
                            <div key={i}>
                              ↳ {a.qty} {item.unit} ({a.projectRef?.code ?? "-"} / {a.costCentre?.code ?? "-"} / {a.costCode?.code ?? "-"})
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-2 font-semibold text-amber-700">
                          -{so.items[0]?.qty ?? 0} {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar kanan: riwayat koreksi manual */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <AdjustmentLogTimeline logs={adjustmentLogs} unit={item.unit} />
          </div>
        </div>
      </div>

      {canAdjust && <AdjustStockLotDialog batch={adjustingBatch} onOpenChange={(open) => !open && setAdjustingBatch(null)} />}
    </div>
  );
}

function BatchRow({
  batch,
  unit,
  canAdjust,
  onAdjust,
}: {
  batch: StockBatch;
  unit: string;
  canAdjust: boolean;
  onAdjust: () => void;
}) {
  const { t } = useTranslation();
  const isFromPo = Boolean(batch.sourceStockIn);

  return (
    <div className={cn("p-4", batch.isDepleted && "bg-muted/30 opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{batch.projectName}</p>
          <p className="text-xs text-muted-foreground">
            {batch.projectRef?.code} / {batch.costCentre?.code} / {batch.costCode?.code}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {batch.qtyRemaining} <span className="font-normal text-muted-foreground">/ {batch.qtyReceived} {unit}</span>
          </p>
          {batch.isDepleted && (
            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {t("stockBalance.batchDepleted")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        {isFromPo ? (
          <Link
            to={`/inventory/stock-in/${batch.sourceStockIn?.id}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {t("stockBalance.fromPo", { ref: batch.sourceStockIn?.prNo })}
          </Link>
        ) : (
          <div className="flex items-center gap-1 text-xs text-amber-700">
            <ShieldAlert className="h-3 w-3" />
            <span>
              {t("stockBalance.notFromPo")}
              {batch.reason ? ` — "${batch.reason}"` : ""}
            </span>
          </div>
        )}

        {canAdjust && !isFromPo && (
          <Button variant="ghost" size="icon" title={t("stockBalance.adjustButton")} onClick={onAdjust}>
            <Pencil className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}

function AdjustmentLogTimeline({ logs, unit }: { logs: StockBatchAdjustmentLog[]; unit: string }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="mb-3 text-sm font-semibold">{t("stockBalance.adjustmentHistory")}</p>

      {logs.length === 0 && <p className="text-xs text-muted-foreground">{t("stockBalance.adjustmentHistoryEmpty")}</p>}

      {logs.length > 0 && (
        <ol className="space-y-4">
          {logs.map((log, index) => {
            const delta = log.newQtyRemaining - log.oldQtyRemaining;
            return (
              <li key={log.id} className="relative pl-6">
                {index < logs.length - 1 && <span className="absolute left-[7px] top-5 h-full w-px bg-border" aria-hidden />}
                <span className="absolute left-0 top-0.5">
                  <Pencil className="h-4 w-4 text-amber-600" />
                </span>

                <div className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{t("stockBalance.logCorrection")}</span>
                    <span className={cn("font-semibold", delta >= 0 ? "text-emerald-700" : "text-destructive")}>
                      {log.oldQtyRemaining} → {log.newQtyRemaining} {unit} ({delta >= 0 ? "+" : ""}
                      {delta})
                    </span>
                  </div>
                  {log.stockBatch && (
                    <p className="text-xs text-muted-foreground">
                      {log.stockBatch.projectName} ({log.stockBatch.projectRef} / {log.stockBatch.costCentre} / {log.stockBatch.costCode})
                    </p>
                  )}
                  <p className="mt-1 rounded border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs italic text-destructive">
                    “{log.reason}”
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.user?.name ?? t("stockIn.activityLogSystem")} ·{" "}
                  {new Date(log.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  color,
  label,
  value,
  highlight,
}: {
  icon: typeof PackagePlus;
  color: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border bg-background p-5", highlight && "border-primary/40 bg-primary/5")}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("rounded-full p-2", color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
