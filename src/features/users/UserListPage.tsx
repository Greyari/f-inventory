import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { UserFormDialog } from "./UserFormDialog";
import { useConfirm } from "@/store/confirmStore";
import type { User } from "@/types/auth.types";
import { Plus, Pencil, UserX, UserCheck, Trash2 } from "lucide-react";
import { useUsers, useSetActiveStatus, useDeleteUser } from "./user.hooks";

export default function UserListPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<User | null>(null);

  const { data, isLoading } = useUsers({ search: debouncedSearch, page, limit: 10 });
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

  const handleToggleActive = async (row: User) => {
    const willActivate = !row.isActive;
    const ok = await confirm({
      description: willActivate
        ? t("users.confirmActivate", { name: row.name })
        : t("users.confirmDeactivate", { name: row.name }),
      variant: willActivate ? "default" : "destructive",
      confirmText: willActivate ? t("common.activate") : t("users.confirmDeactivateButton"),
    });
    if (ok) setActiveStatusMutation.mutate({ id: row.id, isActive: willActivate });
  };

  const handleDelete = async (row: User) => {
    const ok = await confirm({
      description: t("users.confirmDelete", { name: row.name }),
      variant: "destructive",
      confirmText: t("users.confirmDeleteButton"),
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<User>[] = [
    { header: t("users.colName"), accessor: (r) => <span className="font-medium">{r.name}</span> },
    { header: t("users.colEmail"), accessor: (r) => r.email },
    {
      header: t("users.colRole"),
      accessor: (r) => (
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
          {r.role?.name ?? "-"}
        </span>
      ),
    },
    {
      header: t("users.colStatus"),
      accessor: (r) => (
        <span
          className={
            r.isActive
              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
              : "rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700"
          }
        >
          {r.isActive ? t("common.active") : t("common.inactive")}
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
        searchPlaceholder={t("users.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t("users.addButton")}
          </Button>
        }
        rowActions={(row) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title={t("common.edit")}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleActive(row)}
              title={row.isActive ? t("common.deactivate") : t("common.activate")}
            >
              {row.isActive ? (
                <UserX className="h-4 w-4 text-destructive" />
              ) : (
                <UserCheck className="h-4 w-4 text-green-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row)}
              title={t("users.deleteTooltip")}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      />

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingData={editingData} />
    </div>
  );
}