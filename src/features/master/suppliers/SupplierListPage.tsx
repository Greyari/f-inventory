import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSuppliers, useDeleteSupplier } from "./supplier.hooks";
import { SupplierFormDialog } from "./SupplierFormDialog";
import { useHasPermission } from "@/store/authStore";
import { useConfirm } from "@/store/confirmStore";
import type { Supplier } from "@/types/inventory.types";

export default function SupplierListPage() {
  const canManage = useHasPermission("suppliers.manage");
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<Supplier | null>(null);

  const { data, isLoading } = useSuppliers({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteSupplier();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openCreate = () => {
    setEditingData(null);
    setDialogOpen(true);
  };

  const openEdit = (row: Supplier) => {
    setEditingData(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row: Supplier) => {
    const ok = await confirm({
      description: `Hapus supplier "${row.name}"? Tindakan ini tidak bisa dibatalkan.`,
      variant: "destructive",
      confirmText: "Ya, Hapus",
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<Supplier>[] = [
    { header: "Nama Supplier", accessor: (r) => <span className="font-medium">{r.name}</span> },
    { header: "Contact Person", accessor: (r) => r.contactPerson || "-" },
    { header: "Telepon", accessor: (r) => r.phone || "-" },
    { header: "Alamat", accessor: (r) => r.address || "-" },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama supplier..."
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canManage && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Tambah Supplier
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

      <SupplierFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingData={editingData} />
    </div>
  );
}
