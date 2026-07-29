import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/store/authStore";
import AssetListPage from "./AssetListPage";
import AssetUsageListPage from "./AssetUsageListPage";

type Tab = "list" | "usage";

export default function AssetPage() {
  const { t } = useTranslation();
  const canManageAssets = useHasPermission("assets.manage");
  const canSeeUsage = useHasPermission("asset-usages.checkout") || useHasPermission("asset-usages.return");

  const TABS: { key: Tab; label: string; visible: boolean }[] = [
    { key: "list", label: t("asset.tabList"), visible: true },
    { key: "usage", label: t("asset.tabUsage"), visible: canSeeUsage || canManageAssets },
  ];

  const [tab, setTab] = useState<Tab>("list");

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b">
        {TABS.filter((tabItem) => tabItem.visible).map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === tabItem.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "list" && <AssetListPage />}
      {tab === "usage" && <AssetUsageListPage />}
    </div>
  );
}
