import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft, Loader2, ShieldAlert, Upload, X, ExternalLink, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemPickerField } from "@/components/common/ItemPickerField";
import { JobCodePickerField } from "@/components/common/JobCodePickerField";
import { useStockInDetail, useOverrideUpdateStockIn } from "./stock-in.hooks";
import { StockInStatusBadge } from "./StockInStatusBadge";

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
        vendorName: z.string().optional(),
        price: z.coerce.number().optional(),
      })
    )
    .min(1, "Minimal 1 item"),
  reason: z.string().min(5, "Alasan wajib diisi, jelaskan sedikit lebih detail"),
});

type FormValues = z.infer<typeof schema>;

export default function StockInOverridePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: stockIn, isLoading } = useStockInDetail(id);
  const overrideUpdate = useOverrideUpdateStockIn();

  const [rowUnits, setRowUnits] = useState<Record<number, string>>({});
  const [poPhoto, setPoPhoto] = useState<File | null>(null);
  const [doPhoto, setDoPhoto] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (stockIn) {
      reset({
        prNo: stockIn.prNo,
        dateRaised: stockIn.dateRaised,
        projectName: stockIn.projectName,
        projectRefId: stockIn.projectRefId,
        costCentreId: stockIn.costCentreId,
        costCodeId: stockIn.costCodeId,
        items: stockIn.items.map((it) => ({
          itemId: it.itemId,
          qty: it.qty,
          vendorName: it.vendorName ?? "",
          price: it.price ?? undefined,
        })),
        reason: "",
      });

      const units: Record<number, string> = {};
      stockIn.items.forEach((it, i) => {
        if (it.item?.unit) units[i] = it.item.unit;
      });
      setRowUnits(units);
    }
  }, [stockIn, reset]);

  if (!id) return null;

  if (isLoading || !stockIn) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    await overrideUpdate.mutateAsync({
      id,
      payload: {
        prNo: values.prNo,
        dateRaised: values.dateRaised,
        projectName: values.projectName,
        projectRefId: values.projectRefId,
        costCentreId: values.costCentreId,
        costCodeId: values.costCodeId,
        items: values.items.map((it) => ({
          itemId: it.itemId,
          qty: it.qty,
          vendorName: it.vendorName || undefined,
          price: it.price,
        })),
        poPhoto: poPhoto ?? undefined,
        doPhoto: doPhoto ?? undefined,
        reason: values.reason,
      },
    });
    navigate(`/inventory/stock-in/${id}`);
  };

  const handleAddItem = () => append({ itemId: "", qty: 1, vendorName: "", price: undefined });

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

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate(`/inventory/stock-in/${id}`)}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-4 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <h2 className="text-2xl font-semibold">{t("stockIn.overrideEdit")}</h2>
        <StockInStatusBadge status={stockIn.status} />
      </div>

      <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        {t("stockIn.overrideEditWarning")}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border bg-background p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-2">
            <Label>{t("stockIn.prNo")}</Label>
            <Input {...register("prNo")} />
            {errors.prNo && <p className="mt-1 text-xs text-destructive">{errors.prNo.message}</p>}
          </div>

          <div className="col-span-2">
            <Label>{t("stockIn.project")}</Label>
            <Input {...register("projectName")} />
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
                  selectedLabel={stockIn.projectRef?.code}
                  selectedSublabel={stockIn.projectRef?.description}
                  error={!!errors.projectRefId}
                  placeholder={t("common.selectCode")}
                />
              )}
            />
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
                  selectedLabel={stockIn.costCentre?.code}
                  selectedSublabel={stockIn.costCentre?.description}
                  error={!!errors.costCentreId}
                  placeholder={t("common.selectCode")}
                />
              )}
            />
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
                  selectedLabel={stockIn.costCode?.code}
                  selectedSublabel={stockIn.costCode?.description}
                  error={!!errors.costCodeId}
                  placeholder={t("common.selectCode")}
                />
              )}
            />
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
              <div key={field.id} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-start">
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
                        selectedSublabel={stockIn.items[index]?.item?.itemName}
                        placeholder={t("common.selectItem")}
                        error={!!errors.items?.[index]?.itemId}
                      />
                    )}
                  />
                  {errors.items?.[index]?.itemId && (
                    <p className="mt-1 text-xs text-destructive">{errors.items[index]?.itemId?.message}</p>
                  )}
                </div>

                <div className="w-full sm:w-28">
                  <Input
                    type="number"
                    step="any"
                    placeholder={t("stockIn.qty")}
                    {...register(`items.${index}.qty`)}
                  />
                  {rowUnits[index] && (
                    <p className="mt-1 text-xs text-muted-foreground">{rowUnits[index]}</p>
                  )}
                  {errors.items?.[index]?.qty && (
                    <p className="mt-1 text-xs text-destructive">{errors.items[index]?.qty?.message}</p>
                  )}
                </div>

                <div className="w-full sm:w-44">
                  <Input
                    placeholder={t("stockIn.vendorName")}
                    {...register(`items.${index}.vendorName`)}
                  />
                </div>

                <div className="w-full sm:w-32">
                  <Input
                    type="number"
                    step="any"
                    placeholder={t("stockIn.price")}
                    {...register(`items.${index}.price`)}
                  />
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-end sm:self-start shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
          <PhotoReplaceField
            label={t("stockIn.poPhoto")}
            currentUrl={stockIn.poPhotoUrl}
            file={poPhoto}
            onChange={setPoPhoto}
            hint={t("stockIn.replacePhotoHint")}
          />
          <PhotoReplaceField
            label={t("stockIn.doPhoto")}
            currentUrl={stockIn.doPhotoUrl}
            file={doPhoto}
            onChange={setDoPhoto}
            hint={t("stockIn.replacePhotoHint")}
          />
        </div>

        <div className="border-t pt-4">
          <Label>{t("stockIn.reason")}</Label>
          <textarea
            rows={3}
            placeholder={t("stockIn.reasonPlaceholder")}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("reason")}
          />
          {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/inventory/stock-in/${id}`)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="destructive" disabled={overrideUpdate.isPending}>
            {overrideUpdate.isPending ? t("common.saving") : t("stockIn.confirmOverrideEdit")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PhotoReplaceField({
  label,
  currentUrl,
  file,
  onChange,
  hint,
}: {
  label: string;
  currentUrl?: string | null;
  file: File | null;
  onChange: (file: File | null) => void;
  hint: string;
}) {
  const { t } = useTranslation(); // <-- WAJIB ditambah, ini akar masalah errornya

  return (
    <div>
      <Label>{label}</Label>
      <p className="mb-2 text-xs text-muted-foreground">{hint}</p>
      <div className="flex items-center gap-3">
        {currentUrl && !file && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded border bg-muted/40 px-2 py-1.5 text-xs text-primary hover:underline"
          >
            <FileText className="h-3.5 w-3.5" /> {t("stockIn.currentFile")} <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {file ? (
          <div className="flex items-center gap-2 rounded border bg-muted/40 px-2 py-1 text-xs">
            <span className="max-w-[140px] truncate">{file.name}</span>
            <button type="button" onClick={() => onChange(null)} className="text-destructive">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-1 rounded border border-dashed px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Upload className="h-3.5 w-3.5" /> {/* <-- fix typo w-3.5 */}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>
    </div>
  );
}