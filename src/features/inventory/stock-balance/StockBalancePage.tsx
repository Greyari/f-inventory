import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, PackagePlus } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockLots } from "./stock-balance.hooks";
import { useHasPermission } from "@/store/authStore";
import { AddDirectStockDialog } from "./AddDirectStockDialog";
import type { StockLotSummary } from "@/types/inventory.types";

interface ItemSummary {
  itemId: string;
  itemName?: string;
  unit?: string;
  minStockLevel?: number;
  totalBalance: number;
  // Jumlah kelompok project berbeda (bukan jumlah batch mentah) yang
  // nyumbang ke total ini — biar kelihatan kalau 1 item dipesan dari
  // beberapa project berbeda.
  groupCount: number;
}

export default function StockBalancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canAddDirect = useHasPermission("stock-lots.adjust");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [addDirectOpen, setAddDirectOpen] = useState(false);
  const { data, isLoading } = useStockLots(debouncedSearch);

  // Backend udah nge-group per (item+project ref+cost centre+cost code+
  // project_name). Di sini digabung lagi jadi 1 baris per ITEM doang buat
  // tabel ringkasan utama.
  const itemSummaries = useMemo<ItemSummary[]>(() => {
    if (!data) return [];
    const map = new Map<string, ItemSummary>();
    data.forEach((row: StockLotSummary) => {
      const existing = map.get(row.itemId);
      if (existing) {
        existing.totalBalance += row.balance;
        existing.groupCount += 1;
      } else {
        map.set(row.itemId, {
          itemId: row.itemId,
          itemName: row.item?.itemName,
          unit: row.item?.unit,
          minStockLevel: row.item?.minStockLevel,
          totalBalance: row.balance,
          groupCount: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.itemName ?? "").localeCompare(b.itemName ?? ""));
  }, [data]);

  const columns: Column<ItemSummary>[] = [
    { header: t("stockBalance.colItemName"), accessor: (r) => r.itemName },
    { header: t("stockBalance.colUnit"), accessor: (r) => r.unit, hideOnMobile: true },
    { header: t("stockBalance.colLots"), accessor: (r) => r.groupCount, hideOnMobile: true },
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
        {canAddDirect && (
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
            onClick={() => setAddDirectOpen(true)}
          >
            <PackagePlus className="h-4 w-4" /> {t("stockBalance.addDirectButton")}
          </Button>
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

      {canAddDirect && <AddDirectStockDialog open={addDirectOpen} onOpenChange={setAddDirectOpen} />}
    </div>
  );
}
