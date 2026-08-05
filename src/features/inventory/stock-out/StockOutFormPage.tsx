import { useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowLeft, Loader2, Lock, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ItemPickerField } from "@/components/common/ItemPickerField";
import { useCreateStockOut, useUpdateStockOut, useStockOutDetail } from "./stock-out.hooks";
import { useHasPermission } from "@/store/authStore";
import { AllocationRows } from "./AllocationRows";
import {
  stockOutSchema,
  stockOutEditSchema,
  emptyStockOutValues,
  valuesFromStockOut,
  type StockOutFormValues,
  type StockOutEditFormValues,
} from "./stockOutFormSchema";
import type { StockOut } from "@/types/inventory.types";
import { JobCodePickerField } from "@/components/common/JobCodePickerField";

type FormValues = StockOutFormValues | StockOutEditFormValues;

export default function StockOutFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const canOverride = useHasPermission("stock-out.override");

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
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? stockOutEditSchema : stockOutSchema),
    defaultValues: emptyStockOutValues(),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (isEdit && editingData) reset(valuesFromStockOut(editingData));
  }, [isEdit, editingData, reset]);

  const onSubmit = async (values: FormValues) => {
    // qty per item = jumlah semua alokasinya, biar selalu konsisten (sesuai validasi backend)
    const items = values.items.map((item) => ({
      itemId: item.itemId,
      qty: item.allocations.reduce((sum, a) => sum + Number(a.qty), 0),
      allocations: item.allocations,
    }));

    if (isEdit && id) {
      const { reason, ...header } = values as StockOutEditFormValues;
      await updateMutation.mutateAsync({ id, payload: { ...header, items, reason } });
    } else {
      await createMutation.mutateAsync({ ...(values as StockOutFormValues), items });
    }
    navigate(isEdit ? `/inventory/stock-out/${id}` : "/inventory/stock-out");
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
        onClick={() => navigate(isEdit ? `/inventory/stock-out/${id}` : "/inventory/stock-out")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-6 flex items-center gap-2">
        {isEdit && <ShieldAlert className="h-5 w-5 text-destructive" />}
        <h2 className="text-2xl font-semibold">
          {isEdit ? `${t("stockOut.editSuperAdmin")} — ${t("stockOut.formTitle")}` : t("stockOut.formTitle")}
        </h2>
      </div>

      {isEdit && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {t("stockOut.overrideEditWarning")}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border bg-background p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("stockOut.bNo")}</Label>
            <Input {...register("bNo")} placeholder="e.g. SO-2026-0031" />
            {errors.bNo && <p className="mt-1 text-xs text-destructive">{errors.bNo.message}</p>}
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
                <JobCodePickerField
                  value={field.value}
                  onChange={field.onChange}
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
            <Label>{t("stockOut.dateIssued")}</Label>
            <Input type="date" {...register("dateIssued")} />
          </div>

          <div>
            <Label>{t("stockOut.costCentre")}</Label>
            <Controller
              control={control}
              name="costCentreId"
              render={({ field }) => (
                <JobCodePickerField
                  value={field.value}
                  onChange={field.onChange}
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
                <JobCodePickerField
                  value={field.value}
                  onChange={field.onChange}
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
                  allocations: [{ stockBatchId: "", qty: 1 }],
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

        {isEdit && (
          <div className="border-t pt-4">
            <Label>{t("stockOut.reason")}</Label>
            <Textarea rows={3} placeholder={t("stockOut.reasonPlaceholder")} {...register("reason" as never)} />
            {"reason" in errors && errors.reason && (
              <p className="mt-1 text-xs text-destructive">{(errors as any).reason?.message}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEdit ? `/inventory/stock-out/${id}` : "/inventory/stock-out")}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant={isEdit ? "destructive" : "default"} disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : isEdit ? t("stockOut.confirmOverrideEdit") : t("common.save")}
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
  control: ReturnType<typeof useForm<FormValues>>["control"];
  index: number;
  editingItem?: StockOut["items"][number];
  onRemove?: () => void;
  error?: string;
}) {
  const { t } = useTranslation();
  const itemId = useWatch({ control, name: `items.${index}.itemId` });

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start">

        <div className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-20 shrink-0">
          {t("stockIn.items")} #{index + 1}
        </div>

        <div className="flex-1">
          <Controller
            control={control}
            name={`items.${index}.itemId`}
            render={({ field }) => (
              <ItemPickerField
                value={field.value}
                onChange={field.onChange}
                selectedSublabel={editingItem?.item?.itemName}
                placeholder={t("common.selectItem")}
                error={!!error}
              />
            )}
          />
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="self-end sm:self-start shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AllocationRows
        control={control as any}
        itemIndex={index}
        itemId={itemId}
        initialAllocations={editingItem?.allocations}
      />
    </div>
  );
}
