import { useState } from "react";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockInDetail, useMarkStockInDo } from "./stock-in.hooks";

export default function StockInMarkDoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: stockIn, isLoading } = useStockInDetail(id);
  const markAsDo = useMarkStockInDo();
  const [doPhoto, setDoPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState(false);

  if (!id) return null;

  if (isLoading || !stockIn) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (stockIn.status !== "po") {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center text-sm text-muted-foreground">
        {t("stockIn.notPoNotice")}
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(`/inventory/stock-in/${id}`)}>
            {t("common.backToList")}
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!doPhoto) {
      setPhotoError(true);
      return;
    }
    await markAsDo.mutateAsync({ id, doPhoto });
    navigate(`/inventory/stock-in/${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(`/inventory/stock-in/${id}`)}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
      </button>

      <div className="mb-2">
        <h2 className="text-2xl font-semibold">{t("stockIn.markAsDo")}</h2>
        <p className="text-sm text-muted-foreground">{t("stockIn.markAsDoSubtitle", { ref: stockIn.prNo })}</p>
      </div>

      <div className="space-y-4 rounded-lg border bg-background p-6">
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          {t("stockIn.markAsDoStockHint")}
        </div>

        <div>
          <Label>{t("stockIn.doDocument")}</Label>
          <p className="mb-2 text-xs text-muted-foreground">{t("stockIn.doDocumentHint")}</p>

          {doPhoto ? (
            <div className="flex items-center gap-2 rounded border bg-muted/40 px-3 py-2 text-sm">
              <span className="max-w-[220px] truncate">{doPhoto.name}</span>
              <button type="button" onClick={() => setDoPhoto(null)} className="text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded border border-dashed px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
              <Upload className="h-4 w-4" />
              {t("stockIn.uploadDocument")}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  setPhotoError(false);
                  setDoPhoto(e.target.files?.[0] ?? null);
                }}
              />
            </label>
          )}
          {photoError && <p className="mt-1 text-xs text-destructive">{t("stockIn.documentRequired")}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/inventory/stock-in/${id}`)}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={markAsDo.isPending}>
            {markAsDo.isPending ? t("common.saving") : t("stockIn.confirmMarkAsDo")}
          </Button>
        </div>
      </div>
    </div>
  );
}
