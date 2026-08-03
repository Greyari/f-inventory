import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAdjustStockLot } from "./stock-balance.hooks";
import type { StockBatch } from "@/types/inventory.types";

const schema = z.object({
  newQtyRemaining: z.coerce.number().min(0, "Qty gak boleh negatif"),
  reason: z.string().min(5, "Alasan wajib diisi, jelaskan sedikit lebih detail"),
});

type FormValues = z.infer<typeof schema>;

interface AdjustStockLotDialogProps {
  batch: StockBatch | null;
  onOpenChange: (open: boolean) => void;
}

export function AdjustStockLotDialog({ batch, onOpenChange }: AdjustStockLotDialogProps) {
  const { t } = useTranslation();
  const adjust = useAdjustStockLot();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (batch) reset({ newQtyRemaining: batch.qtyRemaining, reason: "" });
  }, [batch, reset]);

  if (!batch) return null;

  const onSubmit = async (values: FormValues) => {
    await adjust.mutateAsync({ stockBatchId: batch.id, newQtyRemaining: values.newQtyRemaining, reason: values.reason });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!batch} onOpenChange={onOpenChange}>
      <DialogContent title={t("stockBalance.adjustTitle")} className="max-w-lg">
        <div className="mb-3 rounded-md border bg-muted/20 p-3 text-sm">
          <p className="font-medium">{batch.item?.itemName}</p>
          <p className="text-xs text-muted-foreground">
            {batch.projectName} · {batch.projectRef?.code} / {batch.costCentre?.code} / {batch.costCode?.code}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("stockBalance.qtyReceived")}: <span className="font-semibold text-foreground">{batch.qtyReceived}</span>
            {" · "}
            {t("stockBalance.currentBalance")}: <span className="font-semibold text-foreground">{batch.qtyRemaining}</span>{" "}
            {batch.item?.unit}
          </p>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{t("stockBalance.adjustWarning")}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>{t("stockBalance.newBalance")}</Label>
            <Input type="number" step="any" {...register("newQtyRemaining")} />
            {errors.newQtyRemaining && <p className="mt-1 text-xs text-destructive">{errors.newQtyRemaining.message}</p>}
          </div>

          <div>
            <Label>{t("stockOut.reason")}</Label>
            <Textarea rows={3} placeholder={t("stockBalance.adjustReasonPlaceholder")} {...register("reason")} />
            {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="destructive" disabled={adjust.isPending}>
              {adjust.isPending ? t("common.saving") : t("stockBalance.confirmAdjust")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
