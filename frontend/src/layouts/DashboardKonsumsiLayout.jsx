import React, { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { roleIdToName } from "../utils/roleMap";

export default function DashboardKonsumsiLayout({ children }) {
  const user = useAuthStore((state) => state.user);
  const roleName = user ? roleIdToName[user.role_id] : null;

  useEffect(() => {
    if (
      !user ||
      !(
        roleName === "kepala_bidang_konsumsi" ||
        roleName === "super_admin" ||
        user.unit_kerja === "Bidang Konsumsi"
      )
    ) {
      window.location.href = "/landing";
    }
  }, [user, roleName]);

  return (
    <div className="flex flex-col min-h-screen bg-ink text-surface font-inter">
      {/* Header Konsumsi */}
      <header className="sticky top-0 z-10 border-b border-muted bg-ink/80 backdrop-blur text-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-2xl font-display text-primary">
              Dashboard Konsumsi
            </h2>
            <p className="text-sm text-muted">
              Ringkasan Konsumsi dan Monitoring
            </p>
          </div>
        </div>
      </header>
      {/* Konten utama dashboard */}
      <main className="flex-1 px-8 py-8 mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
