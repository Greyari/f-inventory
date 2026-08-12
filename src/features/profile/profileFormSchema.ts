import { z } from "zod";
import type { TFunction } from "i18next";

export function createPasswordFormSchema(t: TFunction) {
  return z
    .object({
      currentPassword: z.string().min(1, t("profile.validation.currentPasswordRequired")),
      newPassword: z.string().min(6, t("profile.validation.newPasswordMin")),
      confirmPassword: z.string().min(1, t("profile.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("profile.validation.confirmPasswordMismatch"),
      path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: t("profile.validation.newPasswordSameAsCurrent"),
      path: ["newPassword"],
    });
}

export type PasswordFormValues = z.infer<ReturnType<typeof createPasswordFormSchema>>;