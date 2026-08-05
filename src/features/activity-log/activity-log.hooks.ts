import { useQuery } from "@tanstack/react-query";
import { activityLogApi, type ActivityLogListParams } from "./activity-log.api";

export function useActivityLogs(params: ActivityLogListParams) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => activityLogApi.list(params),
  });
}

export function useActivityLogFilterOptions() {
  return useQuery({
    queryKey: ["activity-logs-filter-options"],
    queryFn: () => activityLogApi.filterOptions(),
  });
}
