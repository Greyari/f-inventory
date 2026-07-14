import { useEffect, useState } from "react";
import { Plus, Pencil, KeyRound, UserX } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUsers, useResetPassword, useDeleteUser } from "./user.hooks";
import { UserFormDialog } from "./UserFormDialog";
import type { User } from "@/types/auth.types";

export default function UserListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<User | null>(null);

  const { data, isLoading } = useUsers({ search: debouncedSearch, page, limit: 10 });
  const resetPasswordMutation = useResetPassword();
  const deleteMutation = useDeleteUser();

  useEffect(() => setPage(1), [debouncedSearch]);

  const openCreate = () => {
    setEditingData(null);
    setDialogOpen(true);
  };

  const openEdit = (row: User) => {
    setEditingData(row);
    setDialogOpen(true);
  };

  const handleResetPassword = (row: User) => {
    if (confirm(`Reset password untuk "${row.name}"?`)) {
      resetPasswordMutation.mutate(row.id);
    }
  };

  const handleDeactivate = (row: User) => {
    if (confirm(`Nonaktifkan user "${row.name}"?`)) {
      deleteMutation.mutate(row.id);
    }
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleResetPassword(row)}
              title="Reset Password"
            >
              <KeyRound className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeactivate(row)} title="Nonaktifkan">
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      />

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingData={editingData} />
    </div>
  );
}
