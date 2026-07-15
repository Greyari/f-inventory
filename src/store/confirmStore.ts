import { create } from "zustand";

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
  request: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  title: "Konfirmasi",
  description: "",
  confirmText: "Ya, Lanjutkan",
  cancelText: "Batal",
  variant: "default",
  resolve: null,

  request: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title: options.title ?? "Konfirmasi",
        description: options.description,
        confirmText: options.confirmText ?? "Ya, Lanjutkan",
        cancelText: options.cancelText ?? "Batal",
        variant: options.variant ?? "default",
        resolve,
      });
    });
  },

  handleConfirm: () => {
    get().resolve?.(true);
    set({ isOpen: false, resolve: null });
  },

  handleCancel: () => {
    get().resolve?.(false);
    set({ isOpen: false, resolve: null });
  },
}));

/**
 * Hook buat dipakai di komponen mana pun, gantiin window.confirm().
 * Contoh:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ description: `Hapus "${row.name}"?`, variant: "destructive" });
 *   if (ok) mutate(row.id);
 */
export function useConfirm() {
  return useConfirmStore((s) => s.request);
}
