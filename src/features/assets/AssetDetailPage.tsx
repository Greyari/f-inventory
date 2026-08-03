import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package, Users, Boxes, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAsset } from "./asset.hooks";
import { useAssetUsages } from "./asset-usage.hooks";

// Helper format tanggal & jam
const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export default function AssetDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { assetId } = useParams<{ assetId: string }>();

  const { data: asset, isLoading: isLoadingAsset } = useAsset(assetId);
  const { data: usageData, isLoading: isLoadingUsages } = useAssetUsages({
    assetId,
    limit: 50,
  });

  if (isLoadingAsset || !asset) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const usages = usageData?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate("/assets")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("asset.backToList")}
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {asset.assetCode} — {asset.assetName}
        </h2>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={Package} color="text-blue-600 bg-blue-100" label={t("asset.qty")} value={`${asset.qty}`} />
        <SummaryCard
          icon={Users}
          color="text-amber-600 bg-amber-100"
          label={t("asset.inUseQty")}
          value={`${asset.inUseQty}`}
        />
        <SummaryCard
          icon={Boxes}
          color="text-green-600 bg-green-100"
          label={t("asset.availableQty")}
          value={`${asset.availableQty}`}
          highlight
        />
      </div>

      {/* Info aset lainnya */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border bg-background p-5 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">{t("asset.notes")}</p>
          <p className="font-medium">{asset.notes || "-"}</p>
        </div>
      </div>

      {/* History pemakaian */}
      <div className="rounded-lg border bg-background">
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("asset.usageHistory")}</h3>
        </div>

        {isLoadingUsages ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : usages.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">{t("asset.noUsageHistory")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">{t("assetUsage.usedBy")}</th>
                  <th className="px-4 py-3">{t("assetUsage.purpose")}</th>
                  <th className="px-4 py-3">{t("asset.qty")}</th>
                  <th className="px-4 py-3 whitespace-nowrap">{t("assetUsage.checkoutDate")}</th>
                  <th className="px-4 py-3 whitespace-nowrap">{t("assetUsage.returnDate")}</th>
                  <th className="px-4 py-3">{t("assetUsage.status")}</th>
                  <th className="px-4 py-3">{t("assetUsage.returnCondition")}</th>
                  <th className="px-4 py-3">{t("assetUsage.returnNotes")}</th>
                  <th className="px-4 py-3">{t("assetUsage.returnPhoto")}</th>
                </tr>
              </thead>
              <tbody>
                {usages.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 align-middle">
                    <td className="px-4 py-3 font-medium">{u.usedBy}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.purpose}</td>
                    <td className="px-4 py-3">{u.qty}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDateTime(u.checkoutDate)}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDateTime(u.returnDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
                          u.status === "IN_USE"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        )}
                      >
                        {u.status === "IN_USE" ? t("assetUsage.statusInUse") : t("assetUsage.statusReturned")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.returnCondition ? (
                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-0.5 text-xs whitespace-nowrap",
                            u.returnCondition === "Baik"
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          )}
                        >
                          {t(`assetUsage.condition.${u.returnCondition}`)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-xs text-muted-foreground">
                      {u.returnNotes || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {u.returnPhotoUrl ? (
                        <a href={u.returnPhotoUrl} target="_blank" rel="noreferrer">
                          <img
                            src={u.returnPhotoUrl}
                            alt={t("assetUsage.returnPhoto")}
                            className="h-9 w-9 rounded object-cover ring-1 ring-border transition-transform hover:scale-105"
                          />
                        </a>
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  color,
  label,
  value,
  highlight,
}: {
  icon: typeof Package;
  color: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border bg-background p-5", highlight && "border-primary/40 bg-primary/5")}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("rounded-full p-2", color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}