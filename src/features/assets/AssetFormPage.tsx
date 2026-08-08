import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateAsset, useUpdateAsset, useAsset } from "./asset.hooks";

const schema = z.object({
  assetCode: z.string().min(1, "Kode aset wajib diisi"),
  assetName: z.string().min(1, "Nama aset wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  qty: z.coerce.number().min(0.01, "Qty harus > 0"),
  notes: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const CATEGORY_SUGGESTIONS = ["Elektronik", "Furniture", "Kendaraan", "Peralatan Berat", "Peralatan Kantor"];

const emptyValues = (): FormValues => ({
  assetCode: "",
  assetName: "",
  category: "",
  qty: 1,
  notes: "",
});

export default function AssetFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { assetId } = useParams<{ assetId: string }>();
  const isEdit = !!assetId;

  const { data: editingData, isLoading: isLoadingDetail } = useAsset(assetId);
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues() });

  useEffect(() => {
    if (isEdit && editingData) {
      reset({
        assetCode: editingData.assetCode,
        assetName: editingData.assetName,
        category: editingData.category,
        qty: editingData.qty,
        notes: editingData.notes ?? "",
      });
    }
  }, [isEdit, editingData, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && assetId) {
      await updateMutation.mutateAsync({ id: assetId, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    navigate("/assets");
  };

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
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

      <h2 className="mb-6 text-2xl font-semibold">
        {isEdit ? `${t("common.edit")} — ${t("asset.formTitleEdit")}` : t("asset.formTitleAdd")}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-background p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("asset.assetCode")}</Label>
            <Input {...register("assetCode")} placeholder="e.g. AST-0011" />
            {errors.assetCode && <p className="mt-1 text-xs text-destructive">{errors.assetCode.message}</p>}
          </div>
          <div>
            <Label>{t("asset.category")}</Label>
            <Input {...register("category")} list="asset-category-suggestions" placeholder="e.g. Elektronik" />
            <datalist id="asset-category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
          </div>
        </div>

        <div>
          <Label>{t("asset.assetName")}</Label>
          <Input {...register("assetName")} placeholder="e.g. Laptop Dell Latitude 5420" />
          {errors.assetName && <p className="mt-1 text-xs text-destructive">{errors.assetName.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>{t("asset.qty")}</Label>
            <Input type="number" step="any" {...register("qty")} />
            {errors.qty && <p className="mt-1 text-xs text-destructive">{errors.qty.message}</p>}
          </div>
        </div>

        <div>
          <Label>{t("asset.notes")}</Label>
          <Textarea {...register("notes")} placeholder={t("item.descriptionPlaceholder")} />
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/assets")}>
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
