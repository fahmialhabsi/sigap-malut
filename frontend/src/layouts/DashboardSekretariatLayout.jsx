import React, { useEffect } from "react";
import SidebarMenuSekretariat from "../components/dashboard-sekretariat/SidebarMenuSekretariat";
import HeaderBarSekretariat from "../components/dashboard-sekretariat/HeaderBarSekretariat";
import HeroRowSekretariat from "../components/dashboard-sekretariat/HeroRowSekretariat";
import TabelSuratPanel from "../components/dashboard-sekretariat/TabelSuratPanel";
import AgendaNotulensiPanel from "../components/dashboard-sekretariat/AgendaNotulensiPanel";
import QuickActionPanelSekretariat from "../components/dashboard-sekretariat/QuickActionPanelSekretariat";
import KepegKeuAsetPanel from "../components/dashboard-sekretariat/KepegKeuAsetPanel";
import FooterBarSekretariat from "../components/dashboard-sekretariat/FooterBarSekretariat";
import { roleIdToName } from "../utils/roleMap";
import useAuthStore from "../stores/authStore";

export default function DashboardSekretariatLayout() {
  const user = useAuthStore((state) => state.user);
  const roleName = user ? roleIdToName[user.role_id] : null;

  useEffect(() => {
    if (
      !user ||
      !(
        roleName === "sekretaris" ||
        roleName === "super_admin" ||
        user.unit_kerja === "Sekretariat Dinas"
      )
    ) {
      window.location.href = "/landing";
    }
  }, [user, roleName]);

  return (
    <div className="relative min-h-screen bg-[#10182A] font-inter">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-[72px] bg-[#06A657] z-30">
        <SidebarMenuSekretariat />
      </div>
      {/* Header */}
      <div className="fixed top-0 left-[72px] right-0 h-[60px] bg-[#07723A] z-20">
        <HeaderBarSekretariat />
      </div>
      {/* Main Content */}
      <main className="pt-[60px] pl-[72px] pb-12 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-[1128px] flex flex-col gap-8">
          <HeroRowSekretariat />
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <div className="flex-1 flex flex-col gap-8">
              <TabelSuratPanel />
              <KepegKeuAsetPanel />
            </div>
            <div className="flex flex-col gap-8 w-full lg:w-[370px]">
              <AgendaNotulensiPanel />
              <QuickActionPanelSekretariat />
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <FooterBarSekretariat />
    </div>
  );
}
