import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onSuccess: () => {
      toast.success("Job code berhasil ditambahkan");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menambahkan job code"),
  });
}

export function useUpdateJobCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<JobCode> }) =>
      jobCodeApi.update(id, payload),
    onSuccess: () => {
      toast.success("Job code berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal memperbarui job code"),
  });
}

export function useDeleteJobCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobCodeApi.remove(id),
    onSuccess: () => {
      toast.success("Job code berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: () => toast.error("Gagal menghapus job code"),
  });
}
