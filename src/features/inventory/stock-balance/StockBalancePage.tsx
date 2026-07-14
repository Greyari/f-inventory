import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockBalances } from "./stock-balance.hooks";
import type { StockBalance } from "@/types/inventory.types";

export default function StockBalancePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading } = useStockBalances(debouncedSearch);

  const filtered = useMemo(() => {
    if (!data) return [];
    return lowStockOnly ? data.filter((d) => d.status === "LOW_STOCK") : data;
  }, [data, lowStockOnly]);

  const lowStockCount = data?.filter((d) => d.status === "LOW_STOCK").length ?? 0;

  const columns: Column<StockBalance>[] = [
    { header: "Kode", accessor: (r) => <span className="font-medium">{r.itemCode}</span> },
    { header: "Nama Barang", accessor: (r) => r.itemName },
    { header: "Satuan", accessor: (r) => r.unit },
    { header: "Total Masuk", accessor: (r) => r.totalIn },
    { header: "Total Keluar", accessor: (r) => r.totalOut },
    { header: "Sisa Stok", accessor: (r) => <span className="font-semibold">{r.balance}</span> },
    { header: "Stok Min.", accessor: (r) => r.minStockLevel },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Stok Tersisa</h2>
          <p className="text-sm text-muted-foreground">
            Dihitung otomatis dari total barang masuk dikurangi barang keluar
          </p>
        </div>
        {lowStockCount > 0 && (
          <button
            onClick={() => setLowStockOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              lowStockOnly ? "bg-destructive text-white" : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {lowStockCount} item stok rendah
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kode atau nama barang..."
        keyExtractor={(r) => r.itemId}
      />
    </div>
  );
}
