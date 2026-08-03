import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { fetchAssetOptions } from "./asset-select-options";
import { useCheckoutAsset } from "./asset-usage.hooks";

const schema = z.object({
  assetId: z.string().min(1, "Aset wajib dipilih"),
  usedBy: z.string().min(1, "Nama pemakai wajib diisi"),
  purpose: z.string().min(1, "Keperluan wajib diisi"),
  qty: z.coerce.number().min(0.01, "Qty harus > 0"),
  checkoutDate: z.string().min(1, "Tanggal wajib diisi"),
  expectedReturnDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const emptyValues = (): FormValues => ({
  assetId: "",
  usedBy: "",
  purpose: "",
  qty: 1,
  checkoutDate: new Date().toISOString().slice(0, 10),
  expectedReturnDate: "",
});

export default function AssetUsageFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const checkoutMutation = useCheckoutAsset();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues() });

  useEffect(() => {
    reset(emptyValues());
  }, [reset]);

  const onSubmit = async (values: FormValues) => {
    await checkoutMutation.mutateAsync(values);
    navigate("/assets");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate("/assets")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <h2 className="mb-6 text-2xl font-semibold">{t("assetUsage.formTitle")}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-background p-6">
        <div>
          <Label>{t("assetUsage.asset")}</Label>
          <Controller
            control={control}
            name="assetId"
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                fetchOptions={fetchAssetOptions}
                placeholder={t("common.selectCode")}
                error={!!errors.assetId}
              />
            )}
          />
          {errors.assetId && <p className="mt-1 text-xs text-destructive">{errors.assetId.message}</p>}
        </div>

        <div>
          <Label>{t("assetUsage.usedBy")}</Label>
          <Input {...register("usedBy")} placeholder={t("assetUsage.usedByPlaceholder")} />
          {errors.usedBy && <p className="mt-1 text-xs text-destructive">{errors.usedBy.message}</p>}
        </div>

        <div>
          <Label>{t("assetUsage.purpose")}</Label>
          <Input {...register("purpose")} placeholder={t("assetUsage.purposePlaceholder")} />
          {errors.purpose && <p className="mt-1 text-xs text-destructive">{errors.purpose.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>{t("asset.qty")}</Label>
            <Input type="number" step="any" {...register("qty")} />
            {errors.qty && <p className="mt-1 text-xs text-destructive">{errors.qty.message}</p>}
          </div>
          <div>
            <Label>{t("assetUsage.checkoutDate")}</Label>
            <Input type="date" {...register("checkoutDate")} />
          </div>
          <div>
            <Label>{t("assetUsage.expectedReturnDate")}</Label>
            <Input type="date" {...register("expectedReturnDate")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/assets")}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={checkoutMutation.isPending}>
            {checkoutMutation.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
