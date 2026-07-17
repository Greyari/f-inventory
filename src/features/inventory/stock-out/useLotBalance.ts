import { useQuery } from "@tanstack/react-query";
import { stockLotBalanceApi } from "./stock-out.api";

export function useLotBalance(
  itemId?: string,
  projectRefId?: string,
  costCentreId?: string,
  costCodeId?: string
) {
  const enabled = !!(itemId && projectRefId && costCentreId && costCodeId);

  return useQuery({
    queryKey: ["stock-lot-balance", itemId, projectRefId, costCentreId, costCodeId],
    queryFn: () => stockLotBalanceApi.get({ itemId: itemId!, projectRefId: projectRefId!, costCentreId: costCentreId!, costCodeId: costCodeId! }),
    enabled,
    staleTime: 5000,
  });
}
