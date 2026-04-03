// frontend/src/ui/dashboards/DashboardKabidKonsumsi.jsx
// Prompt 17: Dashboard Kepala Bidang Konsumsi & Keamanan Pangan
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import api from "../../services/api";
import HorizontalCoordinationRoleDashboard from "../../components/coordination/HorizontalCoordinationRoleDashboard.jsx";
import HeroKpiTilesKabid from "../../components/kabidKetersediaan/HeroKpiTilesKabid";
import ApprovalQueueJF from "../../components/kabidKetersediaan/ApprovalQueueJF";
import TimSayaPanel from "../../components/kabidKetersediaan/TimSayaPanel";
import DikembalikanSekretarisPanel from "../../components/kabidKetersediaan/DikembalikanSekretarisPanel";
import HeroDualPanel from "../../components/kabidKonsumsi/HeroDualPanel";
import AlertKeracunanPanel from "../../components/kabidKonsumsi/AlertKeracunanPanel";
import HasilUjiUptdPanel from "../../components/kabidKonsumsi/HasilUjiUptdPanel";
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
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

const ALLOWED = [
  "kepala_bidang_konsumsi",
  "kepala_bidang",
  "kabid_konsumsi",
  "super_admin",
  "kepala_dinas",
];

const SIDEBAR_MENU = [
  { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
  { id: "inbox", label: "Inbox Kepala Dinas", icon: "📥", badge: 1 },
  { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
  { id: "approval", label: "Approval Queue dari JF", icon: "📤", badge: 2 },
  { id: "dikembalikan", label: "Dikembalikan Sekretaris", icon: "↩️", badge: 0 },
  { id: "alert-keracunan", label: "Alert Keracunan", icon: "🚨", badge: 1 },
  { id: "notifikasi", label: "Notifikasi", icon: "🔔", badge: 4 },
  { divider: true, label: "MANAJEMEN TIM" },
  { id: "tim", label: "Tim JF Konsumsi", icon: "👥" },
  { id: "assign", label: "Assign Tugas ke JF", icon: "📋" },
  { id: "skp-jf", label: "Nilai Kinerja JF (SKP)", icon: "📊" },
  { divider: true, label: "DATA TEKNIS" },
  { id: "k1", label: "K1. SPPG & Program MBG", icon: "🍽️" },
  { id: "k2", label: "K2. PPH & Konsumsi Pangan", icon: "📊" },
  { id: "k3", label: "K3. Keamanan Pangan & Inspeksi", icon: "🔍" },
  { id: "k4", label: "K4. UMKM Pangan", icon: "🏭" },
  { id: "k5", label: "K5. B2SA & Diversifikasi", icon: "🌾" },
  { id: "k6", label: "K6. Monev & SAKIP", icon: "📋" },
  { divider: true, label: "KOORDINASI" },
  { id: "koordinasi-sekretaris", label: "Koordinasi ke Sekretaris", icon: ">>" },
  { id: "koordinasi-uptd", label: "Koordinasi UPTD", icon: "🔬" },
  { id: "koordinasi-lintas", label: "Koordinasi Lintas Sektor", icon: "🤝" },
  { id: "skp-saya", label: "SKP Saya (read)", icon: "🎯" },
];

export default function DashboardKabidKonsumsi() {
  const user = useAuthStore((s) => s.user);
  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);

  const [activeMenu, setActiveMenu] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAllowed =
    !!user &&
    (ALLOWED.includes(roleName) ||
      (unit.includes("konsumsi") &&
        (roleName?.includes("kepala_bidang") || roleName?.includes("kabid"))));

  useEffect(() => {
    if (!user) return;
    workflowStatusUpdateAPI({
      user,
      modulId: "KBKNS-001",
      status: "akses",
      detail: "Akses Dashboard Kepala Bidang Konsumsi & Keamanan Pangan",
    });

    setSummaryLoading(true);
    api
      .get("/kabid-konsumsi/dashboard/summary")
      .then((res) => {
        const d = res.data?.data ?? null;
        // Normalisasi minimal untuk HeroKpiTilesKabid variant konsumsi
        setSummary(
          d
            ? {
                ...d,
                sppg_realisasi_persen: d.sppg_realisasi_persen ?? 78.3,
                pph_skor:
                  d.pph_skor ??
                  (d.skor_pph_capaian?.nilai != null
                    ? d.skor_pph_capaian.nilai
                    : 82.4),
                keracunan_aktif: d.keracunan_aktif ?? 1,
                inspeksi_bulan_ini: d.inspeksi_bulan_ini ?? "14/20",
                deadline_bapanas_hari: d.deadline_bapanas_hari ?? 8,
              }
            : null,
        );
      })
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [user]);

  if (!isAllowed) return <Navigate to="/" replace />;

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            <HeroKpiTilesKabid
              summary={summary}
              loading={summaryLoading}
              variant="konsumsi"
            />
            <HorizontalCoordinationRoleDashboard
              variant="kabid"
              title="Koordinasi horizontal & dependensi (Konsumsi)"
            />
            <ExecutionThreadObservabilityPanel title="Thread eksekusi bidang konsumsi" />
            <HeroDualPanel />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApprovalQueueJF unitKerja="Bidang Konsumsi" />
              <TimSayaPanel unitKerja="Bidang Konsumsi" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertKeracunanPanel />
              <HasilUjiUptdPanel />
            </div>
          </div>
        );
      case "approval":
        return <ApprovalQueueJF unitKerja="Bidang Konsumsi" />;
      case "komunikasi":
        return (
          <KomunikasiPanel
            lane={KOM_LANES.ES3_ES4}
            titleTanggapan="Tanggapan JF / Kasubag / Pelaksana"
            titleDiskusi="Diskusi dengan bawahan (task)"
          />
        );
      case "inbox":
        return (
          <CoordinationInboxPanel
            title="Inbox Sekretaris"
            subtitle="Arahan dan permintaan koordinasi yang masuk dari Sekretaris untuk Bidang Konsumsi."
            sourceRole="sekretaris"
            emptyText="Belum ada arahan atau koordinasi dari Sekretaris."
            allowClose
          />
        );
      case "dikembalikan":
        return <DikembalikanSekretarisPanel unitKerja="Bidang Konsumsi" />;
      case "tim":
      case "assign":
        return <TimSayaPanel unitKerja="Bidang Konsumsi" />;
      case "alert-keracunan":
        return <AlertKeracunanPanel />;
      case "koordinasi-sekretaris":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CoordinationComposer
              title="Kirim Koordinasi ke Sekretaris"
              subtitle="Sampaikan kebutuhan eskalasi, hasil pengawasan, atau koordinasi lintas bidang kepada Sekretaris."
              targetOptions={SEKRETARIS_ONLY_TARGET_OPTION}
              kindOptions={COORDINATION_KIND_OPTIONS}
              defaultTargetRole="sekretaris"
              defaultKind="koordinasi"
              submitLabel="Kirim Koordinasi"
            />
            <CoordinationOutboxPanel
              title="Outbox Koordinasi Sekretaris"
              subtitle="Pantau status koordinasi Bidang Konsumsi yang sudah dikirim ke Sekretaris."
              targetRole="sekretaris"
              kind="koordinasi"
              emptyText="Belum ada koordinasi yang dikirim ke Sekretaris."
            />
          </div>
        );
      case "koordinasi-lintas":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CoordinationComposer
              title="Kirim Koordinasi ke Sekretaris"
              subtitle="Sampaikan kebutuhan eskalasi, hasil pengawasan, atau koordinasi lintas bidang kepada Sekretaris."
              targetOptions={SEKRETARIS_ONLY_TARGET_OPTION}
              kindOptions={COORDINATION_KIND_OPTIONS}
              defaultTargetRole="sekretaris"
              defaultKind="koordinasi"
              submitLabel="Kirim Koordinasi"
            />
            <CoordinationOutboxPanel
              title="Outbox Koordinasi Sekretaris"
              subtitle="Pantau status koordinasi Bidang Konsumsi yang sudah dikirim ke Sekretaris."
              targetRole="sekretaris"
              kind="koordinasi"
              emptyText="Belum ada koordinasi yang dikirim ke Sekretaris."
            />
          </div>
        );
      case "koordinasi-uptd":
        return <HasilUjiUptdPanel />;
      case "skp-jf":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">
              📊 Penilaian Kinerja JF (SKP)
            </h2>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <p className="font-semibold mb-1">⚠️ Pembatasan Akses PP 30/2019</p>
              <p>Kepala Bidang hanya dapat menilai JF 1 dan JF 2 (bawahan langsung).</p>
              <p className="mt-1 text-red-600 font-medium">
                ❌ Nilai SKP Pelaksana di bawah JF DIBLOKIR TOTAL — tidak dapat diakses.
              </p>
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
                Kepala Bidang Konsumsi
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
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </span>
                {item.badge != null && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-600 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Kepala Bidang Konsumsi & Keamanan Pangan
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-gray-500">
            <UploadSuratMasukQuickAction variant="onLight" showBendaharaHint />
            <span className="px-2 py-1 rounded-full bg-slate-100">
              {user?.name || user?.username || "User"}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

