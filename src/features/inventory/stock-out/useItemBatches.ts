import { useQuery } from "@tanstack/react-query";
import { stockBatchApi } from "./stock-out.api";

export function useItemBatches(itemId?: string) {
  return useQuery({
    queryKey: ["available-batches", itemId],
    queryFn: () => stockBatchApi.listAvailableByItem(itemId as string),
    enabled: !!itemId,
    staleTime: 5000,
  });
}
