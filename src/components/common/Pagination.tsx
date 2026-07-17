import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiMeta } from "@/types/api.types";

interface PaginationProps {
  meta: ApiMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const { current_page, per_page, total, last_page } = meta;

  if (total === 0) return null;

  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  // Tampilkan maksimal 5 nomor halaman, geser sesuai posisi current_page
  const pageNumbers = getPageWindow(current_page, last_page, 5);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {t("common.showingResults", { from, to, total })}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers[0] > 1 && (
          <>
            <PageButton page={1} active={current_page === 1} onClick={onPageChange} />
            {pageNumbers[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
          </>
        )}

        {pageNumbers.map((p) => (
          <PageButton key={p} page={p} active={p === current_page} onClick={onPageChange} />
        ))}

        {pageNumbers[pageNumbers.length - 1] < last_page && (
          <>
            {pageNumbers[pageNumbers.length - 1] < last_page - 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <PageButton page={last_page} active={current_page === last_page} onClick={onPageChange} />
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          disabled={current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PageButton({
  page,
  active,
  onClick,
}: {
  page: number;
  active: boolean;
  onClick: (page: number) => void;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => onClick(page)}
    >
      {page}
    </Button>
  );
}

function getPageWindow(current: number, last: number, size: number): number[] {
  const half = Math.floor(size / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(last, start + size - 1);
  start = Math.max(1, end - size + 1);

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}
