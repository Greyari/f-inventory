import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useItems, useDeleteItem } from "./item.hooks";
import { ItemFormDialog } from "./ItemFormDialog";
import { useHasPermission } from "@/store/authStore";
import { useConfirm } from "@/store/confirmStore";
import type { Item } from "@/types/inventory.types";

export default function ItemListPage() {
  const canManage = useHasPermission("items.manage");
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<Item | null>(null);

  const { data, isLoading } = useItems({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteItem();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openCreate = () => {
    setEditingData(null);
    setDialogOpen(true);
  };

  const openEdit = (row: Item) => {
    setEditingData(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row: Item) => {
    const ok = await confirm({
      description: `Hapus item "${row.itemName}"? Tindakan ini tidak bisa dibatalkan.`,
      variant: "destructive",
      confirmText: "Ya, Hapus",
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<Item>[] = [
    { header: "Kode", accessor: (r) => <span className="font-medium">{r.itemCode}</span> },
    { header: "Nama Barang", accessor: (r) => r.itemName },
    { header: "Kategori", accessor: (r) => r.category },
    { header: "Satuan", accessor: (r) => r.unit },
    { header: "Stok Min.", accessor: (r) => r.minStockLevel },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kode atau nama barang..."
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canManage && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Tambah Item
            </Button>
          )
        }
        rowActions={
          canManage
            ? (row) => (
                <>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )
            : undefined
        }
      />

      <ItemFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingData={editingData} />
    </div>
  );
}
