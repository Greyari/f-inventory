import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateItem, useUpdateItem } from "./item.hooks";
import type { Item } from "@/types/inventory.types";

const schema = z.object({
  itemName: z.string().min(1, "Nama barang wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  minStockLevel: z.coerce.number().min(0, "Tidak boleh negatif"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const UNIT_SUGGESTIONS = ["pcs", "m", "kg", "liter", "box", "roll", "set", "unit", "sheet"];

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingData?: Item | null;
}

export function ItemFormDialog({ open, onOpenChange, editingData }: ItemFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!editingData;
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

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
              itemName: editingData.itemName,
              category: editingData.category,
              unit: editingData.unit,
              minStockLevel: editingData.minStockLevel,
              description: editingData.description ?? "",
            }
          : { itemName: "", category: "", unit: "", minStockLevel: 0, description: "" }
      );
    }
  }, [open, editingData, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
      <DialogContent title={isEdit ? t("item.formTitleEdit") : t("item.formTitleAdd")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("item.unit")}</Label>
              <Input {...register("unit")} list="unit-suggestions" placeholder="e.g. m, pcs, box" />
              <datalist id="unit-suggestions">
                {UNIT_SUGGESTIONS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
              {errors.unit && <p className="mt-1 text-xs text-destructive">{errors.unit.message}</p>}
            </div>
          </div>

          <div>
            <Label>{t("item.itemName")}</Label>
            <Input {...register("itemName")} placeholder="e.g. XLPE Cable 1C x 500mm" />
            {errors.itemName && (
              <p className="mt-1 text-xs text-destructive">{errors.itemName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("item.category")}</Label>
              <Input {...register("category")} placeholder="e.g. Electrical, Consumable" />
              {errors.category && (
                <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>
            <div>
              <Label>{t("item.minStock")}</Label>
              <Input type="number" step="any" {...register("minStockLevel")} />
              {errors.minStockLevel && (
                <p className="mt-1 text-xs text-destructive">{errors.minStockLevel.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>{t("item.description")}</Label>
            <Input {...register("description")} placeholder={t("item.descriptionPlaceholder")} />
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
