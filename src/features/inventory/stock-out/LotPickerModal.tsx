import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Check, Loader2, ChevronDown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { StockLot } from "@/types/inventory.types";

interface LotPickerModalProps {
  lots: StockLot[];
  isLoading: boolean;
  value?: string;
  onChange: (lot: StockLot) => void;
  selectedLabel?: string;
  disabled?: boolean;
  // Kumpulan lotKey yang sudah dipakai di baris LAIN (bukan baris ini) —
  // biar gak ada 2 baris "Sumber Stok" yang milih lot yang sama.
  usedKeys?: string[];
}

function lotKey(lot: StockLot) {
  return `${lot.projectRefId}::${lot.costCentreId}::${lot.costCodeId}`;
}

export function LotPickerModal({
  lots,
  isLoading,
  value,
  onChange,
  selectedLabel,
  disabled,
  usedKeys = [],
}: LotPickerModalProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentLot = lots.find((l) => lotKey(l) === value);
  const currentLabel = currentLot
    ? `${currentLot.projectRef?.code ?? "-"} / ${currentLot.costCentre?.code ?? "-"} / ${currentLot.costCode?.code ?? "-"}`
    : selectedLabel;

  const filteredLots = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lots;
    return lots.filter(
      (lot) =>
        lot.projectRef?.code?.toLowerCase().includes(q) ||
        lot.projectRef?.description?.toLowerCase().includes(q) ||
        lot.costCentre?.code?.toLowerCase().includes(q) ||
        lot.costCode?.code?.toLowerCase().includes(q)
    );
  }, [lots, search]);

  const handlePick = (lot: StockLot, isUsedElsewhere: boolean) => {
    if (lot.balance <= 0 || isUsedElsewhere) return;
    onChange(lot);
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
            <span className="text-muted-foreground">
              {isLoading ? t("common.loading") : t("stockOut.selectLot")}
            </span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={t("stockOut.selectLot")} className="max-w-3xl">
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
            ) : filteredLots.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="sticky top-0 border-b bg-muted text-left text-xs uppercase text-muted-foreground">
                    <th className="px-3 py-2">{t("stockOut.projectRef")}</th>
                    <th className="px-3 py-2">{t("stockOut.costCentre")}</th>
                    <th className="px-3 py-2">{t("stockOut.costCodeSource")}</th>
                    <th className="px-3 py-2">{t("stockBalance.colBalanceHere")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLots.map((lot) => {
                    const key = lotKey(lot);
                    const isEmpty = lot.balance <= 0;
                    const isCurrent = key === value;
                    // Dipakai di baris lain, dan BUKAN yang lagi kepilih di baris ini sendiri
                    const isUsedElsewhere = usedKeys.includes(key) && !isCurrent;
                    const isDisabled = isEmpty || isUsedElsewhere;

                    return (
                      <tr
                        key={key}
                        onClick={() => handlePick(lot, isUsedElsewhere)}
                        className={cn(
                          "border-b last:border-0",
                          isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted"
                        )}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5 font-medium">
                            {isCurrent && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                            {lot.projectRef?.code ?? "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">{lot.projectRef?.description}</div>
                        </td>
                        <td className="px-3 py-2">{lot.costCentre?.code ?? "-"}</td>
                        <td className="px-3 py-2">{lot.costCode?.code ?? "-"}</td>
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
                            lot.balance
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