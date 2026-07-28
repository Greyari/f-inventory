import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useStockInDetail } from "./stock-in.hooks";

export default function StockInDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useStockInDetail(id);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/inventory/stock-in")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{t("stockIn.detailTitle")}</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 rounded-lg border bg-background p-5 text-sm sm:grid-cols-2">
          <Field label={t("stockIn.detailReference")} value={data.prNo} />
          <Field label={t("stockIn.dateReceived")} value={data.dateReceived} />
          <Field label={t("stockIn.project")} value={data.projectName} />
          <Field label={t("stockIn.projectRef")} value={data.projectRef?.code} />
          <Field label={t("stockIn.costCentre")} value={data.costCentre?.code} />
          <Field label={t("stockIn.costCode")} value={data.costCode?.code} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("stockIn.items")}</p>
          <div className="overflow-x-auto rounded-lg border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">{t("item.itemName")}</th>
                  <th className="px-3 py-2">{t("stockIn.qty")}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((it, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-2">{it.item?.itemName ?? it.itemId}</td>
                    <td className="px-3 py-2">
                      {it.qty} {it.item?.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
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