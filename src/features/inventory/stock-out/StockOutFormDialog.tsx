import { useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { fetchItemOptions, fetchJobCodeOptions } from "@/lib/selectOptions";
import { useCreateStockOut } from "./stock-out.hooks";
import { AllocationRows } from "./AllocationRows";
import { stockOutSchema, emptyStockOutValues, type StockOutFormValues } from "./stockOutFormSchema";

interface StockOutFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockOutFormDialog({ open, onOpenChange }: StockOutFormDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateStockOut();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockOutFormValues>({
    resolver: zodResolver(stockOutSchema),
    defaultValues: emptyStockOutValues(),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (open) reset(emptyStockOutValues());
  }, [open, reset]);

  const onSubmit = async (values: StockOutFormValues) => {
    // qty per item = jumlah semua alokasinya, biar selalu konsisten (sesuai validasi backend)
    const payload = {
      ...values,
      items: values.items.map((item) => ({
        itemId: item.itemId,
        qty: item.allocations.reduce((sum, a) => sum + Number(a.qty), 0),
        allocations: item.allocations,
      })),
    };
    await createMutation.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t("stockOut.formTitle")} className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("stockOut.referenceNo")}</Label>
              <Input {...register("referenceNo")} placeholder="e.g. SO-2026-0031" />
              {errors.referenceNo && (
                <p className="mt-1 text-xs text-destructive">{errors.referenceNo.message}</p>
              )}
            </div>
            <div>
              <Label>{t("stockOut.dateIssued")}</Label>
              <Input type="date" {...register("dateIssued")} />
            </div>

            <div>
              <Label>{t("stockOut.approvedBy")}</Label>
              <Input {...register("approvedBy")} placeholder={t("stockOut.approvedByPlaceholder")} />
              {errors.approvedBy && (
                <p className="mt-1 text-xs text-destructive">{errors.approvedBy.message}</p>
              )}
            </div>
            <div>
              <Label>{t("stockOut.issuedTo")}</Label>
              <Input {...register("issuedTo")} placeholder="e.g. Tim Fabrikasi" />
            </div>

            <div className="col-span-2">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("stockOut.destinationLabel")}</p>
            </div>

            <div className="col-span-2">
              <Label>{t("stockOut.project")}</Label>
              <Input {...register("projectName")} placeholder="e.g. Batching Plant 5" />
              {errors.projectName && (
                <p className="mt-1 text-xs text-destructive">{errors.projectName.message}</p>
              )}
            </div>

            <div>
              <Label>{t("stockOut.projectRef")}</Label>
              <Controller
                control={control}
                name="projectRefId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    fetchOptions={fetchJobCodeOptions}
                    error={!!errors.projectRefId}
                    placeholder={t("common.selectCode")}
                  />
                )}
              />
              {errors.projectRefId && (
                <p className="mt-1 text-xs text-destructive">{errors.projectRefId.message}</p>
              )}
            </div>
            <div>
              <Label>{t("stockOut.costCentre")}</Label>
              <Controller
                control={control}
                name="costCentreId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    fetchOptions={fetchJobCodeOptions}
                    error={!!errors.costCentreId}
                    placeholder={t("common.selectCode")}
                  />
                )}
              />
              {errors.costCentreId && (
                <p className="mt-1 text-xs text-destructive">{errors.costCentreId.message}</p>
              )}
            </div>
            <div>
              <Label>{t("stockOut.costCodeSource")}</Label>
              <Controller
                control={control}
                name="costCodeId"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    fetchOptions={fetchJobCodeOptions}
                    error={!!errors.costCodeId}
                    placeholder={t("common.selectCode")}
                  />
                )}
              />
              {errors.costCodeId && (
                <p className="mt-1 text-xs text-destructive">{errors.costCodeId.message}</p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">{t("stockOut.itemsOut")}</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({
                    itemId: "",
                    allocations: [{ projectRefId: "", costCentreId: "", costCodeId: "", qty: 1 }],
                  })
                }
              >
                <Plus className="h-4 w-4" /> {t("stockOut.addItem")}
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <ItemRow
                  key={field.id}
                  control={control}
                  index={index}
                  onRemove={fields.length > 1 ? () => remove(index) : undefined}
                  error={errors.items?.[index]?.itemId?.message}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ItemRow({
  control,
  index,
  onRemove,
  error,
}: {
  control: ReturnType<typeof useForm<StockOutFormValues>>["control"];
  index: number;
  onRemove?: () => void;
  error?: string;
}) {
  const { t } = useTranslation();
  const itemId = useWatch({ control, name: `items.${index}.itemId` });

  return (
    <div className="rounded-md border p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {t("stockIn.items")} #{index + 1}
        </span>
        {onRemove && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      <div className="mb-3">
        <Label>{t("stockIn.items")}</Label>
        <Controller
          control={control}
          name={`items.${index}.itemId`}
          render={({ field }) => (
            <SearchableSelect
              value={field.value}
              onChange={field.onChange}
              fetchOptions={fetchItemOptions}
              placeholder={t("common.selectItem")}
              error={!!error}
            />
          )}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      <AllocationRows control={control} itemIndex={index} itemId={itemId} />
    </div>
  );
}
