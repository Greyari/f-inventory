import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";

const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const StockInPage = lazy(() => import("@/features/inventory/stock-in/StockInPage"));
const StockInFormPage = lazy(() => import("@/features/inventory/stock-in/StockInFormPage"));
const StockInMarkPoPage = lazy(() => import("@/features/inventory/stock-in/StockInMarkPoPage"));
const StockInMarkDoPage = lazy(() => import("@/features/inventory/stock-in/StockInMarkDoPage"));
const StockOutPage = lazy(() => import("@/features/inventory/stock-out/StockOutPage"));
const StockBalancePage = lazy(() => import("@/features/inventory/stock-balance/StockBalancePage"));
const StockItemDetailPage = lazy(() => import("@/features/inventory/stock-balance/StockItemDetailPage"));
const UserManagementPage = lazy(() => import("@/features/users/UserManagementPage"));
const MasterDataPage = lazy(() => import("@/features/master/MasterDataPage"));
const ForbiddenPage = lazy(() => import("@/features/auth/ForbiddenPage"));
const NotFoundPage = lazy(() => import("@/features/auth/NotFoundPage"));
const StockOutFormPage = lazy(() => import("@/features/inventory/stock-out/StockOutFormPage"));
const StockOutDetailPage = lazy(() => import("@/features/inventory/stock-out/StockOutDetailPage"));
const AssetPage = lazy(() => import("@/features/assets/AssetPage"));

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

const StockInDetailPage = lazy(() => import("@/features/inventory/stock-in/StockInDetailPage"));

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
          { path: "/inventory/stock-in/new", element: withSuspense(<StockInFormPage />) },
          { path: "/inventory/stock-in/:id/edit", element: withSuspense(<StockInFormPage />) },
          { path: "/inventory/stock-in/:id/mark-po", element: withSuspense(<StockInMarkPoPage />) },
          { path: "/inventory/stock-in/:id/mark-do", element: withSuspense(<StockInMarkDoPage />) },
          { path: "/inventory/stock-in/:id", element: withSuspense(<StockInDetailPage />) },
          { path: "/inventory/stock-out", element: withSuspense(<StockOutPage />) },
          { path: "/inventory/stock-out/new", element: withSuspense(<StockOutFormPage />) },
          { path: "/inventory/stock-out/:id/edit", element: withSuspense(<StockOutFormPage />) },
          { path: "/inventory/stock-out/:id", element: withSuspense(<StockOutDetailPage />) },
          { path: "/inventory/stock-balance", element: withSuspense(<StockBalancePage />) },
          { path: "/inventory/stock-balance/:itemId", element: withSuspense(<StockItemDetailPage />) },
          {
            element: <ProtectedRoute requiredPermission={["assets.manage", "asset-usages.checkout", "asset-usages.return"]} />,
            children: [{ path: "/assets", element: withSuspense(<AssetPage />) }],
          },
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