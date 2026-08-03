import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { useStockOutDetail } from "./stock-out.hooks";
import { StockOutActivityTimeline } from "./StockOutActivityTimeline";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/store/authStore";

export default function StockOutDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useStockOutDetail(id);
  const canOverride = useHasPermission("stock-out.override");

  if (isLoading || !data || !id) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={() => navigate("/inventory/stock-out")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t("stockOut.detailTitle")}</h2>
        {canOverride && (
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
            onClick={() => navigate(`/inventory/stock-out/${data.id}/edit`)}
          >
            <ShieldAlert className="h-4 w-4" /> {t("stockOut.editSuperAdmin")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 rounded-lg border bg-background p-5 text-sm sm:grid-cols-2">
            <Field label={t("stockOut.detailReference")} value={data.bNo} />
            <Field label={t("stockOut.dateIssued")} value={data.dateIssued} />
            <Field label={t("stockOut.issuedTo")} value={data.issuedTo} />
            <Field label={t("stockOut.project")} value={data.projectName} />
            <Field label={t("stockOut.projectRef")} value={data.projectRef?.code} />
            <Field label={t("stockOut.costCentre")} value={data.costCentre?.code} />
            <Field label={t("stockOut.costCodeSource")} value={data.costCode?.code} />
            <Field label={t("stockOut.createdAt")} value={formatDateTime(data.createdAt)} />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">{t("stockOut.itemsOut")}</p>
            {data.items.map((it, i) => (
              <div key={i} className="rounded-lg border bg-background p-4">
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
                        <th className="px-3 py-1.5">{t("stockOut.batchSource")}</th>
                        <th className="px-3 py-1.5">{t("stockIn.qty")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {it.allocations.map((a, j) => (
                        <tr key={j} className="border-b last:border-0">
                          <td className="px-3 py-1.5">{a.projectRef?.code ?? "-"}</td>
                          <td className="px-3 py-1.5">{a.costCentre?.code ?? "-"}</td>
                          <td className="px-3 py-1.5">{a.costCode?.code ?? "-"}</td>
                          <td className="px-3 py-1.5">
                            {a.batch?.sourceType === "stock_in" && a.batch.stockInId ? (
                              <Link to={`/inventory/stock-in/${a.batch.stockInId}`} className="text-primary hover:underline">
                                {a.batch.stockInPrNo}
                              </Link>
                            ) : (
                              <span className="text-amber-700">{t("stockOut.batchDirect")}</span>
                            )}
                          </td>
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

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <StockOutActivityTimeline stockOutId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
