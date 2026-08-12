import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  PackagePlus,
  PackageMinus,
  Boxes,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  History,
  Boxes as AssetIcon,
  UserCircle2,
  MoreVertical,
  User,
} from "lucide-react";
import { useAuthStore, useCurrentUser } from "@/store/authStore";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, requiredPermission: null },
  { to: "/inventory/stock-in", labelKey: "nav.stockIn", icon: PackagePlus, requiredPermission: null },
  { to: "/inventory/stock-out", labelKey: "nav.stockOut", icon: PackageMinus, requiredPermission: null },
  { to: "/inventory/stock-balance", labelKey: "nav.stockBalance", icon: Boxes, requiredPermission: null },
  {
    to: "/assets",
    labelKey: "asset.navLabel",
    icon: AssetIcon,
    requiredPermission: ["assets.manage", "asset-usages.checkout", "asset-usages.return"],
  },
  {
    to: "/users",
    labelKey: "nav.users",
    icon: Users,
    requiredPermission: ["users.manage", "roles.manage"],
  },
  {
    to: "/master",
    labelKey: "nav.master",
    icon: Settings,
    requiredPermission: ["job-codes.manage", "items.manage"],
  },
  {
    to: "/activity-logs",
    labelKey: "nav.activityLog",
    icon: History,
    requiredPermission: ["activity-logs.view"],
  },
] as const;

export function MainLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const userPermissions = user?.permissions ?? [];
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canAccess = (required: readonly string[] | null) =>
    !required || required.some((p) => userPermissions.includes(p));

  const visibleItems = NAV_ITEMS.filter((item) => canAccess(item.requiredPermission));

  const SidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
        <span className="font-semibold text-lg">{t("app.name")}</span>
        <button className="md:hidden" onClick={() => setMobileOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      {/* Area Bottom User Profile */}
      <div className="relative p-3 border-t flex items-center justify-between gap-2" ref={menuRef}>
        <div className="flex items-center gap-2 min-w-0">
          <UserCircle2 className="h-8 w-8 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role?.name}</p>
          </div>
        </div>

        {/* Tombol Titik Tiga */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {/* Menu Popover Custom */}
        {isMenuOpen && (
          <div className="absolute bottom-14 right-3 z-50 w-44 rounded-md border bg-popover p-1 shadow-md text-popover-foreground">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setMobileOpen(false);
                navigate("/profile");
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <User className="h-4 w-4" />
              <span>{t("profile.title") || "Profile"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("auth.logout") || "Logout"}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-muted/30">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-background">
        {SidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-background shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden shrink-0" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-sm font-semibold md:text-base">
              {t("common.welcome", { name: user?.name })}
            </h1>
          </div>
          <LanguageSwitcher />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}