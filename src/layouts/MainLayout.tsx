import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  PackagePlus,
  PackageMinus,
  Boxes,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore, useCurrentUser } from "@/store/authStore";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiredPermission: null },
  { to: "/purchasing", label: "Purchasing", icon: ShoppingCart, requiredPermission: null },
  { to: "/inventory/stock-in", label: "Barang Masuk", icon: PackagePlus, requiredPermission: null },
  { to: "/inventory/stock-out", label: "Barang Keluar", icon: PackageMinus, requiredPermission: null },
  { to: "/inventory/stock-balance", label: "Stok Tersisa", icon: Boxes, requiredPermission: null },
  {
    to: "/users",
    label: "Manajemen User",
    icon: Users,
    requiredPermission: ["users.manage", "roles.manage"],
  },
  {
    to: "/master",
    label: "Data Master",
    icon: Settings,
    requiredPermission: ["job-codes.manage", "items.manage", "suppliers.manage"],
  },
] as const;

export function MainLayout() {
  const user = useCurrentUser();
  const userPermissions = user?.permissions ?? [];
  const logout = useAuthStore((s) => s.logout);

  const canAccess = (required: readonly string[] | null) =>
    !required || required.some((p) => userPermissions.includes(p));

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-background flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-semibold text-lg">Inventory System</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems
            .filter((item) => canAccess(item.requiredPermission))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="p-3 border-t">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-background flex items-center px-6">
          <h1 className="text-base font-semibold">Selamat datang, {user?.name}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
