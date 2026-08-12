import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { KeyRound, ShieldCheck, UserCircle2 } from "lucide-react";

import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/store/authStore";
import { useChangePassword } from "./profile.hooks";
import {
  createPasswordFormSchema,
  type PasswordFormValues,
} from "./profileFormSchema";

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("profile.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("profile.subtitle")}
        </p>
      </div>

      {/* User Information */}
      <div className="rounded-lg border bg-background p-5">
        <div className="mb-4 flex items-center gap-2">
          <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            {t("profile.detailsTitle")}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">{user?.name}</p>

            <p className="truncate text-sm text-muted-foreground">
              {user?.email}
            </p>

            {user?.role && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                {user.role.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordCard />
    </div>
  );
}

function ChangePasswordCard() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();
  const [justChanged, setJustChanged] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(createPasswordFormSchema(t)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!justChanged) return;

    const timeout = setTimeout(() => {
      setJustChanged(false);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [justChanged]);

  const onSubmit = async (values: PasswordFormValues) => {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setJustChanged(true);
  };

  return (
    <div className="rounded-lg border bg-background p-5">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">
          {t("profile.passwordTitle")}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>{t("profile.currentPassword")}</Label>

          <Input
            type="password"
            {...register("currentPassword")}
            placeholder="••••••••"
          />

          {errors.currentPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label>{t("profile.newPassword")}</Label>

          <Input
            type="password"
            {...register("newPassword")}
            placeholder="••••••••"
          />

          {errors.newPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label>{t("profile.confirmPassword")}</Label>

          <Input
            type="password"
            {...register("confirmPassword")}
            placeholder="••••••••"
          />

          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {justChanged && (
            <span className="text-xs font-medium text-emerald-600">
              {t("profile.passwordChangedHint")}
            </span>
          )}

          <Button
            type="submit"
            disabled={changePassword.isPending}
          >
            {changePassword.isPending
              ? t("common.saving")
              : t("profile.changePasswordButton")}
          </Button>
        </div>
      </form>
    </div>
  );
}