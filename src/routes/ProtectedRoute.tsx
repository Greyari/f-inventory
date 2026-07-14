import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  /**
   * Salah satu dari daftar ini cukup (OR logic) — biar konsisten dengan
   * middleware permission di backend yang juga support multi-permission.
   */
  requiredPermission?: string | string[];
}

export function ProtectedRoute({ requiredPermission }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userPermissions = useAuthStore((s) => s.user?.permissions ?? []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission) {
    const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const allowed = required.some((p) => userPermissions.includes(p));
    if (!allowed) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
}
