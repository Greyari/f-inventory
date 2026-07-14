import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supplierApi } from "./supplier.api";
import type { ListParams } from "@/types/api.types";
import type { Supplier } from "@/types/inventory.types";

const KEY = "suppliers";

export function useSuppliers(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => supplierApi.list(params),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Supplier>) => supplierApi.create(payload),
    onSuccess: () => {
      toast.success("Supplier berhasil ditambahkan");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menambahkan supplier"),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Supplier> }) =>
      supplierApi.update(id, payload),
    onSuccess: () => {
      toast.success("Supplier berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal memperbarui supplier"),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierApi.remove(id),
    onSuccess: () => {
      toast.success("Supplier berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menghapus supplier"),
  });
}
