import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStockOutDetail } from "./stock-out.hooks";

interface StockOutDetailDialogProps {
  id: string | null;
  onOpenChange: (open: boolean) => void;
}

export function StockOutDetailDialog({ id, onOpenChange }: StockOutDetailDialogProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useStockOutDetail(id ?? undefined);

  return (
    <Dialog open={!!id} onOpenChange={onOpenChange}>
      <DialogContent title={t("stockOut.detailTitle")} className="max-w-2xl">
        {isLoading || !data ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/20 p-4 text-sm sm:grid-cols-2">
              <Field label={t("stockOut.detailReference")} value={data.referenceNo} />
              <Field label={t("stockOut.dateIssued")} value={data.dateIssued} />
              <Field label={t("stockOut.approvedBy")} value={data.approvedBy} />
              <Field label={t("stockOut.issuedTo")} value={data.issuedTo} />
              <Field label={t("stockOut.project")} value={data.projectName} />
              <Field label={t("stockOut.projectRef")} value={data.projectRef?.code} />
              <Field label={t("stockOut.costCentre")} value={data.costCentre?.code} />
              <Field label={t("stockOut.costCodeSource")} value={data.costCode?.code} />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">{t("stockOut.itemsOut")}</p>
              {data.items.map((it, i) => (
                <div key={i} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{it.item?.itemName ?? it.itemId}</span>
                    <span className="text-muted-foreground">
                      {it.qty} {it.item?.unit}
                    </span>
                  </div>
                  <p className="mb-1 text-xs text-muted-foreground">{t("stockOut.sourceBreakdown")}:</p>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/40 text-left uppercase text-muted-foreground">
                          <th className="px-3 py-1.5">{t("stockOut.projectRef")}</th>
                          <th className="px-3 py-1.5">{t("stockOut.costCentre")}</th>
                          <th className="px-3 py-1.5">{t("stockOut.costCodeSource")}</th>
                          <th className="px-3 py-1.5">{t("stockIn.qty")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {it.allocations.map((a, j) => (
                          <tr key={j} className="border-b last:border-0">
                            <td className="px-3 py-1.5">{a.projectRef?.code ?? "-"}</td>
                            <td className="px-3 py-1.5">{a.costCentre?.code ?? "-"}</td>
                            <td className="px-3 py-1.5">{a.costCode?.code ?? "-"}</td>
                            <td className="px-3 py-1.5 font-medium">{a.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
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
