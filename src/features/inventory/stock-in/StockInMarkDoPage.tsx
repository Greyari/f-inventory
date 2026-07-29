import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockInDetail, useMarkStockInDo } from "./stock-in.hooks";

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

export default function StockInMarkDoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: stockIn, isLoading } = useStockInDetail(id);
  const markAsDo = useMarkStockInDo();

  // File per index item, disimpan terpisah dari react-hook-form karena
  // input file lebih gampang dikelola manual (append/remove/preview).
  const [photosByIndex, setPhotosByIndex] = useState<Record<number, File[]>>({});

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

  if (stockIn.status !== "npr") {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center text-sm text-muted-foreground">
        {t("stockIn.alreadyDoNotice")}
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(`/inventory/stock-in/${id}`)}>
            {t("common.backToList")}
          </Button>
        </div>
      </div>
    );
  }

  const handleFilesChange = (index: number, files: FileList | null) => {
    if (!files) return;
    setPhotosByIndex((prev) => ({ ...prev, [index]: [...(prev[index] ?? []), ...Array.from(files)] }));
  };

  const removePhoto = (index: number, photoIndex: number) => {
    setPhotosByIndex((prev) => ({
      ...prev,
      [index]: (prev[index] ?? []).filter((_, i) => i !== photoIndex),
    }));
  };

  const onSubmit = async (values: FormValues) => {
    await markAsDo.mutateAsync({
      id,
      items: values.items.map((item, index) => ({
        ...item,
        photos: photosByIndex[index] ?? [],
      })),
    });
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
        <h2 className="text-2xl font-semibold">{t("stockIn.markAsDo")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("stockIn.markAsDoSubtitle", { ref: stockIn.prNo })}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-background p-6">
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

              <div className="mt-3">
                <Label>{t("stockIn.photos")}</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {(photosByIndex[index] ?? []).map((file, photoIndex) => (
                    <div key={photoIndex} className="flex items-center gap-1 rounded border bg-muted/40 px-2 py-1 text-xs">
                      <span className="max-w-[140px] truncate">{file.name}</span>
                      <button type="button" onClick={() => removePhoto(index, photoIndex)}>
                        <X className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  ))}
                  <label className="flex cursor-pointer items-center gap-1 rounded border border-dashed px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                    <Upload className="h-3.5 w-3.5" />
                    {t("stockIn.addPhoto")}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFilesChange(index, e.target.files)}
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/inventory/stock-in/${id}`)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={markAsDo.isPending}>
            {markAsDo.isPending ? t("common.saving") : t("stockIn.confirmMarkAsDo")}
          </Button>
        </div>
      </form>
    </div>
  );
}
