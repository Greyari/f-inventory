import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/axios";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import type { ApiSuccess } from "@/types/api.types";
import type { LoginResponse } from "@/types/auth.types";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(3, "Password minimal 3 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { data } = await apiClient.post<ApiSuccess<LoginResponse>>(
        "/auth/login",
        values
      );
      setSession(data.data);
      toast.success(t("auth.loginSuccess", { name: data.data.user.name }));
      navigate("/dashboard");
    } catch {
      toast.error(t("auth.loginFailed"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="mb-1 text-xl font-semibold">{t("app.name")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.loginTitle")}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("auth.email")}</label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="nama@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t("auth.password")}</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? t("auth.loggingIn") : t("auth.loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
