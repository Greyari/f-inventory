import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { jobCodeApi } from "./job-code.api";
import type { ListParams } from "@/types/api.types";
import type { JobCode } from "@/types/inventory.types";

const KEY = "job-codes";

export function useJobCodes(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => jobCodeApi.list(params),
  });
}

export function useCreateJobCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<JobCode>) => jobCodeApi.create(payload),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to add job code")),
  });
}

export function useUpdateJobCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<JobCode> }) =>
      jobCodeApi.update(id, payload),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update job code")),
  });
}

export function useDeleteJobCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobCodeApi.remove(id),
    onSuccess: (result) => {
      toast.success(result.message);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete job code")),
  });
}
