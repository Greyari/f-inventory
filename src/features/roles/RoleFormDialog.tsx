import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePermissions, useCreateRole, useUpdateRole } from "./role.hooks";
import type { Role } from "@/types/auth.types";

const schema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingData?: Role | null;
}

export function RoleFormDialog({ open, onOpenChange, editingData }: RoleFormDialogProps) {
  const isEdit = !!editingData;
  const isSystemRole = editingData?.isSystem ?? false;

  const { data: permissions, isLoading: loadingPermissions } = usePermissions();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        name: editingData?.name ?? "",
        description: editingData?.description ?? "",
      });
      setSelectedPermissionIds(new Set(editingData?.permissions.map((p) => p.id) ?? []));
    }
  }, [open, editingData, reset]);

  const groupedPermissions = useMemo(() => {
    if (!permissions) return {};
    return permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
      (acc[p.group] ??= []).push(p);
      return acc;
    }, {});
  }, [permissions]);

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleGroup = (groupPermissions: { id: string }[], allChecked: boolean) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      groupPermissions.forEach((p) => (allChecked ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, permissionIds: Array.from(selectedPermissionIds) };
    if (isEdit && editingData) {
      await updateMutation.mutateAsync({ id: editingData.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit Role" : "Tambah Role"} className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSystemRole && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Ini role bawaan sistem — nama tidak bisa diubah, tapi permission-nya masih bisa disesuaikan.
            </p>
          )}

          <div>
            <Label>Nama Role</Label>
            <Input {...register("name")} disabled={isSystemRole} placeholder="mis. Checker Gudang" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Deskripsi (opsional)</Label>
            <Textarea {...register("description")} placeholder="Buat apa role ini" />
          </div>

          <div>
            <Label>Hak Akses</Label>
            {loadingPermissions ? (
              <p className="text-sm text-muted-foreground">Memuat daftar permission...</p>
            ) : (
              <div className="max-h-72 space-y-4 overflow-y-auto rounded-md border p-3">
                {Object.entries(groupedPermissions).map(([group, items]) => {
                  const allChecked = items.every((p) => selectedPermissionIds.has(p.id));
                  return (
                    <div key={group}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">{group}</span>
                        <button
                          type="button"
                          onClick={() => toggleGroup(items, allChecked)}
                          className="text-xs text-primary hover:underline"
                        >
                          {allChecked ? "Batal semua" : "Pilih semua"}
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedPermissionIds.has(p.id)}
                              onChange={() => togglePermission(p.id)}
                              className="h-4 w-4"
                            />
                            {p.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
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
