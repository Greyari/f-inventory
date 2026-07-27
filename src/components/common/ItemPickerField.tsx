import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Check, Loader2, ChevronDown, ChevronLeft, ChevronRight, Plus, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useItems, useCreateItem } from "@/features/master/items/item.hooks";
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

const emptyNewItem = () => ({
  itemName: "",
  category: "",
  unit: "",
  minStockLevel: 0,
});

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

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newItem, setNewItem] = useState(emptyNewItem());

  const { data, isLoading } = useItems({ search: debouncedSearch, page, limit: 10 });
  const createMutation = useCreateItem();
  const currentSublabel = selected?.itemName ?? selectedSublabel;

  const handlePick = (item: Item) => {
    setSelected(item);
    onChange(item.id, item);
    closeModal();
  };

  const closeModal = () => {
    setOpen(false);
    setSearch("");
    setPage(1);
    setShowQuickAdd(false);
    setNewItem(emptyNewItem());
  };

  const openQuickAdd = () => {
    setNewItem((prev) => ({ ...prev, itemName: search })); // prefill dari kata yang dicari
    setShowQuickAdd(true);
  };

  const handleCreateItem = async () => {
    if (!newItem.itemName || !newItem.unit) return;
    const created = await createMutation.mutateAsync(newItem);
    if (created) handlePick(created);
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

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeModal())}>
        <DialogContent
          title={showQuickAdd ? t("item.formTitleAdd") : t("common.selectItem")}
          className="max-w-3xl"
        >
          {showQuickAdd ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> {t("common.backToList")}
              </button>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>{t("item.unit")}</Label>
                  <Input
                    value={newItem.unit}
                    onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                    placeholder="e.g. pcs, kg, m"
                  />
                </div>
                <div className="col-span-2">
                  <Label>{t("item.itemName")}</Label>
                  <Input
                    value={newItem.itemName}
                    onChange={(e) => setNewItem((p) => ({ ...p, itemName: e.target.value }))}
                    placeholder="e.g. Acetylene Gas Cylinder"
                  />
                </div>
                <div>
                  <Label>{t("item.category")}</Label>
                  <Input
                    value={newItem.category}
                    onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
                    placeholder="e.g. Consumable"
                  />
                </div>
                <div>
                  <Label>{t("item.minStock")}</Label>
                  <Input
                    type="number"
                    value={newItem.minStockLevel}
                    onChange={(e) => setNewItem((p) => ({ ...p, minStockLevel: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setShowQuickAdd(false)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateItem}
                  disabled={
                    createMutation.isPending || !newItem.itemName || !newItem.unit
                  }
                >
                  {createMutation.isPending ? t("common.saving") : t("common.save")}
                </Button>
              </div>
            </div>
          ) : (
            <>
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
                  <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
                    <span>{t("common.noData")}</span>
                    {search && (
                      <Button type="button" size="sm" variant="outline" onClick={openQuickAdd}>
                        <Plus className="h-3.5 w-3.5" /> {t("item.quickAddPrompt", { search })}
                      </Button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="sticky top-0 border-b bg-muted text-left text-xs uppercase text-muted-foreground">
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
                          <td className="px-3 py-2">{item.itemName}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{item.category}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {data?.meta && (data?.data.length ?? 0) > 0 && (
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("common.showingResults", {
                      from: data.meta.from ?? 0,
                      to: data.meta.to ?? 0,
                      total: data.meta.total ?? 0,
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={openQuickAdd} className="text-primary hover:underline">
                      {t("item.quickAddLinkShort")}
                    </button>
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
                        disabled={
                          data.meta.to !== undefined && data.meta.total !== undefined && data.meta.to >= data.meta.total
                        }
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-md border p-1.5 disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}