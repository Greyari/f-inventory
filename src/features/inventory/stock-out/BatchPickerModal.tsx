import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Check, Loader2, ChevronDown, ExternalLink, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { StockBatch } from "@/types/inventory.types";

interface BatchPickerModalProps {
  batches: StockBatch[];
  isLoading: boolean;
  value?: string; // stockBatchId yang lagi kepilih di baris ini
  onChange: (batch: StockBatch) => void;
  selectedLabel?: string; // fallback label pas mode edit sebelum data batch ke-load
  disabled?: boolean;
  // stockBatchId yang udah dipakai di baris LAIN — biar gak ada 2 baris
  // "Sumber Stok" yang narik dari batch yang sama.
  usedBatchIds?: string[];
}

export function BatchPickerModal({
  batches,
  isLoading,
  value,
  onChange,
  selectedLabel,
  disabled,
  usedBatchIds = [],
}: BatchPickerModalProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentBatch = batches.find((b) => b.id === value);
  const currentLabel = currentBatch
    ? `${currentBatch.projectName} (${currentBatch.projectRef?.code ?? "-"} / ${currentBatch.costCentre?.code ?? "-"} / ${currentBatch.costCode?.code ?? "-"})`
    : selectedLabel;

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter(
      (b) =>
        b.projectName.toLowerCase().includes(q) ||
        b.projectRef?.code?.toLowerCase().includes(q) ||
        b.costCentre?.code?.toLowerCase().includes(q) ||
        b.costCode?.code?.toLowerCase().includes(q) ||
        b.sourceStockIn?.prNo?.toLowerCase().includes(q)
    );
  }, [batches, search]);

  const handlePick = (batch: StockBatch, isUsedElsewhere: boolean) => {
    if (batch.qtyRemaining <= 0 || isUsedElsewhere) return;
    onChange(batch);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <span className="truncate text-left">
          {currentLabel ? (
            <span className="font-medium">{currentLabel}</span>
          ) : (
            <span className="text-muted-foreground">{isLoading ? t("common.loading") : t("stockOut.selectLot")}</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={t("stockOut.selectBatch")} className="max-w-4xl">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${t("common.search")}...`}
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="max-h-96 overflow-y-auto rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="sticky top-0 border-b bg-muted text-left text-xs uppercase text-muted-foreground">
                    <th className="px-3 py-2">{t("stockOut.batchProject")}</th>
                    <th className="px-3 py-2">{t("stockOut.batchSource")}</th>
                    <th className="px-3 py-2">{t("stockBalance.colBalanceHere")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => {
                    const isEmpty = batch.qtyRemaining <= 0;
                    const isCurrent = batch.id === value;
                    const isUsedElsewhere = usedBatchIds.includes(batch.id) && !isCurrent;
                    const isDisabled = isEmpty || isUsedElsewhere;

                    return (
                      <tr
                        key={batch.id}
                        onClick={() => handlePick(batch, isUsedElsewhere)}
                        className={cn(
                          "border-b last:border-0",
                          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted"
                        )}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5 font-medium">
                            {isCurrent && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                            {batch.projectName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {batch.projectRef?.code} / {batch.costCentre?.code} / {batch.costCode?.code}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {batch.sourceStockIn ? (
                            <span className="inline-flex items-center gap-1 text-xs text-primary">
                              <ExternalLink className="h-3 w-3" /> {batch.sourceStockIn.prNo}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                              <ShieldAlert className="h-3 w-3" /> {t("stockOut.batchDirect")}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {isEmpty ? (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                              {t("stockOut.lotEmptyHintLabel")}
                            </span>
                          ) : isUsedElsewhere ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-700">
                              {t("stockOut.lotAlreadyUsedLabel")}
                            </span>
                          ) : (
                            batch.qtyRemaining
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
