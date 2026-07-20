import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { fetchItemOptions, fetchJobCodeOptions } from "@/lib/selectOptions";
import { useCreateStockIn, useUpdateStockIn, useStockInDetail } from "./stock-in.hooks";
import type { StockIn, Item } from "@/types/inventory.types";

const schema = z.object({
  referenceNo: z.string().min(1, "Nomor referensi wajib diisi"),
  dateReceived: z.string().min(1, "Tanggal wajib diisi"),
  approvedBy: z.string().min(1, "Nama yang meng-acc wajib diisi"),
  projectName: z.string().min(1, "Nama project wajib diisi"),
  projectRefId: z.string().min(1, "Project Ref wajib dipilih"),
  costCentreId: z.string().min(1, "Cost Centre wajib dipilih"),
  costCodeId: z.string().min(1, "Cost Code wajib dipilih"),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, "Item wajib dipilih"),
        qty: z.coerce.number().min(0.01, "Qty harus > 0"),
        location: z.string().optional(),
      })
    )
    .min(1, "Minimal 1 item"),
});

type FormValues = z.infer<typeof schema>;

const emptyValues = (): FormValues => ({
  referenceNo: "",
  dateReceived: new Date().toISOString().slice(0, 10),
  approvedBy: "",
  projectName: "",
  projectRefId: "",
  costCentreId: "",
  costCodeId: "",
  items: [{ itemId: "", qty: 1, location: "" }],
});

const valuesFromStockIn = (data: StockIn): FormValues => ({
  referenceNo: data.referenceNo,
  dateReceived: data.dateReceived,
  approvedBy: data.approvedBy,
  projectName: data.projectName,
  projectRefId: data.projectRefId,
  costCentreId: data.costCentreId,
  costCodeId: data.costCodeId,
  items: data.items.map((it) => ({ itemId: it.itemId, qty: it.qty, location: it.location ?? "" })),
});

export default function StockInFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: editingData, isLoading: isLoadingDetail } = useStockInDetail(id);
  const createMutation = useCreateStockIn();
  const updateMutation = useUpdateStockIn();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Unit per baris item, biar kelihatan begitu item dipilih dari dropdown
  // (index-nya harus tetap sinkron sama urutan fields, lihat handler onChange & remove di bawah)
  const [rowUnits, setRowUnits] = useState<Record<number, string>>({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues() });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (isEdit && editingData) {
      reset(valuesFromStockIn(editingData));

      const units: Record<number, string> = {};
      editingData.items.forEach((it, i) => {
        if (it.item?.unit) units[i] = it.item.unit;
      });
      setRowUnits(units);
    }
  }, [isEdit, editingData, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    navigate("/inventory/stock-in");
  };

  const handleAddItem = () => {
    append({ itemId: "", qty: 1, location: "" });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
    // Geser rowUnits biar index-nya tetap sinkron sama fields setelah row dihapus
    setRowUnits((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const i = Number(key);
        if (i < index) next[i] = val;
        else if (i > index) next[i - 1] = val;
      });
      return next;
    });
  };

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/inventory/stock-in")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {isEdit ? `${t("common.edit")} — ${t("stockIn.formTitle")}` : t("stockIn.formTitle")}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border bg-background p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("stockIn.referenceNo")}</Label>
            <Input {...register("referenceNo")} placeholder="e.g. GRN-2026-0031" />
            {errors.referenceNo && <p className="mt-1 text-xs text-destructive">{errors.referenceNo.message}</p>}
          </div>
          <div>
            <Label>{t("stockIn.dateReceived")}</Label>
            <Input type="date" {...register("dateReceived")} />
          </div>

          <div className="col-span-2">
            <Label>{t("stockIn.approvedBy")}</Label>
            <Input {...register("approvedBy")} placeholder={t("stockIn.approvedByPlaceholder")} />
            {errors.approvedBy && <p className="mt-1 text-xs text-destructive">{errors.approvedBy.message}</p>}
          </div>

          <div className="col-span-2">
            <Label>{t("stockIn.project")}</Label>
            <Input {...register("projectName")} placeholder="e.g. Batching Plant 5" />
            {errors.projectName && <p className="mt-1 text-xs text-destructive">{errors.projectName.message}</p>}
          </div>

          <div>
            <Label>{t("stockIn.projectRef")}</Label>
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
            <Label>{t("stockIn.costCentre")}</Label>
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
            <Label>{t("stockIn.costCode")}</Label>
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
            <Label className="mb-0">{t("stockIn.items")}</Label>
            <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
              <Plus className="h-4 w-4" /> {t("stockIn.addItem")}
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-start">
                <div className="sm:col-span-5">
                  <Controller
                    control={control}
                    name={`items.${index}.itemId`}
                    render={({ field: f }) => (
                      <SearchableSelect
                        value={f.value}
                        onChange={(val, option) => {
                          f.onChange(val);
                          const rawItem = option?.raw as Item | undefined;
                          setRowUnits((prev) => ({ ...prev, [index]: rawItem?.unit ?? "" }));
                        }}
                        fetchOptions={fetchItemOptions}
                        selectedLabel={editingData?.items[index]?.item?.itemCode}
                        selectedSublabel={editingData?.items[index]?.item?.itemName}
                        placeholder={t("common.selectItem")}
                        error={!!errors.items?.[index]?.itemId}
                      />
                    )}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input type="number" step="any" placeholder={t("stockIn.qty")} {...register(`items.${index}.qty`)} />
                  {rowUnits[index] && (
                    <p className="mt-1 text-xs text-muted-foreground">{rowUnits[index]}</p>
                  )}
                </div>
                <div className="sm:col-span-4">
                  <Input placeholder={t("stockIn.locationPlaceholder")} {...register(`items.${index}.location`)} />
                </div>
                <div className="sm:col-span-1">
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/inventory/stock-in")}>
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