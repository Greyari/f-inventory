import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useJobCodes, useDeleteJobCode } from "./job-code.hooks";
import { JobCodeFormDialog } from "./JobCodeFormDialog";
import { useHasPermission } from "@/store/authStore";
import type { JobCode } from "@/types/inventory.types";

export default function JobCodeListPage() {
  const canManage = useHasPermission("job-codes.manage");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<JobCode | null>(null);

  const { data, isLoading } = useJobCodes({ search: debouncedSearch, page, limit: 10 });
  const deleteMutation = useDeleteJobCode();

  // Reset ke halaman 1 setiap kali kata kunci pencarian berubah
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

  const handleDelete = (row: JobCode) => {
    if (confirm(`Hapus job code "${row.code}"?`)) {
      deleteMutation.mutate(row.id);
    }
  };

  const columns: Column<JobCode>[] = [
    { header: "Kode", accessor: (r) => <span className="font-medium">{r.code}</span> },
    { header: "Deskripsi", accessor: (r) => r.description },
    {
      header: "Kategori",
      accessor: (r) => <span className="text-xs text-muted-foreground">{r.category}</span>,
    },
    {
      header: "Status",
      accessor: (r) => (
        <span
          className={
            r.isActive
              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
              : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          }
        >
          {r.isActive ? "Aktif" : "Nonaktif"}
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
        searchPlaceholder="Cari kode atau deskripsi..."
        keyExtractor={(r) => r.id}
        meta={data?.meta}
        onPageChange={setPage}
        actions={
          canManage && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Tambah Job Code
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

      <JobCodeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingData={editingData} />
    </div>
  );
}
