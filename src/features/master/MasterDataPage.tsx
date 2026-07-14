import { useState } from "react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/store/authStore";
import JobCodeListPage from "./job-codes/JobCodeListPage";
import ItemListPage from "./items/ItemListPage";
import SupplierListPage from "./suppliers/SupplierListPage";

type Tab = "job-codes" | "items" | "suppliers";

export default function MasterDataPage() {
  const canJobCodes = useHasPermission("job-codes.manage");
  const canItems = useHasPermission("items.manage");
  const canSuppliers = useHasPermission("suppliers.manage");

  const TABS: { key: Tab; label: string; visible: boolean }[] = [
    { key: "job-codes", label: "Job Code (Project Ref / Cost Centre / Cost Code)", visible: canJobCodes },
    { key: "items", label: "Item / Barang", visible: canItems },
    { key: "suppliers", label: "Supplier", visible: canSuppliers },
  ];

  const [tab, setTab] = useState<Tab>(TABS.find((t) => t.visible)?.key ?? "job-codes");

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold">Data Master</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Kelola data referensi yang dipakai di form Purchasing dan Inventory.
      </p>

      <div className="mb-4 flex gap-1 border-b">
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
      {tab === "suppliers" && canSuppliers && <SupplierListPage />}
    </div>
  );
}
