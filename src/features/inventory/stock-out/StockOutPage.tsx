import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockOuts, useDeleteStockOut } from "./stock-out.hooks";
import { StockOutFormDialog } from "./StockOutFormDialog";
import { useHasPermission } from "@/store/authStore";
import type { StockOut } from "@/types/inventory.types";

export default function StockOutPage() {
  const canDelete = useHasPermission("stock-out.delete");
  const canCreate = useHasPermission("stock-out.create");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useStockOuts({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteStockOut();

  useEffect(() => setPage(1), [debouncedSearch]);

  const handleDelete = (row: StockOut) => {
    if (confirm(`Hapus data barang keluar "${row.referenceNo}"?`)) {
      deleteMutation.mutate(row.id);
    }
  };

  const columns: Column<StockOut>[] = [
    { header: "No. Referensi", accessor: (r) => <span className="font-medium">{r.referenceNo}</span> },
    { header: "Tanggal Keluar", accessor: (r) => r.dateIssued },
    { header: "Project", accessor: (r) => r.project?.code ?? "-" },
    { header: "Diserahkan Ke", accessor: (r) => r.issuedTo ?? "-" },
    {
      header: "Item",
      accessor: (r) => (
        <div className="space-y-0.5">
          {r.items.map((it, i) => (
            <div key={i} className="text-xs">
              {it.item?.itemName ?? it.itemId} — {it.qty} {it.item?.unit}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Barang Keluar</h2>
        <p className="text-sm text-muted-foreground">Catatan pengeluaran barang dari gudang</p>
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
              <Plus className="h-4 w-4" /> Catat Barang Keluar
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

      <StockOutFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
