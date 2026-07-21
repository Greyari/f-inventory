import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Check, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useItems } from "@/features/master/items/item.hooks";
import type { Item } from "@/types/inventory.types";

interface ItemPickerFieldProps {
  value?: string;
  onChange: (value: string, item?: Item) => void;
  selectedLabel?: string;
  selectedSublabel?: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

export function ItemPickerField({
  value,
  onChange,
  selectedLabel,
  selectedSublabel,
  placeholder,
  error,
  disabled,
}: ItemPickerFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Item | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useItems({ search: debouncedSearch, page, limit: 10 });

  const currentLabel = selected?.itemCode ?? selectedLabel;
  const currentSublabel = selected?.itemName ?? selectedSublabel;

  const handlePick = (item: Item) => {
    setSelected(item);
    onChange(item.id, item);
    setOpen(false);
    setSearch("");
    setPage(1);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
          error ? "border-destructive" : "border-border"
        )}
      >
        <span className="truncate text-left">
          {currentLabel ? (
            <>
              <span className="font-medium">{currentLabel}</span>
              {currentSublabel && <span className="ml-1.5 text-xs text-muted-foreground">{currentSublabel}</span>}
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder || t("common.selectItem")}</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={t("common.selectItem")} className="max-w-3xl">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`${t("common.search")}...`}
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="max-h-96 overflow-y-auto rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
              </div>
            ) : (data?.data.length ?? 0) === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="sticky top-0 border-b bg-muted text-left text-xs uppercase text-muted-foreground">
                    <th className="px-3 py-2">{t("item.itemCode")}</th>
                    <th className="px-3 py-2">{t("item.itemName")}</th>
                    <th className="px-3 py-2">{t("item.category")}</th>
                    <th className="px-3 py-2">{t("item.unit")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handlePick(item)}
                      className="cursor-pointer border-b last:border-0 hover:bg-muted"
                    >
                      <td className="px-3 py-2 font-medium">
                        <span className="flex items-center gap-1.5">
                          {item.itemCode}
                          {item.id === value && <Check className="h-3.5 w-3.5 text-primary" />}
                        </span>
                      </td>
                      <td className="px-3 py-2">{item.itemName}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{item.category}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {data?.meta && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("common.showingResults", {
                  from: data.meta.from ?? 0,
                  to: data.meta.to ?? 0,
                  total: data.meta.total ?? 0,
                })}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border p-1.5 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={data.meta.to !== undefined && data.meta.total !== undefined && data.meta.to >= data.meta.total}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border p-1.5 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}