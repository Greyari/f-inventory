import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useJobCodes, useDeleteJobCode, useUpdateJobCode } from "./job-code.hooks";
import { JobCodeFormDialog } from "./JobCodeFormDialog";
import { useHasPermission } from "@/store/authStore";
import { useConfirm } from "@/store/confirmStore";
import type { JobCode } from "@/types/inventory.types";

export default function JobCodeListPage() {
  const { t } = useTranslation();
  const canManage = useHasPermission("job-codes.manage");
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<JobCode | null>(null);

  const { data, isLoading } = useJobCodes({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteJobCode();
  const updateMutation = useUpdateJobCode();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openCreate = () => {
    setEditingData(null);
    setDialogOpen(true);
  };

  const openEdit = (row: JobCode) => {
    setEditingData(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row: JobCode) => {
    const ok = await confirm({
      description: t("jobCode.confirmDelete", { code: row.code }),
      variant: "destructive",
      confirmText: t("common.confirmDelete"),
    });
    if (ok) {
      deleteMutation.mutate(row.id);
    }
  };

  // === FUNGSI TOGGLE STATUS (BARU) ===
  const handleToggleStatus = async (row: JobCode) => {
    const willActivate = !row.isActive;
    const ok = await confirm({
      description: willActivate
        ? t("jobCode.confirmActivate", { code: row.code })
        : t("jobCode.confirmDeactivate", { code: row.code }),
      variant: willActivate ? "default" : "destructive",
      confirmText: willActivate ? t("common.activate") : t("common.deactivate"),
    });
    if (ok) {
      updateMutation.mutate({ id: row.id, payload: { isActive: willActivate } });
    }
  };

  const columns: Column<JobCode>[] = [
    { header: t("jobCode.code"), accessor: (r) => <span className="font-medium">{r.code}</span> },
    { header: t("jobCode.description"), accessor: (r) => r.description },
    {
      header: t("jobCode.category"),
      accessor: (r) => <span className="text-xs text-muted-foreground">{r.category}</span>,
      hideOnMobile: true,
    },
    {
      header: t("jobCode.status"),
      accessor: (r) => (
        <span
          className={
            r.isActive
              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
              : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
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
        searchPlaceholder={t("jobCode.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canManage && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t("jobCode.addButton")}
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

                  {/* TOMBOL TOGGLE STATUS */}
                  <Button
                    variant="ghost"
                    size="icon"
                    title={row.isActive ? t("common.deactivate") : t("common.activate")}
                    onClick={() => handleToggleStatus(row)}
                  >
                    {row.isActive ? (
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Power className="h-4 w-4 text-green-600" />
                    )}
                  </Button>

                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )
            : undefined
        }
      />

      <JobCodeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingData={editingData} />
    </div>
  );
}