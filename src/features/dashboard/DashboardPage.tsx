import { useTranslation } from "react-i18next";
import { Package, AlertTriangle, Layers } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useDashboardSummary } from "./dashboard.hooks";
import { useCurrentUser } from "@/store/authStore";
import { cn } from "@/lib/utils";

const CARD_CONFIG = [
  { key: "totalItems", labelKey: "dashboard.totalItems", icon: Package, color: "text-blue-600 bg-blue-100" },
  { key: "lowStockCount", labelKey: "dashboard.lowStock", icon: AlertTriangle, color: "text-red-600 bg-red-100" },
  { key: "totalLots", labelKey: "dashboard.totalLots", icon: Layers, color: "text-indigo-600 bg-indigo-100" },
] as const;

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { data, isLoading } = useDashboardSummary();

  const pieData = data
    ? [
        { name: t("dashboard.stockSafe"), value: data.totalItems - data.lowStockCount },
        { name: t("dashboard.stockLow"), value: data.lowStockCount },
      ]
    : [];

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold">{t("dashboard.title")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("common.welcomeBack", { name: user?.name })}. {t("dashboard.subtitle")}
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CARD_CONFIG.map((card) => (
          <div key={card.key} className="rounded-lg border bg-background p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t(card.labelKey)}</span>
              <div className={cn("rounded-full p-2", card.color)}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold">
              {isLoading ? "…" : (data?.[card.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {!isLoading && data && data.totalItems > 0 && (
        <div className="rounded-lg border bg-background p-5">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{t("dashboard.stockHealth")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  <Cell fill="oklch(0.65 0.18 145)" />
                  <Cell fill="oklch(0.577 0.245 27.325)" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
