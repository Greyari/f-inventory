import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";

// Lazy Loaded Components
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const ForbiddenPage = lazy(() => import("@/features/auth/ForbiddenPage"));
const NotFoundPage = lazy(() => import("@/features/auth/NotFoundPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));

// Inventory Components
const StockInPage = lazy(() => import("@/features/inventory/stock-in/StockInPage"));
const StockInFormPage = lazy(() => import("@/features/inventory/stock-in/StockInFormPage"));
const StockInDetailPage = lazy(() => import("@/features/inventory/stock-in/StockInDetailPage"));
const StockInMarkPoPage = lazy(() => import("@/features/inventory/stock-in/StockInMarkPoPage"));
const StockInMarkDoPage = lazy(() => import("@/features/inventory/stock-in/StockInMarkDoPage"));
const StockInOverridePage = lazy(() => import("@/features/inventory/stock-in/StockInOverridePage"));

const StockOutPage = lazy(() => import("@/features/inventory/stock-out/StockOutPage"));
const StockOutFormPage = lazy(() => import("@/features/inventory/stock-out/StockOutFormPage"));
const StockOutDetailPage = lazy(() => import("@/features/inventory/stock-out/StockOutDetailPage"));

const StockBalancePage = lazy(() => import("@/features/inventory/stock-balance/StockBalancePage"));
const StockItemDetailPage = lazy(() => import("@/features/inventory/stock-balance/StockItemDetailPage"));

// Asset Components
const AssetPage = lazy(() => import("@/features/assets/AssetPage"));
const AssetDetailPage = lazy(() => import("@/features/assets/AssetDetailPage"));
const AssetFormPage = lazy(() => import("@/features/assets/AssetFormPage"));
const AssetUsageFormPage = lazy(() => import("@/features/assets/AssetUsageFormPage"));
const AssetReturnPage = lazy(() => import("@/features/assets/AssetReturnPage"));

// Management Components
const UserManagementPage = lazy(() => import("@/features/users/UserManagementPage"));
const MasterDataPage = lazy(() => import("@/features/master/MasterDataPage"));
const ActivityLogPage = lazy(() => import("@/features/activity-log/ActivityLogPage"));

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
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: "/dashboard", element: withSuspense(<DashboardPage />) },

          /* Stock In Routes */
          { path: "/inventory/stock-in", element: withSuspense(<StockInPage />) },
          { path: "/inventory/stock-in/new", element: withSuspense(<StockInFormPage />) },
          { path: "/inventory/stock-in/:id", element: withSuspense(<StockInDetailPage />) },
          { path: "/inventory/stock-in/:id/edit", element: withSuspense(<StockInFormPage />) },
          { path: "/inventory/stock-in/:id/mark-po", element: withSuspense(<StockInMarkPoPage />) },
          { path: "/inventory/stock-in/:id/mark-do", element: withSuspense(<StockInMarkDoPage />) },
          {
            element: <ProtectedRoute requiredPermission="stock-in.override" />,
            children: [
              { path: "/inventory/stock-in/:id/override", element: withSuspense(<StockInOverridePage />) },
            ],
          },

          /* Stock Out Routes */
          { path: "/inventory/stock-out", element: withSuspense(<StockOutPage />) },
          { path: "/inventory/stock-out/new", element: withSuspense(<StockOutFormPage />) },
          { path: "/inventory/stock-out/:id", element: withSuspense(<StockOutDetailPage />) },
          {
            element: <ProtectedRoute requiredPermission="stock-out.override" />,
            children: [
              { path: "/inventory/stock-out/:id/edit", element: withSuspense(<StockOutFormPage />) },
            ],
          },

          /* Stock Balance Routes */
          { path: "/inventory/stock-balance", element: withSuspense(<StockBalancePage />) },
          { path: "/inventory/stock-balance/:itemId", element: withSuspense(<StockItemDetailPage />) },

          /* Protected Asset Routes */
          {
            element: (
              <ProtectedRoute
                requiredPermission={[
                  "assets.manage",
                  "asset-usages.checkout",
                  "asset-usages.return",
                ]}
              />
            ),
            children: [
              { path: "/assets", element: withSuspense(<AssetPage />) },
              { path: "/assets/new", element: withSuspense(<AssetFormPage />) },
              { path: "/assets/:assetId", element: withSuspense(<AssetDetailPage />) },
              { path: "/assets/:assetId/edit", element: withSuspense(<AssetFormPage />) },
              { path: "/assets/usage/new", element: withSuspense(<AssetUsageFormPage />) },
              { path: "/assets/usage/:usageId/return", element: withSuspense(<AssetReturnPage />) },
            ],
          },

          /* User Management Routes */
          {
            element: (
              <ProtectedRoute requiredPermission={["users.manage", "roles.manage"]} />
            ),
            children: [
              { path: "/users", element: withSuspense(<UserManagementPage />) },
            ],
          },

          /* Master Data Routes */
          {
            element: (
              <ProtectedRoute requiredPermission={["job-codes.manage", "items.manage"]} />
            ),
            children: [
              { path: "/master", element: withSuspense(<MasterDataPage />) },
            ],
          },

          /* Activity Logs Routes */
          {
            element: (
              <ProtectedRoute requiredPermission="activity-logs.view" />
            ),
            children: [
              { path: "/activity-logs", element: withSuspense(<ActivityLogPage />) },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: withSuspense(<NotFoundPage />) },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}