import { useState } from "react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/store/authStore";
import UserListPage from "./UserListPage";
import RoleListPage from "@/features/roles/RoleListPage";

type Tab = "users" | "roles";

export default function UserManagementPage() {
  const canManageUsers = useHasPermission("users.manage");
  const canManageRoles = useHasPermission("roles.manage");
  const [tab, setTab] = useState<Tab>(canManageUsers ? "users" : "roles");

  const TABS: { key: Tab; label: string; visible: boolean }[] = [
    { key: "users", label: "User", visible: canManageUsers },
    { key: "roles", label: "Role & Akses", visible: canManageRoles },
  ];

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold">Manajemen User</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Kelola user dan atur hak akses (role & permission) di sistem.
      </p>

      <div className="mb-4 flex gap-1 border-b">
        {TABS.filter((t) => t.visible).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && canManageUsers && <UserListPage />}
      {tab === "roles" && canManageRoles && <RoleListPage />}
    </div>
  );
}
