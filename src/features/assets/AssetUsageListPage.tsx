import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Undo2, Trash2, ImageIcon } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAssetUsages, useDeleteAssetUsage } from "./asset-usage.hooks";
import { useHasPermission } from "@/store/authStore";
import { useConfirm } from "@/store/confirmStore";
import { cn } from "@/lib/utils";
import type { AssetUsage } from "@/types/asset.types";

export default function AssetUsageListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canCheckout = useHasPermission("asset-usages.checkout");
  const canReturn = useHasPermission("asset-usages.return");
  const canDelete = useHasPermission("asset-usages.delete");
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAssetUsages({ search: debouncedSearch, status: status || undefined, page, limit: 10 });
  const deleteMutation = useDeleteAssetUsage();

  useEffect(() => setPage(1), [debouncedSearch, status]);

  const handleDelete = async (row: AssetUsage) => {
    const ok = await confirm({
      description: t("assetUsage.confirmDelete", { asset: row.asset?.assetName ?? "" }),
      variant: "destructive",
      confirmText: t("common.confirmDelete"),
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<AssetUsage>[] = [
    {
      header: t("assetUsage.asset"),
      accessor: (r) => (
        <div>
          <p className="font-medium">{r.asset?.assetName}</p>
          <p className="text-xs text-muted-foreground">{r.asset?.assetCode}</p>
        </div>
      ),
    },
    { header: t("assetUsage.usedBy"), accessor: (r) => r.usedBy },
    { header: t("assetUsage.purpose"), accessor: (r) => r.purpose, hideOnMobile: true },
    { header: t("asset.qty"), accessor: (r) => r.qty },
    { header: t("assetUsage.checkoutDate"), accessor: (r) => r.checkoutDate, hideOnMobile: true },
    {
      header: t("assetUsage.status"),
      accessor: (r) => (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            r.status === "IN_USE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
          )}
        >
          {r.status === "IN_USE" ? t("assetUsage.statusInUse") : t("assetUsage.statusReturned")}
        </span>
      ),
    },
    {
      header: t("assetUsage.returnCondition"),
      accessor: (r) =>
        r.status === "RETURNED" ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                r.returnCondition === "Baik" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}
            >
              {r.returnCondition ? t(`assetUsage.condition.${r.returnCondition}`) : "-"}
            </span>
            {r.returnPhotoUrl && (
              <a href={r.returnPhotoUrl} target="_blank" rel="noreferrer" title={t("assetUsage.returnPhoto")}>
                <ImageIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
        ) : (
          "-"
        ),
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{t("assetUsage.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("assetUsage.subtitle")}</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("assetUsage.searchPlaceholder")}
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
              <option value="">{t("assetUsage.allStatus")}</option>
              <option value="IN_USE">{t("assetUsage.statusInUse")}</option>
              <option value="RETURNED">{t("assetUsage.statusReturned")}</option>
            </Select>
            {canCheckout && (
              <Button size="sm" onClick={() => navigate("/assets/usage/new")}>
                <Plus className="h-4 w-4" /> {t("assetUsage.checkoutButton")}
              </Button>
            )}
          </div>
        }
        rowActions={(row) => (
          <>
            {row.status === "IN_USE" && canReturn && (
              <Button
                variant="ghost"
                size="icon"
                title={t("assetUsage.returnButton")}
                onClick={() => navigate(`/assets/usage/${row.id}/return`)}
              >
                <Undo2 className="h-4 w-4 text-primary" />
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
