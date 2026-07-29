import { apiClient } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api.types";
import type { Asset } from "@/types/asset.types";
import type { SearchableOption } from "@/components/common/SearchableSelect";

/**
 * Fetch daftar aset buat dropdown checkout — sengaja nampilin availableQty
 * di sublabel, dan aset yang availableQty-nya 0 di-disable (gak bisa
 * dipilih buat checkout baru sampai ada yang dikembaliin).
 */
export async function fetchAssetOptions(search: string): Promise<SearchableOption[]> {
  const { data } = await apiClient.get<ApiSuccess<Asset[]>>("/assets", {
    params: { search, limit: 20 },
  });
  return data.data.map((asset) => ({
    value: asset.id,
    label: `${asset.assetCode} — ${asset.assetName}`,
    sublabel: `Tersedia: ${asset.availableQty}`,
    disabled: asset.availableQty <= 0,
    disabledHint: "asset.noneAvailableHint",
  }));
}
