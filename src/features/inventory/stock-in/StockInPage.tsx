import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockIns, useDeleteStockIn } from "./stock-in.hooks";
import { StockInFormDialog } from "./StockInFormDialog";
import { useHasPermission } from "@/store/authStore";
import type { StockIn } from "@/types/inventory.types";

export default function StockInPage() {
  const canDelete = useHasPermission("stock-in.delete");
  const canCreate = useHasPermission("stock-in.create");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useStockIns({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteStockIn();

  useEffect(() => setPage(1), [debouncedSearch]);

  const handleDelete = (row: StockIn) => {
    if (confirm(`Hapus data barang masuk "${row.referenceNo}"?`)) {
      deleteMutation.mutate(row.id);
    }
  };

  const columns: Column<StockIn>[] = [
    { header: "No. Referensi", accessor: (r) => <span className="font-medium">{r.referenceNo}</span> },
    { header: "Tanggal Diterima", accessor: (r) => r.dateReceived },
    {
      header: "Item",
      accessor: (r) => (
        <div className="space-y-0.5">
          {r.items.map((it, i) => (
            <div key={i} className="text-xs">
              {it.item?.itemName ?? it.itemId} — {it.qty} {it.item?.unit}
              {it.location && <span className="text-muted-foreground"> ({it.location})</span>}
            </div>
          ))}
        </div>
      ),
    },
    { header: "Link PO", accessor: (r) => (r.purchaseId ? "Ya" : "-") },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Barang Masuk</h2>
        <p className="text-sm text-muted-foreground">Catatan penerimaan barang ke gudang</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nomor referensi..."
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canCreate && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Catat Barang Masuk
            </Button>
          )
        }
        rowActions={
          canDelete
            ? (row) => (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(row)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )
            : undefined
        }
      />

      <StockInFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
