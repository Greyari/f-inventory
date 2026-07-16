import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { UserFormDialog } from "./UserFormDialog";
import { useConfirm } from "@/store/confirmStore";
import type { User } from "@/types/auth.types";
import { Plus, Pencil, KeyRound, UserX, UserCheck, Trash2 } from "lucide-react";
import { useUsers, useResetPassword, useSetActiveStatus, useDeleteUser } from "./user.hooks";

export default function UserListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<User | null>(null);

  const { data, isLoading } = useUsers({ search: debouncedSearch, page, limit: 10 });
  const resetPasswordMutation = useResetPassword();
  const setActiveStatusMutation = useSetActiveStatus();
  const deleteMutation = useDeleteUser();
  const confirm = useConfirm();

  useEffect(() => setPage(1), [debouncedSearch]);

  const openCreate = () => {
    setEditingData(null);
    setDialogOpen(true);
  };

  const openEdit = (row: User) => {
    setEditingData(row);
    setDialogOpen(true);
  };

  const handleResetPassword = async (row: User) => {
    const ok = await confirm({
      description: `Reset password untuk "${row.name}"? Password baru akan digenerate otomatis.`,
      confirmText: "Ya, Reset",
    });
    if (ok) resetPasswordMutation.mutate(row.id);
  };

  const handleDeactivate = async (row: User) => {
    const ok = await confirm({
      description: `Nonaktifkan user "${row.name}"? User ini tidak akan bisa login lagi sampai diaktifkan ulang.`,
      variant: "destructive",
      confirmText: "Ya, Nonaktifkan",
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const handleToggleActive = async (row: User) => {
    const willActivate = !row.isActive;
    const ok = await confirm({
      description: willActivate
        ? `Aktifkan kembali user "${row.name}"?`
        : `Nonaktifkan user "${row.name}"? User ini tidak akan bisa login lagi sampai diaktifkan ulang.`,
      variant: willActivate ? "default" : "destructive",
      confirmText: willActivate ? "Ya, Aktifkan" : "Ya, Nonaktifkan",
    });
    if (ok) setActiveStatusMutation.mutate({ id: row.id, isActive: willActivate });
  };

  const handleDelete = async (row: User) => {
    const ok = await confirm({
      description: `Hapus user "${row.name}" secara permanen? Tindakan ini tidak bisa dibatalkan.`,
      variant: "destructive",
      confirmText: "Ya, Hapus Permanen",
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<User>[] = [
    { header: "Nama", accessor: (r) => <span className="font-medium">{r.name}</span> },
    { header: "Email", accessor: (r) => r.email },
    {
      header: "Role",
      accessor: (r) => (
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
          {r.role?.name ?? "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (r) => (
        <span
          className={
            r.isActive
              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
              : "rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700"
          }
        >
          {r.isActive ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama atau email..."
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Tambah User
          </Button>
        }
        rowActions={(row) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleResetPassword(row)} title="Reset Password">
              <KeyRound className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleActive(row)}
              title={row.isActive ? "Nonaktifkan" : "Aktifkan"}
            >
              {row.isActive ? (
                <UserX className="h-4 w-4 text-destructive" />
              ) : (
                <UserCheck className="h-4 w-4 text-green-600" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(row)} title="Hapus Permanen">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      />

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingData={editingData} />
    </div>
  );
}
