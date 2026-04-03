// frontend/src/ui/dashboards/DashboardUPTD.jsx
// Prompt 20: Dashboard Kepala UPTD — pola seperti Kabid (P11/P17)
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
import HeroLabDashboardPanel from "../../components/uptd/HeroLabDashboardPanel";
import api from "../../services/api";
import HorizontalCoordinationRoleDashboard from "../../components/coordination/HorizontalCoordinationRoleDashboard.jsx";
import CoordinationComposer from "../../components/coordination/CoordinationComposer";
import CoordinationInboxPanel from "../../components/coordination/CoordinationInboxPanel";
import CoordinationOutboxPanel from "../../components/coordination/CoordinationOutboxPanel";
import {
  COORDINATION_KIND_OPTIONS,
  SEKRETARIS_ONLY_TARGET_OPTION,
} from "../../components/coordination/coordinationOptions";
import KomunikasiPanel, {
  LANES as KOM_LANES,
} from "../../components/panel/KomunikasiPanel.jsx";
import ExecutionThreadObservabilityPanel from "../../components/execution/ExecutionThreadObservabilityPanel.jsx";

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

const ALLOWED = ["kepala_uptd", "super_admin", "kepala_dinas"];

const SIDEBAR_MENU = [
  { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
  { id: "inbox", label: "Inbox Kepala Dinas", icon: "📥", badge: 0 },
  { id: "approval", label: "Approval Queue (3 TAB)", icon: "📤", badge: 0 },
  { id: "dikembalikan", label: "Dikembalikan Sekretaris", icon: "↩️", badge: 0 },
  { id: "alert-sertifikasi", label: "Alert Sertifikasi Expiry", icon: "🔔", badge: 0 },
  { id: "alert-alat", label: "Alert Alat Lab", icon: "🔔", badge: 0 },
  { divider: true, label: "MANAJEMEN TIM" },
  { id: "tim", label: "Tim Saya (4 bawahan)", icon: "👥" },
  { id: "assign", label: "Assign Tugas", icon: "📋" },
  { id: "skp", label: "Nilai Kinerja (SKP)", icon: "📊" },
  { divider: true, label: "MODUL LAB & TEKNIS" },
  { id: "u1", label: "U1. Sample Queue & Uji Lab", icon: "🔬" },
  { id: "u2", label: "U2. Sertifikasi", icon: "🏆" },
  { id: "u3", label: "U3. Audit Mutu & Inspeksi", icon: "🔍" },
  { id: "u6", label: "U6. Pelaporan & Monev", icon: "📊" },
  { divider: true, label: "KOORDINASI" },
  { id: "laporan-sek", label: "Laporan ke Sekretaris", icon: "📤" },
  { id: "skp-saya", label: "SKP Saya (read)", icon: "🎯" },
];

export default function DashboardUPTD() {
  const user = useAuthStore((s) => s.user);
  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);

  const [activeMenu, setActiveMenu] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    workflowStatusUpdateAPI({
      user,
      modulId: "UPTD-001",
      status: "akses",
      detail: "Akses Dashboard Kepala UPTD",
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSummaryLoading(true);
    api
      .get("/uptd/dashboard/summary")
      .then((res) => setSummary(res.data?.data ?? null))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [user]);

  const isAllowed =
    !!user &&
    (ALLOWED.includes(roleName) ||
      (unit.includes("uptd") &&
        (roleName === "kepala_uptd" || roleName?.includes("kepala"))));
  if (!isAllowed) return <Navigate to="/" replace />;

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            <HorizontalCoordinationRoleDashboard
              variant="uptd"
              title="Koordinasi & permintaan lapangan (UPTD)"
            />
            <ExecutionThreadObservabilityPanel title="Thread eksekusi UPTD" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Uji Lab (Total)",
                  value: summaryLoading ? "…" : summary?.uji_total ?? 0,
                  color: "blue",
                },
                {
                  label: "Sertifikasi (Total)",
                  value: summaryLoading ? "…" : summary?.sertifikasi_total ?? 0,
                  color: "amber",
                },
                { label: "Approval Pending", value: "—", color: "indigo" },
                { label: "Alert Aktif", value: "—", color: "red" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpi.color}-50 border-${kpi.color}-200`}
                >
                  <div className={`text-3xl font-bold text-${kpi.color}-700`}>
                    {kpi.value}
                  </div>
                  <div className={`text-xs font-medium text-${kpi.color}-600`}>
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>

            <HeroLabDashboardPanel />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-2">
                  📤 Approval Queue — 3 Tab
                </h2>
                <p className="text-sm text-gray-500">
                  Data per tab akan dihubungkan saat prompt 21/22/23 (Kasubag TU
                  / Kasi Mutu / Kasi Teknis).
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-2">
                  👥 Tim Saya (4 bawahan)
                </h2>
                <p className="text-sm text-gray-500">
                  Kasubag TU, Kasi Mutu, Kasi Teknis, JF UPTD (tanpa pelaksana).
                </p>
              </div>
            </div>
          </div>
        );
      case "inbox":
        return (
          <CoordinationInboxPanel
            title="Inbox Sekretaris"
            subtitle="Perintah dan koordinasi dari Sekretaris untuk Kepala UPTD Balai Pengawasan."
            sourceRole="sekretaris"
            emptyText="Belum ada arahan atau koordinasi dari Sekretaris."
            allowClose
          />
        );
      case "komunikasi":
        return (
          <KomunikasiPanel
            lane={KOM_LANES.ES3_ES4}
            titleTanggapan="Tanggapan Kasubag / Kasi / JF UPTD"
            titleDiskusi="Diskusi dengan bawahan (task)"
          />
        );
      case "laporan-sek":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CoordinationComposer
              title="Kirim Koordinasi ke Sekretaris"
              subtitle="Gunakan kanal ini untuk menyampaikan hasil pengawasan, kebutuhan dukungan, atau tindak lanjut laboratorium kepada Sekretaris."
              targetOptions={SEKRETARIS_ONLY_TARGET_OPTION}
              kindOptions={COORDINATION_KIND_OPTIONS}
              defaultTargetRole="sekretaris"
              defaultKind="koordinasi"
              submitLabel="Kirim Koordinasi"
            />
            <CoordinationOutboxPanel
              title="Outbox Koordinasi Sekretaris"
              subtitle="Pantau status koordinasi UPTD yang sudah dikirim ke Sekretaris."
              targetRole="sekretaris"
              kind="koordinasi"
              emptyText="Belum ada koordinasi yang dikirim ke Sekretaris."
            />
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">
              Modul ini sedang dalam pengembangan.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 flex flex-col transition-transform duration-200`}
      >
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="font-bold text-white text-sm">SIGAP-MALUT</p>
              <p className="text-xs text-slate-400">
                Kepala UPTD — Balai Pengawasan
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {SIDEBAR_MENU.map((item, i) => {
            if (item.divider) {
              return (
                <div key={i} className="px-3 pt-3 pb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  activeMenu === item.id
                    ? "bg-green-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge != null && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-2">
          <BukaEPelaraButton
            label="e-Pelara"
            targetPath="/"
            className="w-full !py-2 !text-xs"
          />
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-green-900/95 to-slate-900/80 border-b border-green-700/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-white text-lg">Kepala UPTD</h1>
              <p className="text-green-200/70 text-xs">
                {user?.nama_lengkap || user?.name || "—"} ·{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <UploadSuratMasukQuickAction showBendaharaHint />
            <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-200 text-xs font-medium">
              🔔 {summaryLoading ? "…" : 0} notif
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}

