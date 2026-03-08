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

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

export default function DashboardSuperAdminLayout() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const roleName = normalizeRoleName(user);

  useEffect(() => {
    if (!isInitialized) return;
    const allowed = roleName === "super_admin";
    if (!user || !allowed) window.location.href = "/";
  }, [user, roleName, isInitialized]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 to-green-800 font-inter">
      <SidebarMenu />
      <HeaderBar />
      <main className="pl-20 pt-16 pb-8 pr-0 min-h-[calc(100vh-2rem)]">
        <HeroRow />
        <MissionControlPanels />
        <div className="flex gap-6 px-8 mt-2">
          <TimelinePanel />
          <PerformancePanel />
          <CacheQueuePanel />
          <div className="flex flex-col justify-end">
            <QuickActionPanel />
          </div>
        </div>
      </main>
      <FooterBar />
    </div>
  );
}
