import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  Layers,
  PackagePlus,
  PackageMinus,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { useDashboardSummary, type RecentActivity, type RecentActivityType } from "./dashboard.hooks";
import { useCurrentUser } from "@/store/authStore";
import { cn } from "@/lib/utils";

const CARD_CONFIG = [
  { key: "totalItems", labelKey: "dashboard.totalItems", icon: Package, color: "text-blue-600 bg-blue-100" },
  { key: "lowStockCount", labelKey: "dashboard.lowStock", icon: AlertTriangle, color: "text-red-600 bg-red-100" },
  { key: "totalBatches", labelKey: "dashboard.totalLots", icon: Layers, color: "text-indigo-600 bg-indigo-100" },
  {
    key: "stockInThisMonth",
    labelKey: "dashboard.stockInThisMonth",
    icon: PackagePlus,
    color: "text-green-600 bg-green-100",
  },
  {
    key: "stockOutThisMonth",
    labelKey: "dashboard.stockOutThisMonth",
    icon: PackageMinus,
    color: "text-amber-600 bg-amber-100",
  },
  { key: "totalAssets", labelKey: "asset.totalAssets", icon: Boxes, color: "text-purple-600 bg-purple-100" },
  {
    key: "assetsInUseQty",
    labelKey: "dashboard.assetsInUse",
    icon: ArrowUpFromLine,
    color: "text-orange-600 bg-orange-100",
  },
] as const;

const ACTIVITY_ICON: Record<RecentActivityType, typeof PackagePlus> = {
  in: PackagePlus,
  out: PackageMinus,
  asset_checkout: ArrowUpFromLine,
  asset_return: ArrowDownToLine,
};

const ACTIVITY_COLOR: Record<RecentActivityType, string> = {
  in: "bg-green-100 text-green-600",
  out: "bg-amber-100 text-amber-600",
  asset_checkout: "bg-orange-100 text-orange-600",
  asset_return: "bg-teal-100 text-teal-600",
};

const ACTIVITY_BADGE: Record<RecentActivityType, string> = {
  in: "bg-green-100 text-green-700",
  out: "bg-amber-100 text-amber-700",
  asset_checkout: "bg-orange-100 text-orange-700",
  asset_return: "bg-teal-100 text-teal-700",
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data, isLoading } = useDashboardSummary();

  const goToActivity = (activity: RecentActivity) => {
    if (activity.type === "in") navigate(`/inventory/stock-in/${activity.id}`);
    else if (activity.type === "out") navigate(`/inventory/stock-out/${activity.id}`);
    else navigate("/assets");
  };

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold">{t("dashboard.title")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("common.welcomeBack", { name: user?.name })}. {t("dashboard.subtitle")}
      </p>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {CARD_CONFIG.map((card) => (
          <div key={card.key} className="rounded-lg border bg-background p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t(card.labelKey)}</span>
              <div className={cn("rounded-full p-2", card.color)}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold">{isLoading ? "…" : (data?.[card.key] ?? 0)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly trend — garis melengkung (area chart, smooth) */}
        <div className="rounded-lg border bg-background p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{t("dashboard.monthlyTrend")}</h3>
          <div className="h-full pb-5">
            {!isLoading && data && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrend}>
                  <defs>
                    <linearGradient id="fillIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.75 0.15 70)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="oklch(0.75 0.15 70)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalIn"
                    name={t("dashboard.activityIn")}
                    stroke="oklch(0.65 0.18 145)"
                    strokeWidth={2.5}
                    fill="url(#fillIn)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalOut"
                    name={t("dashboard.activityOut")}
                    stroke="oklch(0.75 0.15 70)"
                    strokeWidth={2.5}
                    fill="url(#fillOut)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          {/* Low stock list */}
          <div className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">{t("dashboard.lowStockList")}</h3>
              {data && data.lowStockCount > 0 && (
                <button
                  onClick={() => navigate("/inventory/stock-balance")}
                  className="text-xs text-primary hover:underline"
                >
                  {t("dashboard.viewAll")}
                </button>
              )}
            </div>

            {!isLoading && data && data.lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dashboard.lowStockEmpty")}</p>
            ) : (
              <div className="space-y-3">
                {data?.lowStockItems.map((item) => (
                  <button
                    key={item.itemId}
                    onClick={() => navigate(`/inventory/stock-balance/${item.itemId}`)}
                    className="flex w-full items-center justify-between rounded-md border border-red-100 bg-red-50 px-3 py-2 text-left transition-colors hover:bg-red-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.itemName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-red-700">
                        {item.balance} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("dashboard.minLevel", { value: `${item.minStockLevel} ${item.unit}` })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Asset category breakdown */}
          {data && data.totalAssets > 0 && (
            <div className="rounded-lg border bg-background p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground">{t("asset.categoriesBreakdown")}</h3>
                <button onClick={() => navigate("/assets")} className="text-xs text-primary hover:underline">
                  {t("dashboard.viewAll")}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.assetsByCategory.map((c) => (
                  <span key={c.category} className="rounded-full bg-muted px-2 py-1 text-xs">
                    {c.category}: <span className="font-semibold">{c.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity — gabungan Barang Masuk, Barang Keluar, & Aset (checkout/return) */}
      <div className="mt-6 rounded-lg border bg-background p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{t("dashboard.recentActivity")}</h3>

        {!isLoading && data && data.recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.recentActivityEmpty")}</p>
        ) : (
          <div className="divide-y">
            {data?.recentActivity.map((activity) => {
              const Icon = ACTIVITY_ICON[activity.type];
              return (
                <button
                  key={`${activity.type}-${activity.id}`}
                  onClick={() => goToActivity(activity)}
                  className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0 hover:bg-muted/30"
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", ACTIVITY_COLOR[activity.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{activity.refNo}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {activity.subtitle} · {t("dashboard.itemsCount", { count: activity.itemCount })}
                    </p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", ACTIVITY_BADGE[activity.type])}>
                    {t(`dashboard.activity_${activity.type}`)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}