import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, FileCheck2, PackageCheck, ShieldAlert } from "lucide-react";
import { useStockInDetail } from "./stock-in.hooks";
import { StockInStatusBadge } from "./StockInStatusBadge";
import { StockInActivityTimeline } from "./StockInActivityTimeline";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/store/authStore";

export default function StockInDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useStockInDetail(id);
  const canMarkPo = useHasPermission("stock-in.mark-po");
  const canMarkDo = useHasPermission("stock-in.mark-do");
  const canOverride = useHasPermission("stock-in.override");

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
        onClick={() => navigate("/inventory/stock-in")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">{t("stockIn.detailTitle")}</h2>
          <StockInStatusBadge status={data.status} />
        </div>
        <div className="flex gap-2">
          {canMarkPo && data.status === "npr" && (
            <Button size="sm" onClick={() => navigate(`/inventory/stock-in/${data.id}/mark-po`)}>
              <FileCheck2 className="h-4 w-4" /> {t("stockIn.markAsPo")}
            </Button>
          )}
          {canMarkDo && data.status === "po" && (
            <Button size="sm" onClick={() => navigate(`/inventory/stock-in/${data.id}/mark-do`)}>
              <PackageCheck className="h-4 w-4" /> {t("stockIn.markAsDo")}
            </Button>
          )}
          {canOverride && (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/5"
              onClick={() => navigate(`/inventory/stock-in/${data.id}/override`)}
            >
              <ShieldAlert className="h-4 w-4" /> {t("stockIn.overrideEdit")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 rounded-lg border bg-background p-5 text-sm sm:grid-cols-2">
            <Field label={t("stockIn.detailReference")} value={data.prNo} />
            <Field label={t("stockIn.dateReceived")} value={data.dateReceived} />
            <Field label={t("stockIn.project")} value={data.projectName} />
            <Field label={t("stockIn.projectRef")} value={data.projectRef?.code} />
            <Field label={t("stockIn.costCentre")} value={data.costCentre?.code} />
            <Field label={t("stockIn.costCode")} value={data.costCode?.code} />
          </div>

          {(data.poPhotoUrl || data.doPhotoUrl) && (
            <div className="grid grid-cols-1 gap-3 rounded-lg border bg-background p-5 text-sm sm:grid-cols-2">
              {data.poPhotoUrl && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">{t("stockIn.poPhoto")}</p>
                  <a href={data.poPhotoUrl} target="_blank" rel="noreferrer">
                    <img src={data.poPhotoUrl} alt="Foto PO" className="h-32 w-32 rounded border object-cover" />
                  </a>
                </div>
              )}
              {data.doPhotoUrl && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">{t("stockIn.doPhoto")}</p>
                  <a href={data.doPhotoUrl} target="_blank" rel="noreferrer">
                    <img src={data.doPhotoUrl} alt="Foto DO" className="h-32 w-32 rounded border object-cover" />
                  </a>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("stockIn.items")}</p>
            <div className="space-y-2">
              {data.items.map((it, i) => (
                <div key={i} className="rounded-lg border bg-background p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{it.item?.itemName ?? it.itemId}</span>
                    <span className="text-muted-foreground">
                      {it.qty} {it.item?.unit}
                    </span>
                  </div>

                  {data.status !== "npr" && (
                    <div className="mt-2 grid grid-cols-1 gap-2 border-t pt-2 text-xs sm:grid-cols-2">
                      <Field label={t("stockIn.vendorName")} value={it.vendorName} />
                      <Field
                        label={t("stockIn.price")}
                        value={it.price != null ? it.price.toLocaleString("id-ID") : "-"}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <StockInActivityTimeline stockInId={id} />
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
