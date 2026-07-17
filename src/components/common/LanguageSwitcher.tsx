import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const setLang = (lng: "id" | "en") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center rounded-md border bg-muted/30 p-0.5 text-xs font-medium">
      <button
        onClick={() => setLang("id")}
        className={cn(
          "rounded px-2 py-1 transition-colors",
          i18n.language === "id" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        ID
      </button>
      <button
        onClick={() => setLang("en")}
        className={cn(
          "rounded px-2 py-1 transition-colors",
          i18n.language === "en" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}
