import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Eye, Boxes, Layers } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAssets, useDeleteAsset, useAssetSummary } from "./asset.hooks";
import { useHasPermission } from "@/store/authStore";
import { useConfirm } from "@/store/confirmStore";
import type { Asset } from "@/types/asset.types";

export default function AssetListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canManage = useHasPermission("assets.manage");
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAssets({ search: debouncedSearch, page, limit: 10 });
  const { data: summary } = useAssetSummary();
  const deleteMutation = useDeleteAsset();

  useEffect(() => setPage(1), [debouncedSearch]);

  const handleDelete = async (row: Asset) => {
    const ok = await confirm({
      description: t("asset.confirmDelete", { name: row.assetName }),
      variant: "destructive",
      confirmText: t("common.confirmDelete"),
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<Asset>[] = [
    { header: t("asset.assetCode"), accessor: (r) => <span className="font-medium">{r.assetCode}</span> },
    { header: t("asset.assetName"), accessor: (r) => r.assetName },
    { header: t("asset.category"), accessor: (r) => r.category, hideOnMobile: true },
    {
      header: t("asset.qty"),
      accessor: (r) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">{r.qty}</div>
          {r.inUseQty > 0 && <div className="text-muted-foreground">{t("asset.inUseQty")}: {r.inUseQty}</div>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{t("asset.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("asset.subtitle")}</p>
      </div>

      {/* Ringkasan */}
      {summary && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-background p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t("asset.totalAssets")}</span>
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold">{summary.totalAssets}</p>
          </div>
          <div className="rounded-lg border bg-background p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t("asset.categoriesBreakdown")}</span>
              <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {summary.byCategory.map((c) => (
                <span key={c.category} className="rounded-full bg-muted px-2 py-1 text-xs">
                  {c.category}: <span className="font-semibold">{c.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("asset.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canManage && (
            <Button size="sm" onClick={() => navigate("/assets/new")}>
              <Plus className="h-4 w-4" /> {t("asset.addButton")}
            </Button>
          )
        }
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              title={t("common.detail")}
              onClick={() => navigate(`/assets/${row.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canManage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  title={t("common.edit")}
                  onClick={() => navigate(`/assets/${row.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(row)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </>
        )}
      />
    </div>
  );
}
