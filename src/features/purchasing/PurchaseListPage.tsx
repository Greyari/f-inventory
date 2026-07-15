import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePurchases, useDeletePurchase } from "./purchasing.hooks";
import { useConfirm } from "@/store/confirmStore";
import { useHasPermission } from "@/store/authStore";
import type { Purchase, PurchaseStatus } from "@/types/inventory.types";

const STATUS_OPTIONS: { value: PurchaseStatus | ""; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "SUBMITTED", label: "Diajukan" },
  { value: "CHECKED", label: "Dicek" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "ORDERED", label: "Dipesan" },
  { value: "RECEIVED", label: "Diterima" },
  { value: "CLOSED", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
];

export default function PurchaseListPage() {
  const navigate = useNavigate();
  const canDelete = useHasPermission("purchases.delete");
  const canCreate = useHasPermission("purchases.create");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePurchases({
    search: debouncedSearch,
    status: status || undefined,
    page,
    limit: 10,
  });
  const deleteMutation = useDeletePurchase();
  const confirm = useConfirm();

  useEffect(() => setPage(1), [debouncedSearch, status]);

  const handleDelete = async (row: Purchase) => {
    const ok = await confirm({
      description: `Hapus PR "${row.prNumber}"? Tindakan ini tidak bisa dibatalkan.`,
      variant: "destructive",
      confirmText: "Ya, Hapus",
    });
    if (ok) deleteMutation.mutate(row.id);
  };

  const columns: Column<Purchase>[] = [
    { header: "PR No.", accessor: (r) => <span className="font-medium">{r.prNumber}</span> },
    { header: "Project", accessor: (r) => r.projectName },
    {
      header: "Proj. Ref / Cost Centre / Cost Code",
      accessor: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.projectRef?.code} / {r.costCentre?.code} / {r.costCode?.code}
        </span>
      ),
    },
    { header: "Date Raised", accessor: (r) => r.dateRaised },
    { header: "Raised By", accessor: (r) => r.raisedByName },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Purchasing</h2>
          <p className="text-sm text-muted-foreground">
            Materials Purchase / Service Requisition Form
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/purchasing/new")}>
            <Plus className="h-4 w-4" /> Buat PR Baru
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari PR number atau project..."
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        }
        rowActions={(row) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate(`/purchasing/${row.id}/edit`)}>
              <Eye className="h-4 w-4" />
            </Button>
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
