import React from "react";
import useAuthStore from "../stores/authStore";
import NotificationCenter from "../components/notifications/NotificationCenter";

/**
 * Layout ringkas: tanpa modul Sekretariat/Bidang/UPTD/Tugas/e-Pelara di bilah atas
 * (permintaan operasional — fokus konten halaman).
 */
export default function DashboardLayout({ children }) {
  const user = useAuthStore((state) => state.user);

  const childComponentName =
    children?.type?.displayName || children?.type?.name || "";
  const standaloneDashboardNames = [
    "DashboardDistribusi",
    "DashboardDistribusiLayout",
    "DashboardDistribusiSuperModern",
    "DashboardSekretariat",
    "DashboardSekretariatLayout",
    "DashboardKetersediaan",
    "DashboardKetersediaanLayout",
    "DashboardKonsumsi",
    "DashboardKonsumsiLayout",
    "DashboardUPTD",
    "DashboardUPTDLayout",
    "DashboardGubernur",
    "DashboardKepalaDinas",
    "DashboardSuperAdmin",
    "DashboardFungsional",
    "DashboardPelaksana",
    "DashboardKasubag",
  ];
  const isStandaloneDashboard =
    standaloneDashboardNames.includes(childComponentName);

  if (isStandaloneDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-ink text-surface font-inter">
      <nav className="w-full border-b border-muted bg-ink text-surface shadow-sm shrink-0">
        <div className="mx-auto w-full max-w-[1800px] flex items-center justify-end gap-3 px-4 py-2 min-h-[44px]">
          {user ? <NotificationCenter /> : null}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 py-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
