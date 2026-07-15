import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppRouter } from "@/routes/AppRouter";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import "@/i18n";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster richColors position="top-right" />
      <ConfirmDialog />
    </QueryClientProvider>
  </StrictMode>
);
