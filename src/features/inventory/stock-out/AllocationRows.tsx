import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useWatch, type Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { fetchJobCodeOptions } from "@/lib/selectOptions";
import { useLotBalance } from "./useLotBalance";
import type { StockOutFormValues } from "./stockOutFormSchema";

interface AllocationRowsProps {
  control: Control<StockOutFormValues>;
  itemIndex: number;
  itemId?: string;
}

export function AllocationRows({ control, itemIndex, itemId }: AllocationRowsProps) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `items.${itemIndex}.allocations`,
  });

  const totalQty = (
    useWatch({ control, name: `items.${itemIndex}.allocations` }) ?? []
  ).reduce((sum, a) => sum + (Number(a?.qty) || 0), 0);

  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{t("stockOut.sourceStock", { total: totalQty })}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ projectRefId: "", costCentreId: "", costCodeId: "", qty: 1 })}
        >
          <Plus className="h-3.5 w-3.5" /> {t("stockOut.addSource")}
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, allocIndex) => (
          <AllocationRow
            key={field.id}
            control={control}
            itemIndex={itemIndex}
            allocIndex={allocIndex}
            itemId={itemId}
            onRemove={fields.length > 1 ? () => remove(allocIndex) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function AllocationRow({
  control,
  itemIndex,
  allocIndex,
  itemId,
  onRemove,
}: {
  control: Control<StockOutFormValues>;
  itemIndex: number;
  allocIndex: number;
  itemId?: string;
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const projectRefId = useWatch({ control, name: `items.${itemIndex}.allocations.${allocIndex}.projectRefId` });
  const costCentreId = useWatch({ control, name: `items.${itemIndex}.allocations.${allocIndex}.costCentreId` });
  const costCodeId = useWatch({ control, name: `items.${itemIndex}.allocations.${allocIndex}.costCodeId` });

  const { data: balance, isFetching } = useLotBalance(itemId, projectRefId, costCentreId, costCodeId);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:items-start">
        <div className="col-span-2 sm:col-span-3">
          <Controller
            control={control}
            name={`items.${itemIndex}.allocations.${allocIndex}.projectRefId`}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                fetchOptions={fetchJobCodeOptions}
                placeholder={t("stockOut.projectRef")}
              />
            )}
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <Controller
            control={control}
            name={`items.${itemIndex}.allocations.${allocIndex}.costCentreId`}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                fetchOptions={fetchJobCodeOptions}
                placeholder={t("stockOut.costCentre")}
              />
            )}
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <Controller
            control={control}
            name={`items.${itemIndex}.allocations.${allocIndex}.costCodeId`}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                fetchOptions={fetchJobCodeOptions}
                placeholder={t("stockOut.costCodeSource")}
              />
            )}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Controller
            control={control}
            name={`items.${itemIndex}.allocations.${allocIndex}.qty`}
            render={({ field }) => (
              <Input type="number" step="any" placeholder={t("stockIn.qty")} {...field} />
            )}
          />
        </div>
        <div className="col-span-2 sm:col-span-1 flex justify-end sm:block">
          {onRemove && (
            <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
      {itemId && projectRefId && costCentreId && costCodeId && (
        <p className="pl-1 text-xs text-muted-foreground">
          {isFetching ? t("stockOut.checkingBalance") : t("stockOut.remainingBalance", { balance: balance ?? 0 })}
        </p>
      )}
    </div>
  );
}
