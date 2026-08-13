import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from "@/lib/config";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push(() => resolve(apiClient(originalRequest)));
        });
      }

      isRefreshing = true;
      try {
        await useAuthStore.getState().refreshAccessToken();
        pendingQueue.forEach((cb) => cb());
        pendingQueue = [];
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (
      error.response &&
      error.response.status !== 401 &&
      originalRequest?.method?.toLowerCase() === "get"
    ) {
      const message =
        (error.response.data as { message?: string } | undefined)?.message ??
        "Failed to load data";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);