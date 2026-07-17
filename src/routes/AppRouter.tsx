import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";

const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const StockInPage = lazy(() => import("@/features/inventory/stock-in/StockInPage"));
const StockOutPage = lazy(() => import("@/features/inventory/stock-out/StockOutPage"));
const StockBalancePage = lazy(() => import("@/features/inventory/stock-balance/StockBalancePage"));
const UserManagementPage = lazy(() => import("@/features/users/UserManagementPage"));
const MasterDataPage = lazy(() => import("@/features/master/MasterDataPage"));
const ForbiddenPage = lazy(() => import("@/features/auth/ForbiddenPage"));
const NotFoundPage = lazy(() => import("@/features/auth/NotFoundPage"));

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center text-muted-foreground">
      Loading...
    </div>
  );
}

const withSuspense = (el: React.ReactNode) => (
  <Suspense fallback={<Loading />}>{el}</Suspense>
);

const router = createBrowserRouter([
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/403", element: withSuspense(<ForbiddenPage />) },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: withSuspense(<DashboardPage />) },
          { path: "/inventory/stock-in", element: withSuspense(<StockInPage />) },
          { path: "/inventory/stock-out", element: withSuspense(<StockOutPage />) },
          { path: "/inventory/stock-balance", element: withSuspense(<StockBalancePage />) },

          {
            element: <ProtectedRoute requiredPermission={["users.manage", "roles.manage"]} />,
            children: [{ path: "/users", element: withSuspense(<UserManagementPage />) }],
          },

          {
            element: <ProtectedRoute requiredPermission={["job-codes.manage", "items.manage"]} />,
            children: [{ path: "/master", element: withSuspense(<MasterDataPage />) }],
          },

          { index: true, element: withSuspense(<DashboardPage />) },
        ],
      },
    ],
  },

  { path: "*", element: withSuspense(<NotFoundPage />) },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}