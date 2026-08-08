/**
 * Base URL API backend. Sebelumnya nilai default ini ("/api/v1") ada di 2
 * file terpisah (lib/axios.ts dan store/authStore.ts) dan salah — backend
 * (Laravel) daftarin API route-nya di prefix "/api" tanpa versioning, bukan
 * "/api/v1". Sekarang cuma didefinisikan sekali di sini.
 *
 * Selalu set VITE_API_BASE_URL di .env untuk environment production/staging
 * (lihat .env.example) — default di bawah ini cuma fallback untuk dev lokal.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
