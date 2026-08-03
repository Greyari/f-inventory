import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, X, Loader2 } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReturnAsset, useAssetUsageDetail } from "./asset-usage.hooks";
import type { ReturnCondition } from "@/types/asset.types";

const schema = z.object({
  returnDate: z.string().min(1, "Tanggal wajib diisi"),
  returnCondition: z.enum(["Baik", "Rusak Ringan", "Rusak Berat", "Hilang"]),
  returnNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CONDITION_OPTIONS: ReturnCondition[] = ["Baik", "Rusak Ringan", "Rusak Berat", "Hilang"];

export default function AssetReturnPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usageId } = useParams<{ usageId: string }>();

  const { data: usage, isLoading: isLoadingDetail } = useAssetUsageDetail(usageId);
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
    reset({ returnDate: new Date().toISOString().slice(0, 10), returnCondition: "Baik", returnNotes: "" });
    setPhoto(null);
    setPhotoPreview(null);
  }, [usageId, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const onSubmit = async (values: FormValues) => {
    if (!usageId) return;
    await returnMutation.mutateAsync({
      id: usageId,
      payload: { ...values, returnPhoto: photo },
    });
    navigate("/assets");
  };

  if (isLoadingDetail || !usage) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Kalau sudah dikembalikan sebelumnya (mis. dibuka dari link lama), jangan
  // biarin diproses ulang — arahin balik ke daftar.
  if (usage.status === "RETURNED") {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate("/assets")}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
        </button>
        <div className="rounded-lg border bg-muted/20 p-6 text-sm text-muted-foreground">
          {t("assetUsage.alreadyReturned")}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate("/assets")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <h2 className="mb-6 text-2xl font-semibold">{t("assetUsage.returnFormTitle")}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-background p-6">
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
            {errors.returnDate && <p className="mt-1 text-xs text-destructive">{errors.returnDate.message}</p>}
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

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/assets")}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={returnMutation.isPending}>
            {returnMutation.isPending ? t("common.saving") : t("assetUsage.confirmReturnButton")}
          </Button>
        </div>
      </form>
    </div>
  );
}
