import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ItemPickerField } from "@/components/common/ItemPickerField";
import { JobCodePickerField } from "@/components/common/JobCodePickerField";
import { useAddDirectStock } from "./stock-balance.hooks";

const schema = z.object({
  itemId: z.string().min(1, "Item wajib dipilih"),
  projectName: z.string().min(1, "Nama project wajib diisi — ini yang bedain batch ini punya project mana"),
  projectRefId: z.string().min(1, "Wajib dipilih"),
  costCentreId: z.string().min(1, "Wajib dipilih"),
  costCodeId: z.string().min(1, "Wajib dipilih"),
  qty: z.coerce.number().min(0.01, "Qty harus > 0"),
  reason: z.string().min(5, "Alasan wajib diisi, jelaskan sedikit lebih detail"),
});

type FormValues = z.infer<typeof schema>;

interface AddDirectStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDirectStockDialog({ open, onOpenChange }: AddDirectStockDialogProps) {
  const { t } = useTranslation();
  const addDirect = useAddDirectStock();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await addDirect.mutateAsync(values);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t("stockBalance.addDirectTitle")} className="max-w-lg">
        <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{t("stockBalance.addDirectWarning")}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>{t("common.selectItem")}</Label>
            <Controller
              control={control}
              name="itemId"
              render={({ field }) => (
                <ItemPickerField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("common.selectItem")}
                  error={!!errors.itemId}
                />
              )}
            />
            {errors.itemId && <p className="mt-1 text-xs text-destructive">{errors.itemId.message}</p>}
          </div>

          <div>
            <Label>{t("stockIn.project")}</Label>
            <Input {...register("projectName")} placeholder="e.g. Batching Plant 5" />
            <p className="mt-1 text-xs text-muted-foreground">{t("stockBalance.projectNameHint")}</p>
            {errors.projectName && <p className="mt-1 text-xs text-destructive">{errors.projectName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>{t("stockIn.projectRef")}</Label>
              <Controller
                control={control}
                name="projectRefId"
                render={({ field }) => (
                  <JobCodePickerField
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("common.selectCode")}
                    error={!!errors.projectRefId}
                  />
                )}
              />
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
                    placeholder={t("common.selectCode")}
                    error={!!errors.costCentreId}
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
                    placeholder={t("common.selectCode")}
                    error={!!errors.costCodeId}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Label>{t("stockBalance.qtyToAdd")}</Label>
            <Input type="number" step="any" placeholder="0" {...register("qty")} />
            {errors.qty && <p className="mt-1 text-xs text-destructive">{errors.qty.message}</p>}
          </div>

          <div>
            <Label>{t("stockOut.reason")}</Label>
            <Textarea rows={3} placeholder={t("stockBalance.addDirectReasonPlaceholder")} {...register("reason")} />
            {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="destructive" disabled={addDirect.isPending}>
              {addDirect.isPending ? t("common.saving") : t("stockBalance.confirmAddDirect")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
