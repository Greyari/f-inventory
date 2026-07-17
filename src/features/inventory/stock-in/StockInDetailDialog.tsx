import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStockInDetail } from "./stock-in.hooks";

interface StockInDetailDialogProps {
  id: string | null;
  onOpenChange: (open: boolean) => void;
}

export function StockInDetailDialog({ id, onOpenChange }: StockInDetailDialogProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useStockInDetail(id ?? undefined);

  return (
    <Dialog open={!!id} onOpenChange={onOpenChange}>
      <DialogContent title={t("stockIn.detailTitle")} className="max-w-2xl">
        {isLoading || !data ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/20 p-4 text-sm sm:grid-cols-2">
              <Field label={t("stockIn.detailReference")} value={data.referenceNo} />
              <Field label={t("stockIn.dateReceived")} value={data.dateReceived} />
              <Field label={t("stockIn.approvedBy")} value={data.approvedBy} />
              <Field label={t("stockIn.project")} value={data.projectName} />
              <Field label={t("stockIn.projectRef")} value={data.projectRef?.code} />
              <Field label={t("stockIn.costCentre")} value={data.costCentre?.code} />
              <Field label={t("stockIn.costCode")} value={data.costCode?.code} />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("stockIn.items")}</p>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-2">{t("item.itemCode")}</th>
                      <th className="px-3 py-2">{t("item.itemName")}</th>
                      <th className="px-3 py-2">{t("stockIn.qty")}</th>
                      <th className="px-3 py-2">{t("stockIn.location")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((it, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">{it.item?.itemCode ?? "-"}</td>
                        <td className="px-3 py-2">{it.item?.itemName ?? it.itemId}</td>
                        <td className="px-3 py-2">
                          {it.qty} {it.item?.unit}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{it.location ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
