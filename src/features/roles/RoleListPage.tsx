import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRoles, useDeleteRole } from "./role.hooks";
import { RoleFormDialog } from "./RoleFormDialog";
import { useConfirm } from "@/store/confirmStore";
import type { Role } from "@/types/auth.types";

export default function RoleListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<Role | null>(null);

  const { data, isLoading } = useRoles({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteRole();
  const confirm = useConfirm();

  useEffect(() => setPage(1), [debouncedSearch]);

  const openCreate = () => {
    setEditingData(null);
    setDialogOpen(true);
  };

  const openEdit = (row: Role) => {
    setEditingData(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row: Role) => {
    if (row.isSystem) return;
    const ok = await confirm({
      description: `Hapus role "${row.name}"? Tindakan ini tidak bisa dibatalkan.`,
      variant: "destructive",
      confirmText: "Ya, Hapus",
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<Role>[] = [
    {
      header: "Nama Role",
      accessor: (r) => (
        <span className="flex items-center gap-1.5 font-medium">
          {r.isSystem && <Lock className="h-3 w-3 text-muted-foreground" />}
          {r.name}
        </span>
      ),
    },
    { header: "Deskripsi", accessor: (r) => r.description || "-" },
    { header: "Jumlah User", accessor: (r) => r.userCount ?? 0 },
    {
      header: "Permission",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.permissions.length} permission dipilih
        </span>
      ),
    },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Role bawaan sistem (ikon <Lock className="inline h-3 w-3" />) tidak bisa dihapus atau
        diganti nama, tapi hak aksesnya tetap bisa disesuaikan.
      </p>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama role..."
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Tambah Role
          </Button>
        }
        rowActions={(row) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row)}
              disabled={row.isSystem || (row.userCount ?? 0) > 0}
              title={row.isSystem ? "Role bawaan sistem" : "Hapus"}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      />

      <RoleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingData={editingData} />
    </div>
  );
}
