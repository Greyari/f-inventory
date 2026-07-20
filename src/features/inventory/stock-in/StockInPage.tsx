import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Eye, Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockIns, useDeleteStockIn } from "./stock-in.hooks";
import { useHasPermission } from "@/store/authStore";
import { useConfirm } from "@/store/confirmStore";
import type { StockIn } from "@/types/inventory.types";
import { useNavigate } from "react-router-dom";

export default function StockInPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const canDelete = useHasPermission("stock-in.delete");
  const canCreate = useHasPermission("stock-in.create");
  const canEdit = useHasPermission("stock-in.edit");
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useStockIns({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteStockIn();

  useEffect(() => setPage(1), [debouncedSearch]);
  const openCreate = () => navigate("/inventory/stock-in/new");
  const openEdit = (row: StockIn) => navigate(`/inventory/stock-in/${row.id}/edit`);

  const handleDelete = async (row: StockIn) => {
    const ok = await confirm({
      description: t("stockIn.confirmDelete", { ref: row.referenceNo }),
      variant: "destructive",
      confirmText: t("common.confirmDelete"),
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<StockIn>[] = [
    { header: t("stockIn.colReference"), accessor: (r) => <span className="font-medium">{r.referenceNo}</span> },
    { header: t("stockIn.colDateReceived"), accessor: (r) => r.dateReceived },
    { header: t("stockIn.colApprovedBy"), accessor: (r) => r.approvedBy, hideOnMobile: true },
    {
      header: t("stockIn.colProject"),
      accessor: (r) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">{r.projectName}</div>
          <div className="text-muted-foreground">
            {r.projectRef?.code} / {r.costCentre?.code} / {r.costCode?.code}
          </div>
        </div>
      ),
    },
    {
      header: t("stockIn.colItems"),
      accessor: (r) => (
        <div className="space-y-0.5">
          {r.items.map((it, i) => (
            <div key={i} className="text-xs">
              {it.item?.itemName ?? it.itemId} — {it.qty} {it.item?.unit}
              {it.location && <span className="text-muted-foreground"> ({it.location})</span>}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{t("stockIn.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("stockIn.subtitle")}</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("stockIn.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canCreate && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t("stockIn.addButton")}
            </Button>
          )
        }
        rowActions={(row) => (
          <>
            <Button variant="ghost" size="icon" title={t("common.detail")} onClick={() => navigate(`/inventory/stock-in/${row.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            {canEdit && (
              <Button variant="ghost" size="icon" title={t("common.edit")} onClick={() => openEdit(row)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="icon" onClick={() => handleDelete(row)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </>
        )}
      />
    </div>
  );
}
