import { useTranslation } from "react-i18next";

export default function ForbiddenPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 p-4 text-center">
      <h1 className="text-3xl font-bold">{t("forbidden.title")}</h1>
      <p className="text-muted-foreground">{t("forbidden.message")}</p>
    </div>
  );
}
