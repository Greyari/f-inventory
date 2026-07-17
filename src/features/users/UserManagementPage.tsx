import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/store/authStore";
import UserListPage from "./UserListPage";
import RoleListPage from "@/features/roles/RoleListPage";

type Tab = "users" | "roles";

export default function UserManagementPage() {
  const { t } = useTranslation();
  const canManageUsers = useHasPermission("users.manage");
  const canManageRoles = useHasPermission("roles.manage");
  const [tab, setTab] = useState<Tab>(canManageUsers ? "users" : "roles");

  const TABS: { key: Tab; label: string; visible: boolean }[] = [
    { key: "users", label: t("users.tabUsers"), visible: canManageUsers },
    { key: "roles", label: t("users.tabRoles"), visible: canManageRoles },
  ];

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold">{t("users.title")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("users.subtitle")}</p>

      <div className="mb-4 flex gap-1 border-b">
        {TABS.filter((tItem) => tItem.visible).map((tItem) => (
          <button
            key={tItem.key}
            onClick={() => setTab(tItem.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === tItem.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {tab === "users" && canManageUsers && <UserListPage />}
      {tab === "roles" && canManageRoles && <RoleListPage />}
    </div>
  );
}