import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRoles, useDeleteRole } from "./role.hooks";
import { RoleFormDialog } from "./RoleFormDialog";
import { useConfirm } from "@/store/confirmStore";
import type { Role } from "@/types/auth.types";

export default function RoleListPage() {
  const { t } = useTranslation();
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
      description: t("roles.confirmDelete", { name: row.name }),
      variant: "destructive",
      confirmText: t("common.confirmDelete"),
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<Role>[] = [
    {
      header: t("roles.colName"),
      accessor: (r) => (
        <span className="flex items-center gap-1.5 font-medium">
          {r.isSystem && <Lock className="h-3 w-3 text-muted-foreground" />}
          {r.name}
        </span>
      ),
    },
    { header: t("roles.colDescription"), accessor: (r) => r.description || "-" },
    { header: t("roles.colUserCount"), accessor: (r) => r.userCount ?? 0, hideOnMobile: true },
    {
      header: t("roles.colPermissions"),
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">{t("roles.permissionsSelected", { count: r.permissions.length })}</span>
      ),
    },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{t("roles.systemRoleListNote")}</p>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("roles.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t("roles.addButton")}
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
              onClick={() => handleDelete(row)}
              disabled={row.isSystem || (row.userCount ?? 0) > 0}
              title={row.isSystem ? t("roles.systemRoleNote") : t("common.delete")}
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
