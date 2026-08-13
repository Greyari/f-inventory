import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
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
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to add item")),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Item> }) =>
      itemApi.update(id, payload),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update item")),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemApi.remove(id),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete item")),
  });
}
