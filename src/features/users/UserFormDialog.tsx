import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  password: z.string().min(3, "Password minimal 3 karakter"),
  roleId: z.string().min(1, "Role wajib dipilih"),
});

const editSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  roleId: z.string().min(1, "Role wajib dipilih"),
  isActive: z.boolean(),
  password: z
    .union([z.string().length(0), z.string().min(3, "Password minimal 3 karakter")])
    .optional(),
});

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingData?: User | null;
}

export function UserFormDialog({ open, onOpenChange, editingData }: UserFormDialogProps) {
  const { t } = useTranslation();
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
          password: "",
        } as never);
      } else {
        reset({ name: "", email: "", password: "", roleId: "" } as never);
      }
    }
  }, [open, editingData, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: never) => {
    const payload = { ...(values as Record<string, unknown>) };

    if (isEdit && !payload.password) {
      delete payload.password;
    }

    if (isEdit && editingData) {
      await updateMutation.mutateAsync({ id: editingData.id, payload: payload as never });
    } else {
      await createMutation.mutateAsync(payload as never);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={isEdit ? t("users.formTitleEdit") : t("users.formTitleAdd")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>{t("users.name")}</Label>
            <Input {...register("name")} placeholder={t("users.name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label>{t("users.email")}</Label>
            <Input type="email" {...register("email")} placeholder="nama@company.com" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <Label>
              {t("users.password")}
              {isEdit && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {t("users.passwordEditHint")}
                </span>
              )}
            </Label>
            <Input
              type="password"
              {...register("password")}
              placeholder={isEdit ? t("users.passwordEditPlaceholder") : t("users.passwordPlaceholder")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label>{t("users.role")}</Label>
            <Select {...register("roleId")}>
              <option value="">{t("users.selectRole")}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
            {errors.roleId && <p className="mt-1 text-xs text-destructive">{errors.roleId.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}