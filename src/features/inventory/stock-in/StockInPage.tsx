import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Eye, Pencil, FileCheck2, PackageCheck, ShieldAlert } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStockIns, useDeleteStockIn } from "./stock-in.hooks";
import { useHasPermission } from "@/store/authStore";
import { useConfirm } from "@/store/confirmStore";
import type { StockIn, StockInStatus } from "@/types/inventory.types";
import { useNavigate } from "react-router-dom";
import { StockInStatusBadge } from "./StockInStatusBadge";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: StockInStatus | "all"; labelKey: string }[] = [
  { value: "all", labelKey: "stockIn.filterAll" },
  { value: "npr", labelKey: "stockIn.filterNpr" },
  { value: "po", labelKey: "stockIn.filterPo" },
  { value: "do", labelKey: "stockIn.filterDo" },
];

export default function StockInPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const canDelete = useHasPermission("stock-in.delete");
  const canCreate = useHasPermission("stock-in.create");
  const canEdit = useHasPermission("stock-in.edit");
  const canMarkPo = useHasPermission("stock-in.mark-po");
  const canMarkDo = useHasPermission("stock-in.mark-do");
  const canOverride = useHasPermission("stock-in.override");
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<StockInStatus | "all">("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useStockIns({
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    page,
    limit: 10,
  });
  const deleteMutation = useDeleteStockIn();

  useEffect(() => setPage(1), [debouncedSearch, status]);
  const openCreate = () => navigate("/inventory/stock-in/new");
  const openEdit = (row: StockIn) => navigate(`/inventory/stock-in/${row.id}/edit`);
  const openMarkPo = (row: StockIn) => navigate(`/inventory/stock-in/${row.id}/mark-po`);
  const openMarkDo = (row: StockIn) => navigate(`/inventory/stock-in/${row.id}/mark-do`);

  const handleDelete = async (row: StockIn) => {
    const ok = await confirm({
      description: t("stockIn.confirmDelete", { ref: row.prNo }),
      variant: "destructive",
      confirmText: t("common.confirmDelete"),
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<StockIn>[] = [
    {
      header: t("stockIn.colReference"),
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{r.prNo}</span>
          <StockInStatusBadge status={r.status} />
        </div>
      ),
    },
    { header: t("stockIn.colDateReceived"), accessor: (r) => r.dateReceived },
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
              {it.vendorName && <span className="text-muted-foreground"> · {it.vendorName}</span>}
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

      <div className="mb-3 flex gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              status === tab.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t(tab.labelKey)}
          </button>
        ))}
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
            {canMarkPo && row.status === "npr" && (
              <Button variant="ghost" size="icon" title={t("stockIn.markAsPo")} onClick={() => openMarkPo(row)}>
                <FileCheck2 className="h-4 w-4 text-sky-600" />
              </Button>
            )}
            {canMarkDo && row.status === "po" && (
              <Button variant="ghost" size="icon" title={t("stockIn.markAsDo")} onClick={() => openMarkDo(row)}>
                <PackageCheck className="h-4 w-4 text-emerald-600" />
              </Button>
            )}
            <Button variant="ghost" size="icon" title={t("common.detail")} onClick={() => navigate(`/inventory/stock-in/${row.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            {canEdit && (
              <Button variant="ghost" size="icon" title={t("common.edit")} onClick={() => openEdit(row)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canOverride && row.status !== "npr" && (
              <Button
                variant="ghost"
                size="icon"
                title={t("stockIn.overrideEdit")}
                onClick={() => navigate(`/inventory/stock-in/${row.id}/override`)}
              >
                <ShieldAlert className="h-4 w-4 text-destructive" />
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
