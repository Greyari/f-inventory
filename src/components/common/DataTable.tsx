import { useTranslation } from "react-i18next";
import { Search, Loader2, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pagination } from "./Pagination";
import type { ApiMeta } from "@/types/api.types";

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
  // Sembunyikan kolom ini di layar kecil (mobile), biar tabel gak kepencet
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  keyExtractor: (row: T) => string;
  meta?: ApiMeta;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actions,
  rowActions,
  keyExtractor,
  meta,
  onPageChange,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder ?? `${t("common.search")}...`}
            className="pl-9"
          />
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase text-muted-foreground">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn("px-4 py-3 whitespace-nowrap", col.hideOnMobile && "hidden sm:table-cell", col.className)}
                >
                  {col.header}
                </th>
              ))}
              {rowActions && <th className="px-4 py-3 text-right">{t("common.actions")}</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  {t("common.loadingData")}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-10 text-center text-muted-foreground">
                  <Inbox className="mx-auto mb-2 h-6 w-6" />
                  {t("common.noData")}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)} className="border-b last:border-0 hover:bg-muted/30">
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={cn("px-4 py-3", col.hideOnMobile && "hidden sm:table-cell", col.className)}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">{rowActions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && onPageChange && <Pagination meta={meta} onPageChange={onPageChange} />}
    </div>
  );
}
