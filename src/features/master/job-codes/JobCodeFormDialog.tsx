import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateJobCode, useUpdateJobCode } from "./job-code.hooks";
import type { JobCode } from "@/types/inventory.types";

const schema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
});

type FormValues = z.infer<typeof schema>;

// Contoh kategori dari master code PT CIS, dipakai sebagai saran (datalist)
const CATEGORY_SUGGESTIONS = [
  "RENTALS OF COMMON EQUIPMENT (CYR-00)",
  "GENERAL YARD MAINTENANCE (CYM-00)",
  "BUILDING MAINTENANCE (CYB-00)",
  "PIPING SYSTEM MAINTENANCE (CYP-00)",
  "SHORT LIFE TOOLS FOR BATAM YARD (CST-00)",
  "YARD DEVELOPMENT (CIS-YD00)",
  "GENERAL EQUIPMENT MAINTENANCE (CEM-00)",
  "PRECAST MANUFACTURE PROJECTS (CIS-TOA)",
  "NEW PRECAST PPV PROJECT (CIS-CJY)",
  "MC CONNELL DOWELL - PORT TONGA (CIS-McD)",
  "KTU - BARGES BUILDING",
];

interface JobCodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingData?: JobCode | null;
}

export function JobCodeFormDialog({ open, onOpenChange, editingData }: JobCodeFormDialogProps) {
  const isEdit = !!editingData;
  const createMutation = useCreateJobCode();
  const updateMutation = useUpdateJobCode();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset(
        editingData
          ? {
              code: editingData.code,
              description: editingData.description,
              category: editingData.category,
            }
          : { code: "", description: "", category: "" }
      );
    }
  }, [open, editingData, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FormValues) => {
    if (isEdit && editingData) {
      await updateMutation.mutateAsync({ id: editingData.id, payload: values });
    } else {
      await createMutation.mutateAsync({ ...values, isActive: true });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit Job Code" : "Tambah Job Code"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Kode</Label>
            <Input {...register("code")} placeholder="mis. CYB-16-05" />
            {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <div>
            <Label>Deskripsi</Label>
            <Input {...register("description")} placeholder="mis. BATCHING PLANT 5" />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label>Kategori</Label>
            <Input {...register("category")} list="category-suggestions" placeholder="mis. BUILDING MAINTENANCE (CYB-00)" />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && (
              <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
