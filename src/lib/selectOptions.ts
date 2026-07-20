import { apiClient } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api.types";
import type { JobCode, Item } from "@/types/inventory.types";
import type { SearchableOption } from "@/components/common/SearchableSelect";

export async function fetchJobCodeOptions(search: string): Promise<SearchableOption[]> {
  const { data } = await apiClient.get<ApiSuccess<JobCode[]>>("/job-codes", {
    params: { search, limit: 20 },
  });
  return data.data.map((jc) => ({
    value: jc.id,
    label: jc.code,
    sublabel: jc.description,
    disabled: !jc.isActive,
    disabledHint: "jobCode.inactiveHint",
    raw: jc,
  }));
}

export async function fetchItemOptions(search: string): Promise<SearchableOption[]> {
  const { data } = await apiClient.get<ApiSuccess<Item[]>>("/items", {
    params: { search, limit: 20 },
  });
  return data.data.map((item) => ({
    value: item.id,
    label: item.itemCode,
    sublabel: item.itemName,
    raw: item,
  }));
}
