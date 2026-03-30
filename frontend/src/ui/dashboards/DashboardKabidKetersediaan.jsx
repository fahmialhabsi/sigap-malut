// frontend/src/ui/dashboards/DashboardKabidKetersediaan.jsx
// P11: Dashboard Kepala Bidang Ketersediaan & Kerawanan Pangan
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import api from "../../utils/api";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import HeroKpiTilesKabid from "../../components/kabidKetersediaan/HeroKpiTilesKabid";
import EWSPanel from "../../components/kabidKetersediaan/EWSPanel";
import ApprovalQueueJF from "../../components/kabidKetersediaan/ApprovalQueueJF";
import TimSayaPanel from "../../components/kabidKetersediaan/TimSayaPanel";
import DikembalikanSekretarisPanel from "../../components/kabidKetersediaan/DikembalikanSekretarisPanel";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function normalizeUnit(user) {
  return user?.unit_kerja ? String(user.unit_kerja).toLowerCase() : "";
}

const ALLOWED = [
  "kepala_bidang_ketersediaan",
  "kepala_bidang",
  "kabid_ketersediaan",
  "super_admin",
  "kepala_dinas",
];

const SIDEBAR_MENU = [
  { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
  { id: "inbox", label: "Inbox Kepala Dinas", icon: "📥", badge: 1 },
  { id: "approval", label: "Approval Queue (JF)", icon: "📤", badge: 3 },
  { id: "dikembalikan", label: "Dikembalikan Sekretaris", icon: "↩️", badge: 1 },
  { id: "tim", label: "Tim Saya (JF)", icon: "👥" },
  { id: "assign", label: "Assign Tugas ke JF", icon: "📋" },
  { id: "skp-jf", label: "Kinerja Tim (SKP JF)", icon: "📊" },
  { divider: true, label: "DATA TEKNIS BIDANG" },
  { id: "k1", label: "K1. Ketersediaan & Produksi", icon: "📈" },
  { id: "k2", label: "K2. Peta Kerawanan Pangan", icon: "🗺️" },
  { id: "k3", label: "K3. Neraca Pangan Daerah", icon: "⚖️" },
  { id: "k4", label: "K4. Early Warning System", icon: "🚨" },
  { id: "k5", label: "K5. Program & Rencana Aksi", icon: "📋" },
  { id: "k6", label: "K6. Monev & SAKIP", icon: "📊" },
  { divider: true, label: "KOORDINASI" },
  { id: "laporan-sekretaris", label: "Laporan ke Sekretaris", icon: "📤" },
  { id: "koordinasi", label: "Koordinasi Lintas Bidang", icon: "🤝" },
  { id: "skp-saya", label: "SKP Saya (read)", icon: "📋" },
];

export default function DashboardKabidKetersediaan() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);

  const [activeMenu, setActiveMenu] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAllowed =
    !!user &&
    (ALLOWED.includes(roleName) ||
      (unit.includes("ketersediaan") && (roleName?.includes("kepala_bidang") || roleName?.includes("kabid"))));

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "KBK-001",
        status: "akses",
        detail: "Akses Dashboard Kepala Bidang Ketersediaan",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSummaryLoading(true);
    api
      .get("/api/kabid-ketersediaan/dashboard/summary")
      .then((res) => setSummary(res.data?.data ?? null))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [user]);

  if (!isAllowed) return <Navigate to="/" replace />;

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Hero KPI */}
            <HeroKpiTilesKabid summary={summary} loading={summaryLoading} />
            {/* Row A: EWS */}
            <EWSPanel />
            {/* Row B: Approval Queue + Tim */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApprovalQueueJF unitKerja="Bidang Ketersediaan" />
              <TimSayaPanel unitKerja="Bidang Ketersediaan" />
            </div>
            {/* Row C: Dikembalikan + Koordinasi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DikembalikanSekretarisPanel unitKerja="Bidang Ketersediaan" />
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-3">🤝 Koordinasi Lintas Bidang & Sektor</h2>
                <p className="text-sm text-gray-500">Koordinasi dengan Bidang Distribusi, Bidang Konsumsi, Dinas Pertanian, BPS, BPBD.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Bid. Distribusi", "Bid. Konsumsi", "Dinas Pertanian", "BPS", "BPBD"].map(k => (
                    <span key={k} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "approval":
        return <ApprovalQueueJF unitKerja="Bidang Ketersediaan" />;
      case "dikembalikan":
        return <DikembalikanSekretarisPanel unitKerja="Bidang Ketersediaan" />;
      case "tim":
      case "assign":
        return <TimSayaPanel unitKerja="Bidang Ketersediaan" />;
      case "k4":
        return <EWSPanel />;
      case "skp-jf":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">📊 Penilaian Kinerja JF (SKP)</h2>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <p className="font-semibold mb-1">⚠️ Pembatasan Akses PP 30/2019</p>
              <p>Kepala Bidang hanya dapat menilai JF 1 dan JF 2 (bawahan langsung).</p>
              <p className="mt-1 text-red-600 font-medium">❌ Nilai SKP Pelaksana di bawah JF DIBLOKIR TOTAL — Anda tidak dapat mengaksesnya.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">Modul ini sedang dalam pengembangan.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 flex flex-col transition-transform duration-200`}>
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="font-bold text-white text-sm">SIGAP-MALUT</p>
              <p className="text-xs text-slate-400">Kepala Bidang Ketersediaan</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {SIDEBAR_MENU.map((item, i) => {
            if (item.divider) {
              return (
                <div key={i} className="px-3 pt-3 pb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition ${activeMenu === item.id ? "bg-green-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <BukaEPelaraButton label="e-Pelara" targetPath="/" className="w-full !py-2 !text-xs" />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-900/95 to-slate-900/80 border-b border-green-700/50 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-white text-lg">Kepala Bidang Ketersediaan & Kerawanan Pangan</h1>
              <p className="text-green-200/70 text-xs">
                {user?.nama_lengkap || user?.name || "—"} · {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-200 text-xs font-medium">
              🔔 {(summary?.laporan_pending_review ?? 0) + 1} notif
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
