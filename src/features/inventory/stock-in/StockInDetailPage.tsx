import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, PackageCheck } from "lucide-react";
import { useStockInDetail } from "./stock-in.hooks";
import { StockInStatusBadge } from "./StockInStatusBadge";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/store/authStore";

export default function StockInDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useStockInDetail(id);
  const canMarkDo = useHasPermission("stock-in.mark-do");

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

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">{t("stockIn.detailTitle")}</h2>
          <StockInStatusBadge status={data.status} />
        </div>
        {canMarkDo && data.status === "npr" && (
          <Button size="sm" onClick={() => navigate(`/inventory/stock-in/${data.id}/mark-do`)}>
            <PackageCheck className="h-4 w-4" /> {t("stockIn.markAsDo")}
          </Button>
        )}
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
          <div className="space-y-2">
            {data.items.map((it, i) => (
              <div key={i} className="rounded-lg border bg-background p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{it.item?.itemName ?? it.itemId}</span>
                  <span className="text-muted-foreground">
                    {it.qty} {it.item?.unit}
                  </span>
                </div>

                {data.status === "do" && (
                  <div className="mt-2 grid grid-cols-1 gap-2 border-t pt-2 text-xs sm:grid-cols-3">
                    <Field label={t("stockIn.vendorName")} value={it.vendorName} />
                    <Field
                      label={t("stockIn.price")}
                      value={it.price != null ? it.price.toLocaleString("id-ID") : "-"}
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("stockIn.photos")}</p>
                      {it.photos && it.photos.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {it.photos.map((photo) => (
                            <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                              <img
                                src={photo.url}
                                alt=""
                                className="h-12 w-12 rounded border object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="font-medium">-</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
