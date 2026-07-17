import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/store/confirmStore";

export function ConfirmDialog() {
  const { t } = useTranslation();
  const { isOpen, title, description, confirmText, cancelText, variant, handleConfirm, handleCancel } =
    useConfirmStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent title={title ?? t("common.confirm")} className="max-w-sm">
        <div className="flex gap-3">
          {variant === "destructive" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          )}
          <p className="pt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText ?? t("common.cancel")}
          </Button>
          <Button variant={variant === "destructive" ? "destructive" : "default"} onClick={handleConfirm}>
            {confirmText ?? t("common.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
