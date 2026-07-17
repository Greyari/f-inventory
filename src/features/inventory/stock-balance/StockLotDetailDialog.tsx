import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { StockLot } from "@/types/inventory.types";

interface StockLotDetailDialogProps {
  itemName: string | null;
  lots: StockLot[];
  onOpenChange: (open: boolean) => void;
}

export function StockLotDetailDialog({ itemName, lots, onOpenChange }: StockLotDetailDialogProps) {
  const { t } = useTranslation();
  const totalBalance = lots.reduce((sum, lot) => sum + lot.balance, 0);
  const unit = lots[0]?.item?.unit;

  return (
    <Dialog open={!!itemName} onOpenChange={onOpenChange}>
      <DialogContent title={t("stockBalance.detailTitle", { name: itemName ?? "" })} className="max-w-xl">
        <p className="mb-3 text-sm text-muted-foreground">{t("stockBalance.detailSubtitle")}</p>

        <div className="mb-3 rounded-md border bg-muted/20 px-4 py-2 text-sm">
          <span className="text-muted-foreground">{t("stockBalance.totalBalance")}: </span>
          <span className="font-semibold">
            {totalBalance} {unit}
          </span>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2">{t("stockIn.projectRef")}</th>
                <th className="px-3 py-2">{t("stockIn.costCentre")}</th>
                <th className="px-3 py-2">{t("stockIn.costCode")}</th>
                <th className="px-3 py-2">{t("stockBalance.colBalanceHere")}</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <div className="font-medium">{lot.projectRef?.code}</div>
                    <div className="text-xs text-muted-foreground">{lot.projectRef?.description}</div>
                  </td>
                  <td className="px-3 py-2">{lot.costCentre?.code}</td>
                  <td className="px-3 py-2">{lot.costCode?.code}</td>
                  <td className="px-3 py-2 font-semibold">
                    {lot.balance} {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
