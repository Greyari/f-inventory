import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateAsset, useUpdateAsset } from "./asset.hooks";
import type { Asset } from "@/types/asset.types";

const schema = z.object({
  assetCode: z.string().min(1, "Kode aset wajib diisi"),
  assetName: z.string().min(1, "Nama aset wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  recipient: z.string().min(1, "Penerima/lokasi wajib diisi"),
  qty: z.coerce.number().min(0.01, "Qty harus > 0"),
  condition: z.string().optional(),
  acquiredDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// Saran kategori & kondisi — tetap free text (bukan dropdown ketat), biar fleksibel
const CATEGORY_SUGGESTIONS = ["Elektronik", "Furniture", "Kendaraan", "Peralatan Berat", "Peralatan Kantor"];
const CONDITION_SUGGESTIONS = ["Baik", "Rusak Ringan", "Rusak Berat", "Dalam Perbaikan"];

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingData?: Asset | null;
}

export function AssetFormDialog({ open, onOpenChange, editingData }: AssetFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!editingData;
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset(
        editingData
          ? {
              assetCode: editingData.assetCode,
              assetName: editingData.assetName,
              category: editingData.category,
              recipient: editingData.recipient,
              qty: editingData.qty,
              condition: editingData.condition ?? "",
              acquiredDate: editingData.acquiredDate ?? "",
              notes: editingData.notes ?? "",
            }
          : {
              assetCode: "",
              assetName: "",
              category: "",
              recipient: "",
              qty: 1,
              condition: "",
              acquiredDate: "",
              notes: "",
            }
      );
    }
  }, [open, editingData, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && editingData) {
      await updateMutation.mutateAsync({ id: editingData.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? t("asset.formTitleEdit") : t("asset.formTitleAdd")} className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <Label>{t("asset.recipient")}</Label>
            <Input {...register("recipient")} placeholder={t("asset.recipientPlaceholder")} />
            {errors.recipient && <p className="mt-1 text-xs text-destructive">{errors.recipient.message}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{t("asset.recipientHint")}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>{t("asset.qty")}</Label>
              <Input type="number" step="any" {...register("qty")} />
              {errors.qty && <p className="mt-1 text-xs text-destructive">{errors.qty.message}</p>}
            </div>
            <div>
              <Label>{t("asset.condition")}</Label>
              <Input {...register("condition")} list="asset-condition-suggestions" placeholder="e.g. Baik" />
              <datalist id="asset-condition-suggestions">
                {CONDITION_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>{t("asset.acquiredDate")}</Label>
              <Input type="date" {...register("acquiredDate")} />
            </div>
          </div>

          <div>
            <Label>{t("asset.notes")}</Label>
            <Textarea {...register("notes")} placeholder={t("item.descriptionPlaceholder")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
