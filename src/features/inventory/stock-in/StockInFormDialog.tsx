import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { fetchItemOptions } from "@/lib/selectOptions";
import { useCreateStockIn } from "./stock-in.hooks";

const schema = z.object({
  referenceNo: z.string().min(1, "Nomor referensi wajib diisi"),
  dateReceived: z.string().min(1, "Tanggal wajib diisi"),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, "Item wajib dipilih"),
        qty: z.coerce.number().min(0.01, "Qty harus > 0"),
        location: z.string().optional(),
      })
    )
    .min(1, "Minimal 1 item"),
});

type FormValues = z.infer<typeof schema>;

interface StockInFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockInFormDialog({ open, onOpenChange }: StockInFormDialogProps) {
  const createMutation = useCreateStockIn();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      referenceNo: "",
      dateReceived: new Date().toISOString().slice(0, 10),
      items: [{ itemId: "", qty: 1, location: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (open) {
      reset({
        referenceNo: "",
        dateReceived: new Date().toISOString().slice(0, 10),
        items: [{ itemId: "", qty: 1, location: "" }],
      });
    }
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    await createMutation.mutateAsync(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Catat Barang Masuk" className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nomor Referensi (GRN)</Label>
              <Input {...register("referenceNo")} placeholder="mis. GRN-2026-0031" />
              {errors.referenceNo && (
                <p className="mt-1 text-xs text-destructive">{errors.referenceNo.message}</p>
              )}
            </div>
            <div>
              <Label>Tanggal Diterima</Label>
              <Input type="date" {...register("dateReceived")} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Item</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ itemId: "", qty: 1, location: "" })}
              >
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 items-start gap-2">
                  <div className="col-span-5">
                    <Controller
                      control={control}
                      name={`items.${index}.itemId`}
                      render={({ field: f }) => (
                        <SearchableSelect
                          value={f.value}
                          onChange={f.onChange}
                          fetchOptions={fetchItemOptions}
                          placeholder="Pilih item..."
                          error={!!errors.items?.[index]?.itemId}
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="any" placeholder="Qty" {...register(`items.${index}.qty`)} />
                  </div>
                  <div className="col-span-4">
                    <Input placeholder="Lokasi (mis. Gudang A)" {...register(`items.${index}.location`)} />
                  </div>
                  <div className="col-span-1">
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
