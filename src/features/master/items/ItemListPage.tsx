import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      description: t("item.confirmDelete", { name: row.itemName }),
      variant: "destructive",
      confirmText: t("common.confirmDelete"),
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<Item>[] = [
    { header: t("item.itemName"), accessor: (r) => r.itemName },
    { header: t("item.category"), accessor: (r) => r.category, hideOnMobile: true },
    { header: t("item.unit"), accessor: (r) => r.unit },
    { header: t("item.minStock"), accessor: (r) => r.minStockLevel, hideOnMobile: true },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("item.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canManage && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t("item.addButton")}
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
