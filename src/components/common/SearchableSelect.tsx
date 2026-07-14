import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fetchOptions: (search: string) => Promise<SearchableOption[]>;
  selectedLabel?: string; // label yang sudah diketahui (mis. saat edit), biar gak nunggu fetch dulu
  disabled?: boolean;
  error?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  placeholder = "Pilih...",
  fetchOptions,
  selectedLabel,
  disabled,
  error,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [options, setOptions] = useState<SearchableOption[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    fetchOptions(debouncedSearch)
      .then((opts) => {
        if (active) setOptions(opts);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, debouncedSearch, fetchOptions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = options.find((o) => o.value === value)?.label ?? selectedLabel;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
          error ? "border-destructive" : "border-border"
        )}
      >
        <span className={cn("truncate text-left", !currentLabel && "text-muted-foreground")}>
          {currentLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          <div className="relative border-b p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              className="h-8 w-full rounded-md bg-muted/50 pl-7 pr-2 text-sm outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat...
              </div>
            ) : options.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">Tidak ada hasil</div>
            ) : (
              options.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span className="truncate">
                    <span className="font-medium">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="ml-1.5 text-xs text-muted-foreground">{opt.sublabel}</span>
                    )}
                  </span>
                  {opt.value === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
