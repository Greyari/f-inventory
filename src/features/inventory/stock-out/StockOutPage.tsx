import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockOuts, useDeleteStockOut } from "./stock-out.hooks";
import { useHasPermission } from "@/store/authStore";
import { useConfirm } from "@/store/confirmStore";
import type { StockOut } from "@/types/inventory.types";

export default function StockOutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canDelete = useHasPermission("stock-out.delete");
  const canCreate = useHasPermission("stock-out.create");
  const canEdit = useHasPermission("stock-out.edit");
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStockOuts({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteStockOut();

  useEffect(() => setPage(1), [debouncedSearch]);

  const openCreate = () => navigate("/inventory/stock-out/new");
  const openEdit = (row: StockOut) => navigate(`/inventory/stock-out/${row.id}/edit`);
  const openDetail = (row: StockOut) => navigate(`/inventory/stock-out/${row.id}`);

  const handleDelete = async (row: StockOut) => {
    const ok = await confirm({
      description: t("stockOut.confirmDelete", { ref: row.referenceNo }),
      variant: "destructive",
      confirmText: t("common.confirmDelete"),
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<StockOut>[] = [
    { header: t("stockOut.colReference"), accessor: (r) => <span className="font-medium">{r.referenceNo}</span> },
    { header: t("stockOut.colDateIssued"), accessor: (r) => r.dateIssued },
    { header: t("stockOut.colApprovedBy"), accessor: (r) => r.approvedBy, hideOnMobile: true },
    { header: t("stockOut.colIssuedTo"), accessor: (r) => r.issuedTo ?? "-", hideOnMobile: true },
    {
      header: t("stockOut.colProject"),
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
      header: t("stockOut.colItems"),
      accessor: (r) => (
        <div className="space-y-2">
          {r.items.map((it, i) => (
            <div key={i} className="text-xs">
              <div className="font-medium">
                {it.item?.itemName ?? it.itemId} — {it.qty} {it.item?.unit}
              </div>
              <div className="ml-2 space-y-0.5 text-muted-foreground">
                {it.allocations.map((a, j) => (
                  <div key={j}>
                    ↳ {a.qty} dari {a.projectRef?.code ?? "-"} / {a.costCentre?.code ?? "-"} / {a.costCode?.code ?? "-"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{t("stockOut.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("stockOut.subtitle")}</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("stockOut.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canCreate && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t("stockOut.addButton")}
            </Button>
          )
        }
        rowActions={(row) => (
          <>
            <Button variant="ghost" size="icon" title={t("common.detail")} onClick={() => openDetail(row)}>
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