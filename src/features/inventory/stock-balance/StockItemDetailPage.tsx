import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, PackagePlus, PackageMinus, Boxes, Loader2, Pencil, ShieldAlert, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useItemStockHistory } from "./stock-balance.hooks";
import { useHasPermission } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { AdjustStockLotDialog } from "./AdjustStockLotDialog";
import type { StockLot, StockLotAdjustmentLog } from "@/types/inventory.types";

export default function StockItemDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const { data, isLoading } = useItemStockHistory(itemId);
  const canAdjust = useHasPermission("stock-lots.adjust");
  const [adjustingLot, setAdjustingLot] = useState<StockLot | null>(null);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const { item, totalIn, totalOut, totalManualAdjustment, balance, lots, stockIns, stockOuts, adjustmentLogs } = data;

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate("/inventory/stock-balance")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("stockBalance.backToList")}
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {item.itemName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {item.category} · {t("item.unit")}: {item.unit}
        </p>
      </div>

      {/* Summary cards */}
      <div className={cn("mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3", totalManualAdjustment !== 0 && "lg:grid-cols-4")}>
        <SummaryCard
          icon={PackagePlus}
          color="text-blue-600 bg-blue-100"
          label={t("stockBalance.totalIn")}
          value={`${totalIn} ${item.unit}`}
        />
        <SummaryCard
          icon={PackageMinus}
          color="text-amber-600 bg-amber-100"
          label={t("stockBalance.totalOut")}
          value={`${totalOut} ${item.unit}`}
        />
        {totalManualAdjustment !== 0 && (
          <SummaryCard
            icon={ShieldAlert}
            color="text-purple-600 bg-purple-100"
            label={t("stockBalance.totalManualAdjustment")}
            value={`${totalManualAdjustment > 0 ? "+" : ""}${totalManualAdjustment} ${item.unit}`}
          />
        )}
        <SummaryCard
          icon={Boxes}
          color="text-green-600 bg-green-100"
          label={t("stockBalance.currentBalance")}
          value={`${balance} ${item.unit}`}
          highlight
        />
      </div>

      {/* Lot breakdown */}
      <div className="mb-6 rounded-lg border bg-background">
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("stockBalance.lotBreakdown")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2">{t("stockIn.projectRef")}</th>
                <th className="px-4 py-2">{t("stockIn.costCentre")}</th>
                <th className="px-4 py-2">{t("stockIn.costCode")}</th>
                <th className="px-4 py-2">{t("stockBalance.colBalanceHere")}</th>
                {canAdjust && <th className="px-4 py-2 text-right">{t("common.actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    <div className="font-medium">{lot.projectRef?.code}</div>
                    <div className="text-xs text-muted-foreground">{lot.projectRef?.description}</div>
                  </td>
                  <td className="px-4 py-2">{lot.costCentre?.code}</td>
                  <td className="px-4 py-2">{lot.costCode?.code}</td>
                  <td className="px-4 py-2 font-semibold">
                    {lot.balance} {item.unit}
                  </td>
                  {canAdjust && (
                    <td className="px-4 py-2 text-right">
                      <Button variant="ghost" size="icon" title={t("stockBalance.adjustButton")} onClick={() => setAdjustingLot(lot)}>
                        <Pencil className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual adjustment / direct addition history */}
      {adjustmentLogs.length > 0 && (
        <div className="mb-6 rounded-lg border bg-background">
          <div className="border-b p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-destructive" /> {t("stockBalance.adjustmentHistory")}
            </h3>
          </div>
          <div className="divide-y">
            {adjustmentLogs.map((log) => (
              <AdjustmentLogRow key={log.id} log={log} unit={item.unit} />
            ))}
          </div>
        </div>
      )}

      {/* Stock In history */}
      <div className="mb-6 rounded-lg border bg-background">
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
                  <th className="px-4 py-2">{t("stockIn.colDateReceived")}</th>
                  <th className="px-4 py-2">{t("stockIn.colProject")}</th>
                  <th className="px-4 py-2">{t("stockIn.qty")}</th>
                </tr>
              </thead>
              <tbody>
                {stockIns.map((si) => (
                  <tr key={si.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{si.prNo}</td>
                    <td className="px-4 py-2">{si.dateReceived}</td>
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
                    <td className="px-4 py-2 font-medium">{so.bNo}</td>
                    <td className="px-4 py-2">{so.dateIssued}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {so.projectRef?.code} / {so.costCentre?.code} / {so.costCode?.code}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {so.items[0]?.allocations.map((a, i) => (
                        <div key={i}>
                          ↳ {a.qty} {item.unit} ({a.projectRef?.code ?? "-"} / {a.costCentre?.code ?? "-"} /{" "}
                          {a.costCode?.code ?? "-"})
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

      {canAdjust && <AdjustStockLotDialog lot={adjustingLot} onOpenChange={(open) => !open && setAdjustingLot(null)} />}
    </div>
  );
}

function AdjustmentLogRow({ log, unit }: { log: StockLotAdjustmentLog; unit: string }) {
  const { t } = useTranslation();
  const delta = log.newBalance - log.oldBalance;
  const isDirectAddition = log.type === "direct_addition";

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          {isDirectAddition ? (
            <PlusCircle className="h-4 w-4 text-emerald-600" />
          ) : (
            <Pencil className="h-4 w-4 text-amber-600" />
          )}
          <span className="font-medium">
            {isDirectAddition ? t("stockBalance.logDirectAddition") : t("stockBalance.logCorrection")}
          </span>
          {log.stockLot && (
            <span className="text-xs text-muted-foreground">
              ({log.stockLot.projectRef} / {log.stockLot.costCentre} / {log.stockLot.costCode})
            </span>
          )}
        </div>
        <span className={cn("text-sm font-semibold", delta >= 0 ? "text-emerald-700" : "text-destructive")}>
          {log.oldBalance} → {log.newBalance} {unit} ({delta >= 0 ? "+" : ""}
          {delta})
        </span>
      </div>
      <p className="mt-1.5 rounded border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs italic text-destructive">
        “{log.reason}”
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {log.user?.name ?? t("stockIn.activityLogSystem")} · {new Date(log.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
      </p>
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