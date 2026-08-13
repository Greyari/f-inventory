import { isAxiosError } from "axios";

/**
 * Ambil pesan error dari response API (backend selalu mengirim field
 * `message` dalam Bahasa Inggris). `fallback` hanya dipakai untuk kasus
 * langka saat backend gak sempat balas apa-apa (mis. network error/timeout),
 * jadi cukup teks statis bahasa Inggris, gak perlu di-translate lagi.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return isAxiosError(error) ? ((error.response?.data as { message?: string })?.message ?? fallback) : fallback;
}
