import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateUser, useUpdateUser } from "./user.hooks";
import { useRoles } from "@/features/roles/role.hooks";
import type { User } from "@/types/auth.types";

const createSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  roleId: z.string().min(1, "Role wajib dipilih"),
});

const editSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  roleId: z.string().min(1, "Role wajib dipilih"),
  isActive: z.boolean(),
});

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingData?: User | null;
}

export function UserFormDialog({ open, onOpenChange, editingData }: UserFormDialogProps) {
  const isEdit = !!editingData;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: rolesResponse } = useRoles({ limit: 100 });
  const roles = rolesResponse?.data ?? [];

  const schema = isEdit ? editSchema : createSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof createSchema> & Partial<z.infer<typeof editSchema>>>({
    resolver: zodResolver(schema as never),
  });

  useEffect(() => {
    if (open) {
      if (editingData) {
        reset({
          name: editingData.name,
          email: editingData.email,
          roleId: editingData.roleId,
          isActive: editingData.isActive,
        } as never);
      } else {
        reset({ name: "", email: "", password: "", roleId: "" } as never);
      }
    }
  }, [open, editingData, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: never) => {
    if (isEdit && editingData) {
      await updateMutation.mutateAsync({ id: editingData.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? "Edit User" : "Tambah User"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nama</Label>
            <Input {...register("name")} placeholder="Nama lengkap" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} placeholder="nama@company.com" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {!isEdit && (
            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} placeholder="Minimal 6 karakter" />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <Label>Role</Label>
            <Select {...register("roleId")}>
              <option value="">Pilih role...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
            {errors.roleId && <p className="mt-1 text-xs text-destructive">{errors.roleId.message}</p>}
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...register("isActive")} className="h-4 w-4" />
              <Label htmlFor="isActive" className="mb-0">
                Akun aktif
              </Label>
            </div>
          )}

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
