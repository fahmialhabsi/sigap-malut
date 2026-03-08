import React, { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { roleIdToName } from "../utils/roleMap";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

export default function DashboardKepalaDinasLayout({ children }) {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  useEffect(() => {
    const allowed =
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      roleName === "super_admin";
    if (!user || !allowed) window.location.href = "/";
  }, [user, roleName]);

  return (
    <div className="flex flex-col min-h-screen bg-ink text-surface font-inter">
      <header className="sticky top-0 z-10 border-b border-muted bg-ink/80 backdrop-blur text-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-2xl font-display text-primary">
              Dashboard Eksekutif (Kepala Dinas / Gubernur)
            </h2>
            <p className="text-sm text-muted">
              Ringkasan Eksekutif dan Monitoring
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
