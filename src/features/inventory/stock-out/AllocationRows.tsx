import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useWatch, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect, type SearchableOption } from "@/components/common/SearchableSelect";
import { useItemLots } from "./useItemLots";
import type { StockOutFormValues } from "./stockOutFormSchema";
import type { StockOutAllocation, StockLot } from "@/types/inventory.types";

interface AllocationRowsProps {
  control: Control<StockOutFormValues>;
  itemIndex: number;
  itemId?: string;
  initialAllocations?: StockOutAllocation[]; // buat prefill label pas mode edit
}

// Bikin key unik per kombinasi lot, dipakai sebagai `value` di SearchableSelect
// karena form kita simpan projectRefId/costCentreId/costCodeId terpisah, bukan 1 lotId.
function lotKey(projectRefId?: string, costCentreId?: string, costCodeId?: string) {
  if (!projectRefId || !costCentreId || !costCodeId) return undefined;
  return `${projectRefId}::${costCentreId}::${costCodeId}`;
}

export function AllocationRows({ control, itemIndex, itemId, initialAllocations }: AllocationRowsProps) {
  const { t } = useTranslation();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `items.${itemIndex}.allocations`,
  });

  const { data: lots, isLoading: isLoadingLots } = useItemLots(itemId);

  const totalQty = (
    useWatch({ control, name: `items.${itemIndex}.allocations` }) ?? []
  ).reduce((sum, a) => sum + (Number(a?.qty) || 0), 0);

  // Kalau item diganti (bukan pas mount pertama), lot lama sudah gak relevan —
  // reset alokasi biar user gak ketinggalan projectRef/costCentre/costCode dari item sebelumnya.
  const prevItemId = useRef(itemId);
  useEffect(() => {
    if (prevItemId.current !== undefined && prevItemId.current !== itemId) {
      replace([{ projectRefId: "", costCentreId: "", costCodeId: "", qty: 1 }]);
    }
    prevItemId.current = itemId;
  }, [itemId, replace]);

  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{t("stockOut.sourceStock", { total: totalQty })}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!itemId}
          onClick={() => append({ projectRefId: "", costCentreId: "", costCodeId: "", qty: 1 })}
        >
          <Plus className="h-3.5 w-3.5" /> {t("stockOut.addSource")}
        </Button>
      </div>

      {!itemId ? (
        <p className="py-3 text-center text-xs text-muted-foreground">{t("stockOut.selectItemFirst")}</p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, allocIndex) => (
            <AllocationRow
              key={field.id}
              control={control}
              itemIndex={itemIndex}
              allocIndex={allocIndex}
              lots={lots ?? []}
              isLoadingLots={isLoadingLots}
              initialLabels={initialAllocations?.[allocIndex]}
              onRemove={fields.length > 1 ? () => remove(allocIndex) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AllocationRow({
  control,
  itemIndex,
  allocIndex,
  lots,
  isLoadingLots,
  initialLabels,
  onRemove,
}: {
  control: Control<StockOutFormValues>;
  itemIndex: number;
  allocIndex: number;
  lots: StockLot[];
  isLoadingLots: boolean;
  initialLabels?: StockOutAllocation;
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const projectRefId = useWatch({ control, name: `items.${itemIndex}.allocations.${allocIndex}.projectRefId` });
  const costCentreId = useWatch({ control, name: `items.${itemIndex}.allocations.${allocIndex}.costCentreId` });
  const costCodeId = useWatch({ control, name: `items.${itemIndex}.allocations.${allocIndex}.costCodeId` });

  // Saldo ditampilkan dari data lot yang sudah di-fetch (bukan query terpisah lagi).
  const [selectedBalance, setSelectedBalance] = useState<number | undefined>(undefined);

  const currentKey = lotKey(projectRefId, costCentreId, costCodeId);

  // Kalau row ini datang dari mode edit, cocokkan ke lot yang match biar saldo kelihatan dari awal.
  useEffect(() => {
    if (currentKey && lots.length > 0) {
      const match = lots.find((l) => lotKey(l.projectRefId, l.costCentreId, l.costCodeId) === currentKey);
      if (match) setSelectedBalance(match.balance);
    }
  }, [currentKey, lots]);

  const fetchLotOptions = async (search: string): Promise<SearchableOption[]> => {
    const q = search.trim().toLowerCase();
    return lots
      .filter((lot) => {
        if (!q) return true;
        return (
          lot.projectRef?.code?.toLowerCase().includes(q) ||
          lot.costCentre?.code?.toLowerCase().includes(q) ||
          lot.costCode?.code?.toLowerCase().includes(q)
        );
      })
      .map((lot) => ({
        value: lotKey(lot.projectRefId, lot.costCentreId, lot.costCodeId) as string,
        label: `${lot.projectRef?.code ?? "-"} / ${lot.costCentre?.code ?? "-"} / ${lot.costCode?.code ?? "-"}`,
        sublabel: t("stockOut.remainingBalance", { balance: lot.balance }),
        disabled: lot.balance <= 0,
        disabledHint: "stockOut.lotEmptyHint",
        raw: lot,
      }));
  };

  const initialLabel =
    initialLabels?.projectRef?.code && initialLabels?.costCentre?.code && initialLabels?.costCode?.code
      ? `${initialLabels.projectRef.code} / ${initialLabels.costCentre.code} / ${initialLabels.costCode.code}`
      : undefined;

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:items-start">
        <div className="col-span-2 sm:col-span-8">
          <Controller
            control={control}
            name={`items.${itemIndex}.allocations.${allocIndex}.projectRefId`}
            render={({ field: refField }) => (
              <Controller
                control={control}
                name={`items.${itemIndex}.allocations.${allocIndex}.costCentreId`}
                render={({ field: centreField }) => (
                  <Controller
                    control={control}
                    name={`items.${itemIndex}.allocations.${allocIndex}.costCodeId`}
                    render={({ field: codeField }) => (
                      <SearchableSelect
                        value={currentKey}
                        onChange={(_val, option) => {
                          const lot = option?.raw as StockLot | undefined;
                          if (!lot) return;
                          refField.onChange(lot.projectRefId);
                          centreField.onChange(lot.costCentreId);
                          codeField.onChange(lot.costCodeId);
                          setSelectedBalance(lot.balance);
                        }}
                        fetchOptions={fetchLotOptions}
                        selectedLabel={initialLabel}
                        placeholder={isLoadingLots ? t("common.loading") : t("stockOut.selectLot")}
                      />
                    )}
                  />
                )}
              />
            )}
          />
        </div>
        <div className="col-span-1 sm:col-span-3">
          <Controller
            control={control}
            name={`items.${itemIndex}.allocations.${allocIndex}.qty`}
            render={({ field }) => (
              <Input type="number" step="any" placeholder={t("stockIn.qty")} {...field} />
            )}
          />
        </div>
        <div className="col-span-1 sm:col-span-1 flex justify-end sm:block">
          {onRemove && (
            <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
      {selectedBalance !== undefined && (
        <p className="pl-1 text-xs text-muted-foreground">
          {t("stockOut.remainingBalance", { balance: selectedBalance })}
        </p>
      )}
    </div>
  );
}