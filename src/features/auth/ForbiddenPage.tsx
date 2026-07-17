import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react"; 

export default function ForbiddenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-6 text-center animate-in fade-in duration-300">
      <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive ring-8 ring-destructive/5">
        <ShieldAlert className="h-10 w-10" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t("forbidden.title")}
      </h1>
      
      <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        {t("forbidden.message")}
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.backToDashboard", "Kembali ke Dashboard")}
      </button>
    </div>
  );
}