import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useWatch, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BatchPickerModal } from "./BatchPickerModal";
import { useItemBatches } from "./useItemBatches";
import type { StockOutEditFormValues, StockOutEditFormInput } from "./stockOutFormSchema";
import type { StockOutAllocation } from "@/types/inventory.types";

interface AllocationRowsProps {
  control: Control<StockOutEditFormInput, unknown, StockOutEditFormValues>;
  itemIndex: number;
  itemId?: string;
  initialAllocations?: StockOutAllocation[];
}

export function AllocationRows({ control, itemIndex, itemId, initialAllocations }: AllocationRowsProps) {
  const { t } = useTranslation();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `items.${itemIndex}.allocations`,
  });

  const { data: batches, isLoading: isLoadingBatches } = useItemBatches(itemId);

  const allocations = useWatch({ control, name: `items.${itemIndex}.allocations` }) ?? [];
  const totalQty = allocations.reduce((sum, a) => sum + (Number(a?.qty) || 0), 0);

  const allUsedBatchIds = allocations.map((a) => a?.stockBatchId).filter((id): id is string => !!id);

  const prevItemId = useRef(itemId);
  useEffect(() => {
    if (prevItemId.current !== undefined && prevItemId.current !== itemId) {
      replace([{ stockBatchId: "", qty: 1 }]);
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
          onClick={() => append({ stockBatchId: "", qty: 1 })}
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
              batches={batches ?? []}
              isLoadingBatches={isLoadingBatches}
              initialLabel={initialAllocations?.[allocIndex]}
              usedBatchIds={allUsedBatchIds}
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
  batches,
  isLoadingBatches,
  initialLabel,
  usedBatchIds,
  onRemove,
}: {
  control: Control<StockOutEditFormInput, unknown, StockOutEditFormValues>;
  itemIndex: number;
  allocIndex: number;
  batches: import("@/types/inventory.types").StockBatch[];
  isLoadingBatches: boolean;
  initialLabel?: StockOutAllocation;
  usedBatchIds: string[];
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const stockBatchId = useWatch({ control, name: `items.${itemIndex}.allocations.${allocIndex}.stockBatchId` });

  const currentBatch = batches.find((b) => b.id === stockBatchId);
  const fallbackLabel = initialLabel?.batch
    ? `${initialLabel.batch.projectName} (${initialLabel.projectRef?.code ?? "-"} / ${initialLabel.costCentre?.code ?? "-"} / ${initialLabel.costCode?.code ?? "-"})`
    : undefined;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 w-full min-w-0">
        
        <div className="flex-1 min-w-0">
          <Controller
            control={control}
            name={`items.${itemIndex}.allocations.${allocIndex}.stockBatchId`}
            render={({ field }) => (
              <BatchPickerModal
                batches={batches}
                isLoading={isLoadingBatches}
                value={field.value}
                selectedLabel={fallbackLabel}
                usedBatchIds={usedBatchIds}
                onChange={(batch) => field.onChange(batch.id)}
              />
            )}
          />
        </div>

        <div className="w-20 sm:w-36 shrink-0">
          <Controller
            control={control}
            name={`items.${itemIndex}.allocations.${allocIndex}.qty`}
            render={({ field }) => (
              <Input
                type="number"
                step="any"
                placeholder={t("stockIn.qty")}
                {...field}
                value={(field.value as string | number | undefined) ?? ""}
              />
            )}
          />
        </div>

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {currentBatch && (
        <p className="pl-1 text-xs text-muted-foreground">
          {t("stockOut.remainingBalance", { balance: currentBatch.qtyRemaining })}
        </p>
      )}
    </div>
  );
}