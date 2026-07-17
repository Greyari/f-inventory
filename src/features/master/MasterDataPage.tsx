import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/store/authStore";
import JobCodeListPage from "./job-codes/JobCodeListPage";
import ItemListPage from "./items/ItemListPage";

type Tab = "job-codes" | "items";

export default function MasterDataPage() {
  const { t } = useTranslation();
  const canJobCodes = useHasPermission("job-codes.manage");
  const canItems = useHasPermission("items.manage");

  const TABS: { key: Tab; label: string; visible: boolean }[] = [
    { key: "job-codes", label: t("master.tabJobCode"), visible: canJobCodes },
    { key: "items", label: t("master.tabItem"), visible: canItems },
  ];

  const [tab, setTab] = useState<Tab>(TABS.find((t) => t.visible)?.key ?? "job-codes");

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold">{t("master.title")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("master.subtitle")}</p>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b">
        {TABS.filter((t) => t.visible).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "job-codes" && canJobCodes && <JobCodeListPage />}
      {tab === "items" && canItems && <ItemListPage />}
    </div>
  );
}
