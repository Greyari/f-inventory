import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft, Loader2, Lock, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemPickerField } from "@/components/common/ItemPickerField";
import { useCreateStockIn, useUpdateStockIn, useStockInDetail } from "./stock-in.hooks";
import type { StockIn } from "@/types/inventory.types";
import { JobCodePickerField } from "@/components/common/JobCodePickerField";
import { StockInStatusBadge } from "./StockInStatusBadge";
import { useHasPermission } from "@/store/authStore";

const schema = z.object({
  prNo: z.string().min(1, "Nomor referensi wajib diisi"),
  dateRaised: z.string().min(1, "Tanggal wajib diisi"),
  projectName: z.string().min(1, "Nama project wajib diisi"),
  projectRefId: z.string().min(1, "Project Ref wajib dipilih"),
  costCentreId: z.string().min(1, "Cost Centre wajib dipilih"),
  costCodeId: z.string().min(1, "Cost Code wajib dipilih"),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, "Item wajib dipilih"),
        qty: z.coerce.number().min(0.01, "Qty harus > 0"),
      })
    )
    .min(1, "Minimal 1 item"),
});

type FormValues = z.infer<typeof schema>;

const emptyValues = (): FormValues => ({
  prNo: "",
  dateRaised: new Date().toISOString().slice(0, 10),
  projectName: "",
  projectRefId: "",
  costCentreId: "",
  costCodeId: "",
  items: [{ itemId: "", qty: 1 }],
});

const valuesFromStockIn = (data: StockIn): FormValues => ({
  prNo: data.prNo,
  dateRaised: data.dateRaised,
  projectName: data.projectName,
  projectRefId: data.projectRefId,
  costCentreId: data.costCentreId,
  costCodeId: data.costCodeId,
  items: data.items.map((it) => ({ itemId: it.itemId, qty: it.qty })),
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

  // Kalau sudah PO atau DO, daftar item terkunci karena vendor/harga
  // (dan akhirnya saldo stok, kalau sudah DO) sudah nempel ke situ.
  // Cuma field header (tanggal, project, dst) yang masih bisa diubah.
  const itemsLocked = isEdit && editingData?.status !== "npr";
  const canOverride = useHasPermission("stock-in.override");
  // Begitu bukan NPR lagi, form edit BIASA gak bisa dipakai sama sekali —
  // cuma bisa lewat halaman Override (Super Admin).
  const formLocked = isEdit && editingData && editingData.status !== "npr";

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
    // Kalau item terkunci, jangan kirim ulang daftar item ke backend
    // (backend juga menolak, tapi lebih aman dijaga dari sini juga).
    const payload = itemsLocked ? { ...values, items: undefined as never } : values;

    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, payload });
    } else {
      await createMutation.mutateAsync(values);
    }
    navigate("/inventory/stock-in");
  };

  const handleAddItem = () => append({ itemId: "", qty: 1 });

  const handleRemoveItem = (index: number) => {
    remove(index);
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

  if (formLocked) {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(`/inventory/stock-in/${id}`)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
        </button>

        <div className="flex flex-col items-center gap-3 rounded-lg border bg-background p-10 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">{t("stockIn.formLockedTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("stockIn.formLockedHint")}</p>
          </div>
          {canOverride ? (
            <Button
              variant="outline"
              className="mt-2 border-destructive/40 text-destructive hover:bg-destructive/5"
              onClick={() => navigate(`/inventory/stock-in/${id}/override`)}
            >
              <ShieldAlert className="h-4 w-4" /> {t("stockIn.overrideEdit")}
            </Button>
          ) : (
            <Button variant="outline" className="mt-2" onClick={() => navigate(`/inventory/stock-in/${id}`)}>
              {t("common.backToList")}
            </Button>
          )}
        </div>
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

      <div className="mb-6 flex items-center gap-2">
        <h2 className="text-2xl font-semibold">
          {isEdit ? `${t("common.edit")} — ${t("stockIn.formTitle")}` : t("stockIn.formTitle")}
        </h2>
        {isEdit && editingData && <StockInStatusBadge status={editingData.status} />}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border bg-background p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-2">
            <Label>{t("stockIn.prNo")}</Label>
            <Input {...register("prNo")} placeholder="e.g. 123456" />
            {errors.prNo && <p className="mt-1 text-xs text-destructive">{errors.prNo.message}</p>}
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
            <Label>{t("stockIn.dateRaised")}</Label>
            <Input type="date" {...register("dateRaised")} />
          </div>

          <div>
            <Label>{t("stockIn.costCentre")}</Label>
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
            <Label>{t("stockIn.costCode")}</Label>
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
            <Label className="mb-0 flex items-center gap-1.5">
              {t("stockIn.items")}
              {itemsLocked && (
                <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <Lock className="h-3 w-3" /> {t("stockIn.itemsLockedHint")}
                </span>
              )}
            </Label>
            {!itemsLocked && (
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="h-4 w-4" /> {t("stockIn.addItem")}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Controller
                    control={control}
                    name={`items.${index}.itemId`}
                    render={({ field: f }) => (
                      <ItemPickerField
                        value={f.value}
                        onChange={(val, item) => {
                          f.onChange(val);
                          setRowUnits((prev) => ({ ...prev, [index]: item?.unit ?? "" }));
                        }}
                        selectedSublabel={editingData?.items[index]?.item?.itemName}
                        placeholder={t("common.selectItem")}
                        error={!!errors.items?.[index]?.itemId}
                        disabled={itemsLocked}
                      />
                    )}
                  />
                  {errors.items?.[index]?.itemId && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.items[index]?.itemId?.message}
                    </p>
                  )}
                </div>

                <div className="w-28 sm:w-36">
                  <Input
                    type="number"
                    step="any"
                    placeholder={t("stockIn.qty")}
                    disabled={itemsLocked}
                    {...register(`items.${index}.qty`)}
                  />
                  {rowUnits[index] && (
                    <p className="mt-1 text-xs text-muted-foreground">{rowUnits[index]}</p>
                  )}
                  {errors.items?.[index]?.qty && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.items[index]?.qty?.message}
                    </p>
                  )}
                </div>

                {!itemsLocked && fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
