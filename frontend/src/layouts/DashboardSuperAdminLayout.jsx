import React, { useEffect } from "react";
import SidebarMenu from "../components/dashboard-superadmin/SidebarMenu";
import HeaderBar from "../components/dashboard-superadmin/HeaderBar";
import HeroRow from "../components/dashboard-superadmin/HeroRow";
import MissionControlPanels from "../components/dashboard-superadmin/MissionControlPanels";
import TimelinePanel from "../components/dashboard-superadmin/TimelinePanel";
import PerformancePanel from "../components/dashboard-superadmin/PerformancePanel";
import CacheQueuePanel from "../components/dashboard-superadmin/CacheQueuePanel";
import QuickActionPanel from "../components/dashboard-superadmin/QuickActionPanel";
import FooterBar from "../components/dashboard-superadmin/FooterBar";
import { roleIdToName } from "../utils/roleMap";
import useAuthStore from "../stores/authStore";

export default function DashboardSuperAdminLayout() {
  const user = useAuthStore((state) => state.user);
  const roleName = user ? roleIdToName[user.role_id] : null;

  useEffect(() => {
    if (
      !user ||
      !(
        roleName === "super_admin" ||
        user.unit_kerja === "Sekretariat Dinas" ||
        user.unit_kerja === "Bidang Distribusi" ||
        user.unit_kerja === "Bidang Konsumsi" ||
        user.unit_kerja === "Publik" ||
        user.unit_kerja === "UPTD" ||
        user.unit_kerja === "Kepala Dinas"
      )
    ) {
      window.location.href = "/landing";
    }
  }, [user, roleName]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 to-green-800 font-inter">
      {/* Sidebar */}
      <SidebarMenu />
      {/* Header */}
      <HeaderBar />
      {/* Main Content */}
      <main className="pl-20 pt-16 pb-8 pr-0 min-h-[calc(100vh-2rem)]">
        {/* Hero Row */}
        <HeroRow />
        {/* Mission Control Panels */}
        <MissionControlPanels />
        {/* Panel bawah: Timeline, Performance, Cache/Queue, QuickAction */}
        <div className="flex gap-6 px-8 mt-2">
          <TimelinePanel />
          <PerformancePanel />
          <CacheQueuePanel />
          <div className="flex flex-col justify-end">
            <QuickActionPanel />
          </div>
        </div>
      </main>
      {/* Footer */}
      <FooterBar />
    </div>
  );
}
