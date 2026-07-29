import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Camera, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReturnAsset } from "./asset-usage.hooks";
import type { AssetUsage, ReturnCondition } from "@/types/asset.types";

const schema = z.object({
  returnDate: z.string().min(1, "Tanggal wajib diisi"),
  returnCondition: z.enum(["Baik", "Rusak Ringan", "Rusak Berat", "Hilang"]),
  returnNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CONDITION_OPTIONS: ReturnCondition[] = ["Baik", "Rusak Ringan", "Rusak Berat", "Hilang"];

interface AssetReturnDialogProps {
  // Record yang mau diproses pengembaliannya — diambil langsung dari baris
  // tabel "sedang dipakai", BUKAN input ulang manual.
  usage: AssetUsage | null;
  onOpenChange: (open: boolean) => void;
}

export function AssetReturnDialog({ usage, onOpenChange }: AssetReturnDialogProps) {
  const { t } = useTranslation();
  const returnMutation = useReturnAsset();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { returnDate: new Date().toISOString().slice(0, 10), returnCondition: "Baik", returnNotes: "" },
  });

  useEffect(() => {
    if (usage) {
      reset({ returnDate: new Date().toISOString().slice(0, 10), returnCondition: "Baik", returnNotes: "" });
      setPhoto(null);
      setPhotoPreview(null);
    }
  }, [usage, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const onSubmit = async (values: FormValues) => {
    if (!usage) return;
    await returnMutation.mutateAsync({
      id: usage.id,
      payload: { ...values, returnPhoto: photo },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!usage} onOpenChange={onOpenChange}>
      <DialogContent title={t("assetUsage.returnFormTitle")} className="max-w-lg">
        {usage && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Info aset yang dikembalikan — read only, diambil dari record yang dipilih */}
            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="font-medium">
                {usage.asset?.assetCode} — {usage.asset?.assetName}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("assetUsage.usedBy")}: {usage.usedBy} · {t("asset.qty")}: {usage.qty} ·{" "}
                {t("assetUsage.checkoutDate")}: {usage.checkoutDate}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("assetUsage.purpose")}: {usage.purpose}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("assetUsage.returnDate")}</Label>
                <Input type="date" {...register("returnDate")} />
                {errors.returnDate && (
                  <p className="mt-1 text-xs text-destructive">{errors.returnDate.message}</p>
                )}
              </div>
              <div>
                <Label>{t("assetUsage.returnCondition")}</Label>
                <Controller
                  control={control}
                  name="returnCondition"
                  render={({ field }) => (
                    <Select value={field.value} onChange={field.onChange}>
                      {CONDITION_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {t(`assetUsage.condition.${c}`)}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </div>
            </div>

            <div>
              <Label>{t("assetUsage.returnNotes")}</Label>
              <Textarea {...register("returnNotes")} placeholder={t("assetUsage.returnNotesPlaceholder")} />
            </div>

            <div>
              <Label>
                {t("assetUsage.returnPhoto")}{" "}
                <span className="font-normal text-muted-foreground">({t("common.optional")})</span>
              </Label>

              {!photoPreview ? (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm text-muted-foreground hover:bg-muted/30">
                  <Camera className="h-6 w-6" />
                  {t("assetUsage.uploadPhotoHint")}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              ) : (
                <div className="relative w-fit">
                  <img src={photoPreview} alt="Preview kondisi barang" className="max-h-48 rounded-md border" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={returnMutation.isPending}>
                {returnMutation.isPending ? t("common.saving") : t("assetUsage.confirmReturnButton")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
