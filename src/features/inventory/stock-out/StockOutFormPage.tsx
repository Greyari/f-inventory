import { useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { fetchItemOptions, fetchJobCodeOptions } from "@/lib/selectOptions";
import { useCreateStockOut, useUpdateStockOut, useStockOutDetail } from "./stock-out.hooks";
import { AllocationRows } from "./AllocationRows";
import { stockOutSchema, emptyStockOutValues, valuesFromStockOut, type StockOutFormValues } from "./stockOutFormSchema";
import type { StockOut } from "@/types/inventory.types";

export default function StockOutFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: editingData, isLoading: isLoadingDetail } = useStockOutDetail(id);
  const createMutation = useCreateStockOut();
  const updateMutation = useUpdateStockOut();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
    if (isEdit && editingData) reset(valuesFromStockOut(editingData));
  }, [isEdit, editingData, reset]);

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
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    navigate("/inventory/stock-out");
  };

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate("/inventory/stock-out")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {isEdit ? `${t("common.edit")} — ${t("stockOut.formTitle")}` : t("stockOut.formTitle")}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border bg-background p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("stockOut.referenceNo")}</Label>
            <Input {...register("referenceNo")} placeholder="e.g. SO-2026-0031" />
            {errors.referenceNo && <p className="mt-1 text-xs text-destructive">{errors.referenceNo.message}</p>}
          </div>
          <div>
            <Label>{t("stockOut.dateIssued")}</Label>
            <Input type="date" {...register("dateIssued")} />
          </div>

          <div>
            <Label>{t("stockOut.approvedBy")}</Label>
            <Input {...register("approvedBy")} placeholder={t("stockOut.approvedByPlaceholder")} />
            {errors.approvedBy && <p className="mt-1 text-xs text-destructive">{errors.approvedBy.message}</p>}
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
            {errors.projectName && <p className="mt-1 text-xs text-destructive">{errors.projectName.message}</p>}
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
                  selectedLabel={editingData?.projectRef?.code}
                  selectedSublabel={editingData?.projectRef?.description}
                  error={!!errors.projectRefId}
                  placeholder={t("common.selectCode")}
                />
              )}
            />
            {errors.projectRefId && <p className="mt-1 text-xs text-destructive">{errors.projectRefId.message}</p>}
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
                  selectedLabel={editingData?.costCentre?.code}
                  selectedSublabel={editingData?.costCentre?.description}
                  error={!!errors.costCentreId}
                  placeholder={t("common.selectCode")}
                />
              )}
            />
            {errors.costCentreId && <p className="mt-1 text-xs text-destructive">{errors.costCentreId.message}</p>}
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
                  selectedLabel={editingData?.costCode?.code}
                  selectedSublabel={editingData?.costCode?.description}
                  error={!!errors.costCodeId}
                  placeholder={t("common.selectCode")}
                />
              )}
            />
            {errors.costCodeId && <p className="mt-1 text-xs text-destructive">{errors.costCodeId.message}</p>}
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
                editingItem={editingData?.items[index]}
                onRemove={fields.length > 1 ? () => remove(index) : undefined}
                error={errors.items?.[index]?.itemId?.message}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/inventory/stock-out")}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ItemRow({
  control,
  index,
  editingItem,
  onRemove,
  error,
}: {
  control: ReturnType<typeof useForm<StockOutFormValues>>["control"];
  index: number;
  editingItem?: StockOut["items"][number];
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
              selectedLabel={editingItem?.item?.itemCode}
              selectedSublabel={editingItem?.item?.itemName}
              placeholder={t("common.selectItem")}
              error={!!error}
            />
          )}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      <AllocationRows control={control} itemIndex={index} itemId={itemId} initialAllocations={editingItem?.allocations} />
    </div>
  );
}