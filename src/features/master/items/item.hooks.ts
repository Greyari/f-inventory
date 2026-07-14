import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { itemApi } from "./item.api";
import type { ListParams } from "@/types/api.types";
import type { Item } from "@/types/inventory.types";

const KEY = "items";

export function useItems(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => itemApi.list(params),
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Item>) => itemApi.create(payload),
    onSuccess: () => {
      toast.success("Item berhasil ditambahkan");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menambahkan item"),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Item> }) =>
      itemApi.update(id, payload),
    onSuccess: () => {
      toast.success("Item berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal memperbarui item"),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemApi.remove(id),
    onSuccess: () => {
      toast.success("Item berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menghapus item"),
  });
}
