import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockLots } from "./stock-balance.hooks";
import type { StockLot } from "@/types/inventory.types";

interface ItemSummary {
  itemId: string;
  itemCode?: string;
  itemName?: string;
  unit?: string;
  minStockLevel?: number;
  totalBalance: number;
  lotCount: number;
  lots: StockLot[];
}

export default function StockBalancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useStockLots(debouncedSearch);

  // Gabungkan semua lot jadi 1 baris per item
  const itemSummaries = useMemo<ItemSummary[]>(() => {
    if (!data) return [];
    const map = new Map<string, ItemSummary>();

    data.forEach((lot) => {
      const existing = map.get(lot.itemId);
      if (existing) {
        existing.totalBalance += lot.balance;
        existing.lotCount += 1;
        existing.lots.push(lot);
      } else {
        map.set(lot.itemId, {
          itemId: lot.itemId,
          itemCode: lot.item?.itemCode,
          itemName: lot.item?.itemName,
          unit: lot.item?.unit,
          minStockLevel: lot.item?.minStockLevel,
          totalBalance: lot.balance,
          lotCount: 1,
          lots: [lot],
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => (a.itemName ?? "").localeCompare(b.itemName ?? ""));
  }, [data]);

  const lowStockItems = itemSummaries.filter(
    (item) => item.minStockLevel !== undefined && item.totalBalance <= item.minStockLevel
  );

  const columns: Column<ItemSummary>[] = [
    { header: t("stockBalance.colItemCode"), accessor: (r) => <span className="font-medium">{r.itemCode}</span> },
    { header: t("stockBalance.colItemName"), accessor: (r) => r.itemName },
    { header: t("stockBalance.colUnit"), accessor: (r) => r.unit, hideOnMobile: true },
    { header: t("stockBalance.colLots"), accessor: (r) => r.lotCount, hideOnMobile: true },
    {
      header: t("stockBalance.totalBalance"),
      accessor: (r) => <span className="font-semibold">{r.totalBalance}</span>,
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
        data={itemSummaries}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("stockBalance.searchPlaceholder")}
        keyExtractor={(r) => r.itemId}
        rowActions={(row) => (
          <Button
            variant="ghost"
            size="icon"
            title={t("stockBalance.detailButton")}
            onClick={() => navigate(`/inventory/stock-balance/${row.itemId}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
}
