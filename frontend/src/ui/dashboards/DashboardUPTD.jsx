import React from "react";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import { Navigate } from "react-router-dom";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import { roleIdToName } from "../../utils/roleMap";
import DashboardUPTDLayout from "../../layouts/DashboardUPTDLayout";
import uptdModules from "../../data/uptdModules";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function HeroCard({ title, value, accent = "blue" }) {
  const gradients = {
    blue: "from-blue-900/80 to-blue-700/60",
    cyan: "from-cyan-900/80 to-cyan-700/60",
    amber: "from-amber-900/80 to-amber-700/60",
    red: "from-red-900/80 to-red-700/60",
  };

  return (
    <div
      className={`bg-gradient-to-t ${gradients[accent]} border-2 border-blue-700/40 rounded-2xl px-4 py-3 min-h-[86px] flex flex-col justify-between shadow-lg hover:scale-105 transition`}
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="text-4xl font-bold text-white tracking-tight">
        {value}
      </div>
      <div className="text-xs font-medium text-blue-200/90 uppercase tracking-wide">
        {title}
      </div>
    </div>
  );
}

function PanelBox({ title, children, customClass = "" }) {
  return (
    <div
      className={`bg-blue-900/80 border-2 border-blue-700/50 rounded-2xl p-7 ${customClass} shadow-xl`}
      style={{ backdropFilter: "blur(17px)" }}
    >
      <h2 className="font-bold text-blue-200 mb-5 text-xl flex items-center gap-2">
        <span className="text-2xl">📦</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function DashboardUPTD() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  React.useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "UPT-TKN",
        status: "akses",
        detail: "Akses modul layanan teknis UPTD",
      });
    }
  }, [user]);

  const unitKerja = user?.unit_kerja
    ? String(user.unit_kerja).toLowerCase()
    : "";
  const isAllowed =
    !!user &&
    (roleName === "kepala_uptd" ||
      roleName === "super_admin" ||
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      unitKerja.includes("uptd"));

  if (!isAllowed) return <Navigate to="/" replace />;

  const moduleCards = [...uptdModules]
    .filter(
      (row) =>
        row?.is_active === undefined ||
        row?.is_active === null ||
        row?.is_active === true ||
        String(row?.is_active).toLowerCase() === "true" ||
        String(row?.is_active) === "1",
    )
    .sort((a, b) => {
      const orderA = Number(a?.menu_order ?? a?.menuOrder ?? 9999);
      const orderB = Number(b?.menu_order ?? b?.menuOrder ?? 9999);
      return orderA - orderB;
    });

  return (
    <DashboardUPTDLayout modules={moduleCards}>
      <div className="w-full px-6 md:px-12 py-8 space-y-8">
        {/* Hero Section */}
        <div
          className="bg-gradient-to-r from-blue-900/95 to-slate-900/80 border-2 border-blue-700/50 rounded-2xl p-8 shadow-2xl"
          style={{ backdropFilter: "blur(15px)" }}
        >
          <h1 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
            <span className="text-4xl">🏛️</span>
            Dashboard UPTD
          </h1>
          <p className="text-blue-200/80 text-base leading-relaxed">
            Ringkasan KPI dan modul UPTD Balai Pengawasan Mutu dan Keamanan
            Pangan
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <HeroCard title="Indikator Monitoring" value="59" accent="blue" />
          <HeroCard title="Compliance Alur" value="99%" accent="cyan" />
          <HeroCard title="Bypass Terdeteksi" value="0" accent="amber" />
          <HeroCard title="Data Valid" value="98%" accent="blue" />
        </div>

        {/* Module Cards Panel */}
        <PanelBox title="Modul UPTD">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleCards.map((modul) => (
              <div
                id={`uptd-${String(modul.id).toLowerCase()}`}
                key={modul.id}
                className="bg-gradient-to-br from-blue-800/70 to-blue-900/60 border-2 border-blue-600/40 rounded-xl p-5 flex flex-col gap-3 shadow-lg hover:scale-105 transition"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <div className="font-bold text-lg text-blue-100">
                  {modul.name}
                </div>
                <div className="text-xs text-blue-300/80 font-mono">
                  ID: {modul.id}
                </div>
                <div className="mt-2">
                  <FieldMappingPreview modulId={modul.id} />
                </div>
              </div>
            ))}
          </div>
        </PanelBox>
      </div>
    </DashboardUPTDLayout>
  );
}
