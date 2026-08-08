import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import type { User } from "@/types/auth.types";
import { API_BASE_URL } from "@/lib/config";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (params: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: currentRefreshToken,
        });

        set({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
        });
      },
    }),
    {
      name: "inventory-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector helpers
export const useCurrentUser = () => useAuthStore((s) => s.user);

export const useIsSuperAdmin = () => useAuthStore((s) => s.user?.role?.slug === "super-admin");

/**
 * Cek permission spesifik, ini yang seharusnya dipakai buat gating UI
 * (tombol, menu, dsb) — bukan useIsSuperAdmin, supaya kalau ada role baru
 * yang dikasih permission tertentu, UI-nya otomatis nyesuaikan.
 */
export const useHasPermission = (slug: string) =>
  useAuthStore((s) => s.user?.permissions?.includes(slug) ?? false);
