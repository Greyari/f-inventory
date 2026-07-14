import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateSupplier, useUpdateSupplier } from "./supplier.hooks";
import type { Supplier } from "@/types/inventory.types";

const schema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingData?: Supplier | null;
}

export function SupplierFormDialog({ open, onOpenChange, editingData }: SupplierFormDialogProps) {
  const isEdit = !!editingData;
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

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
              name: editingData.name,
              contactPerson: editingData.contactPerson ?? "",
              phone: editingData.phone ?? "",
              address: editingData.address ?? "",
            }
          : { name: "", contactPerson: "", phone: "", address: "" }
      );
    }
  }, [open, editingData, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FormValues) => {
    if (isEdit && editingData) {
      await updateMutation.mutateAsync({ id: editingData.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit Supplier" : "Tambah Supplier"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nama Supplier</Label>
            <Input {...register("name")} placeholder="mis. PT Sumber Jaya Elektrik" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contact Person</Label>
              <Input {...register("contactPerson")} placeholder="Nama PIC" />
            </div>
            <div>
              <Label>No. Telepon</Label>
              <Input {...register("phone")} placeholder="08xx-xxxx-xxxx" />
            </div>
          </div>

          <div>
            <Label>Alamat</Label>
            <Input {...register("address")} placeholder="Alamat supplier" />
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
