import { useQuery } from "@tanstack/react-query";
import { stockLotsApi } from "./stock-out.api";

export function useItemLots(itemId?: string) {
  return useQuery({
    queryKey: ["stock-lots-by-item", itemId],
    queryFn: () => stockLotsApi.listByItem(itemId as string),
    enabled: !!itemId,
    staleTime: 5000,
  });
}