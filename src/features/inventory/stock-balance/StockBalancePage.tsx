import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockLots } from "./stock-balance.hooks";
import type { StockLot } from "@/types/inventory.types";

export default function StockBalancePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useStockLots(debouncedSearch);

  const itemTotals = useMemo(() => {
    if (!data) return new Map<string, number>();
    const map = new Map<string, number>();
    data.forEach((lot) => {
      map.set(lot.itemId, (map.get(lot.itemId) ?? 0) + lot.balance);
    });
    return map;
  }, [data]);

  const lowStockItems = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    return data.filter((lot) => {
      if (seen.has(lot.itemId)) return false;
      seen.add(lot.itemId);
      const total = itemTotals.get(lot.itemId) ?? 0;
      return lot.item && total <= lot.item.minStockLevel;
    });
  }, [data, itemTotals]);

  const columns: Column<StockLot>[] = [
    { header: t("stockBalance.colItemCode"), accessor: (r) => <span className="font-medium">{r.item?.itemCode}</span> },
    { header: t("stockBalance.colItemName"), accessor: (r) => r.item?.itemName },
    {
      header: t("stockBalance.colProjectRef"),
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.projectRef?.code} / {r.costCentre?.code} / {r.costCode?.code}
        </span>
      ),
      hideOnMobile: true,
    },
    { header: t("stockBalance.colBalanceHere"), accessor: (r) => <span className="font-semibold">{r.balance}</span> },
    { header: t("stockBalance.colUnit"), accessor: (r) => r.item?.unit, hideOnMobile: true },
    {
      header: t("stockBalance.colTotalItem"),
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {itemTotals.get(r.itemId)} {r.item?.unit}
        </span>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t("stockBalance.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("stockBalance.subtitle")}</p>
        </div>
        {lowStockItems.length > 0 && (
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t("stockBalance.lowStockBadge", { count: lowStockItems.length })}
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("stockBalance.searchPlaceholder")}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}
