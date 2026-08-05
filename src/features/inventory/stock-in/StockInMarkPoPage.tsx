import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockInDetail, useMarkStockInPo } from "./stock-in.hooks";

const schema = z.object({
  items: z.array(
    z.object({
      stockInItemId: z.string(),
      vendorName: z.string().min(1, "Vendor wajib diisi"),
      price: z.coerce.number().min(0, "Harga wajib diisi"),
    })
  ),
});

type FormValues = z.infer<typeof schema>;

export default function StockInMarkPoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: stockIn, isLoading } = useStockInDetail(id);
  const markAsPo = useMarkStockInPo();
  const [poPhoto, setPoPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState(false);

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { items: [] },
  });
  const { fields } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (stockIn) {
      reset({
        items: stockIn.items.map((it) => ({
          stockInItemId: it.id,
          vendorName: it.vendorName ?? "",
          price: it.price ?? 0,
        })),
      });
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

  if (stockIn.status !== "pr") {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center text-sm text-muted-foreground">
        {t("stockIn.notNprNotice")}
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(`/inventory/stock-in/${id}`)}>
            {t("common.backToList")}
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    if (!poPhoto) {
      setPhotoError(true);
      return;
    }
    await markAsPo.mutateAsync({ id, items: values.items, poPhoto });
    navigate(`/inventory/stock-in/${id}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(`/inventory/stock-in/${id}`)}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-2">
        <h2 className="text-2xl font-semibold">{t("stockIn.markAsPo")}</h2>
        <p className="text-sm text-muted-foreground">{t("stockIn.markAsPoSubtitle", { ref: stockIn.prNo })}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-background p-6">
        <div className="space-y-3">
          {fields.map((field, index) => {
            const item = stockIn.items[index];
            return (
              <div key={field.id} className="rounded-md border p-4">
                <div className="mb-3 text-sm font-medium">
                  {item?.item?.itemName ?? item?.itemId} — {item?.qty} {item?.item?.unit}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>{t("stockIn.vendorName")}</Label>
                    <Input {...register(`items.${index}.vendorName`)} placeholder={t("stockIn.vendorNamePlaceholder")} />
                    {errors.items?.[index]?.vendorName && (
                      <p className="mt-1 text-xs text-destructive">{errors.items[index]?.vendorName?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>{t("stockIn.price")}</Label>
                    <Input type="number" step="any" {...register(`items.${index}.price`)} placeholder="0" />
                    {errors.items?.[index]?.price && (
                      <p className="mt-1 text-xs text-destructive">{errors.items[index]?.price?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <Label>{t("stockIn.poPhoto")}</Label>
          <p className="mb-2 text-xs text-muted-foreground">{t("stockIn.poPhotoHint")}</p>

          {poPhoto ? (
            <div className="flex items-center gap-2 rounded border bg-muted/40 px-3 py-2 text-sm">
              <span className="max-w-[220px] truncate">{poPhoto.name}</span>
              <button
                type="button"
                onClick={() => setPoPhoto(null)}
                className="text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded border border-dashed px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
              <Upload className="h-4 w-4" />
              {t("stockIn.uploadPhoto")}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  setPhotoError(false);
                  setPoPhoto(e.target.files?.[0] ?? null);
                }}
              />
            </label>
          )}
          {photoError && <p className="mt-1 text-xs text-destructive">{t("stockIn.photoRequired")}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/inventory/stock-in/${id}`)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={markAsPo.isPending}>
            {markAsPo.isPending ? t("common.saving") : t("stockIn.confirmMarkAsPo")}
          </Button>
        </div>
      </form>
    </div>
  );
}
