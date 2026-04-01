import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import { roleIdToName } from "../../utils/roleMap";
import sekretariatModules from "../../data/sekretariatModules";
import HeroKpiTilesSekretaris from "../../components/sekretaris/HeroKpiTilesSekretaris";
import ApprovalQueuePanel from "../../components/sekretaris/ApprovalQueuePanel";
import PengajuanKadinGatewayPanel from "../../components/sekretaris/PengajuanKadinGatewayPanel";
import InboxKadinPanel from "../../components/sekretaris/InboxKadinPanel";
import MonitorPerintahTimeline from "../../components/sekretaris/MonitorPerintahTimeline";
import ScorecardBawahanPanel from "../../components/sekretaris/ScorecardBawahanPanel";
import BypassAlertCenter from "../../components/sekretaris/BypassAlertCenter";
import KonsolidasiLaporanPanel from "../../components/sekretaris/KonsolidasiLaporanPanel";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
import api from "../../utils/api";
import { useSekretarisDashboard } from "../../hooks/useSekretarisDashboard";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

// Fallback bila API belum tersedia
const FALLBACK_KPI = {
  complianceAlurKoordinasi: null,
  zeroBypassViolations30d: null,
  totalTransaksi30d: null,
  avgApprovalTimeHours: null,
  konsistensiDataKomoditas: null,
  inflasiPangan: null,
};

const FALLBACK_ALERTS = [
  {
    type: "warning",
    message: "3 data keuangan belum valid",
    time: "2 jam lalu",
  },
  {
    type: "danger",
    message: "Bypass alur ditemukan di Bidang Konsumsi",
    time: "1 hari lalu",
  },
  { type: "info", message: "1 dokumen menunggu approval", time: "Baru saja" },
];

const tableData = [
  {
    bidang: "Kepegawaian",
    status: "Valid",
    lastUpdate: "2026-02-22",
    penanggungJawab: "Kasubag Umum",
  },
  {
    bidang: "Keuangan",
    status: "Perlu Validasi",
    lastUpdate: "2026-02-21",
    penanggungJawab: "Bendahara",
  },
  {
    bidang: "Aset",
    status: "Valid",
    lastUpdate: "2026-02-20",
    penanggungJawab: "Kasubag Aset",
  },
  {
    bidang: "Distribusi",
    status: "Revisi",
    lastUpdate: "2026-02-19",
    penanggungJawab: "Kabid Distribusi",
  },
];

function PanelBox({ title, accent = "emerald", children, className = "" }) {
  const accentMap = {
    emerald: "text-emerald-700",
    blue: "text-sky-700",
    amber: "text-amber-700",
    red: "text-red-700",
  };
  const titleColor = accentMap[accent] || accentMap.emerald;

  return (
    <section
      className={`rounded-xl p-5 flex flex-col border border-gray-200 shadow-sm bg-white flex-1 ${className}`}
    >
      <h2
        className={`font-bold mb-3 text-base md:text-lg flex items-center gap-2 ${titleColor}`}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function ComplianceAlertPanel({ alertData }) {
  return (
    <PanelBox title="Compliance & Alert" accent="amber">
      <ul className="space-y-2">
        {alertData.map((alert, idx) => (
          <li
            key={idx}
            className={`p-2 rounded ${
              alert.type === "danger"
                ? "bg-red-50 text-red-800 border border-red-100"
                : alert.type === "warning"
                  ? "bg-amber-50 text-amber-800 border border-amber-100"
                  : "bg-blue-50 text-blue-800 border border-blue-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{alert.message}</span>
              <span className="text-xs text-slate-200/75">{alert.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </PanelBox>
  );
}

function DataFlowChart() {
  return (
    <PanelBox title="Alur Data & Koordinasi" accent="blue">
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center gap-4">
          {[
            {
              label: "Pelaksana",
              color: "bg-slate-700 text-slate-100",
              desc: "Input Data",
            },
            {
              label: "Fungsional",
              color: "bg-slate-700 text-slate-100",
              desc: "Validasi Teknis",
            },
            {
              label: "Bidang/UPTD",
              color: "bg-slate-700 text-slate-100",
              desc: "Review",
            },
            {
              label: "Sekretariat",
              color: "bg-slate-700 text-white",
              desc: "Integrasi & Distribusi",
            },
            {
              label: "Kepala Dinas",
              color: "bg-slate-700 text-white",
              desc: "Keputusan",
            },
          ].map((node, idx, arr) => (
            <React.Fragment key={node.label}>
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full px-4 py-2 font-semibold ${node.color}`}
                >
                  {node.label}
                </div>
                <span className="text-xs mt-1">{node.desc}</span>
              </div>
              {idx < arr.length - 1 && <span className="mx-2 text-xl">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </PanelBox>
  );
}

function LintasBidangTable({ tableData }) {
  return (
    <PanelBox title="Data Lintas Bidang" accent="emerald">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="px-4 py-2 text-left">Bidang</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Update Terakhir</th>
              <th className="px-4 py-2 text-left">Penanggung Jawab</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2">{row.bidang}</td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    row.status === "Valid"
                      ? "text-emerald-600"
                      : row.status === "Revisi"
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {row.status}
                </td>
                <td className="px-4 py-2">{row.lastUpdate}</td>
                <td className="px-4 py-2">{row.penanggungJawab}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelBox>
  );
}

function QuickActionBar() {
  return (
    <div className="flex flex-wrap gap-3 justify-end">
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-700 border border-blue-600/80 text-xs md:text-sm">
        Upload Dokumen
      </button>
      <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 border border-emerald-600/80 text-xs md:text-sm">
        Generate Laporan
      </button>
      <button className="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-amber-600 border border-amber-500/80 text-xs md:text-sm">
        Broadcast
      </button>
      <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-800/80 text-xs md:text-sm">
        Export Data
      </button>
    </div>
  );
}

function AIFeedbackPanel() {
  return (
    <PanelBox title="AI & Feedback" accent="blue">
      <div className="mb-2 text-sm text-slate-700">
        Rekomendasi AI: Tidak ada bottleneck terdeteksi. Semua alur berjalan
        normal.
      </div>
      <div className="mb-2">
        <label className="block text-xs mb-1 text-slate-300/90">
          Laporan Masalah/Feedback:
        </label>
        <textarea
          className="w-full border border-slate-300 bg-white rounded p-2 text-sm text-slate-800"
          rows={2}
          placeholder="Tulis feedback atau masalah di sini..."
        />
        <button className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700">
          Kirim
        </button>
      </div>
    </PanelBox>
  );
}

function OpenDataPortal() {
  return (
    <PanelBox title="Open Data Portal" accent="amber">
      <div className="mb-2 text-sm text-slate-700">
        Ringkasan data publik tersedia untuk diunduh:
      </div>
      <div className="flex gap-2">
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-700/80 text-xs md:text-sm">
          Download Excel
        </button>
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-700/80 text-xs md:text-sm">
          Download PDF
        </button>
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-900 border border-slate-700/80 text-xs md:text-sm">
          Download CSV
        </button>
      </div>
    </PanelBox>
  );
}

export default function DashboardSekretariat() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const [activeMenu, setActiveMenu] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { inboxCount, approvalCount, bypassCount } = useSekretarisDashboard();
  const [kpi, setKpi] = useState(FALLBACK_KPI);
  const [alertData, setAlertData] = useState(FALLBACK_ALERTS);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [renstraQueue, setRenstraQueue] = useState([]);
  const [renstraLoading, setRenstraLoading] = useState(true);
  const [notifPesan, setNotifPesan] = useState("");
  const [notifSending, setNotifSending] = useState(false);
  const [notifResult, setNotifResult] = useState(null);
  const [cascadeData, setCascadeData] = useState(null);
  const [cascadeLoading, setCascadeLoading] = useState(false);

  const fetchKPIs = useCallback(async () => {
    setKpiLoading(true);
    try {
      const res = await api.get("/dashboard/sekretaris/summary");
      const d = res.data?.data;
      if (d) {
        setKpi(d);
        // Generate alert items from live KPI data
        const liveAlerts = [];
        if (d.zeroBypassViolations30d > 0) {
          liveAlerts.push({
            type: "danger",
            message: `${d.zeroBypassViolations30d} bypass alur terdeteksi dalam 30 hari`,
            time: "Data real-time",
          });
        }
        if (
          d.konsistensiDataKomoditas !== null &&
          d.konsistensiDataKomoditas < 80
        ) {
          liveAlerts.push({
            type: "warning",
            message: `Konsistensi komoditas ${d.konsistensiDataKomoditas}% — di bawah target 80%`,
            time: "Bulan ini",
          });
        }
        if (d.inflasiPangan !== null && d.inflasiPangan > 3) {
          liveAlerts.push({
            type: "danger",
            message: `Inflasi pangan ${d.inflasiPangan}% — melampaui batas 3%`,
            time: "Bulan ini",
          });
        }
        if (liveAlerts.length > 0) setAlertData(liveAlerts);
      }
    } catch {
      // silently fallback — dummy data already in state
    } finally {
      setKpiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Fetch perencanaan queue dari e-Pelara
  useEffect(() => {
    setRenstraLoading(true);
    api
      .get("/api/epelara/renstra-opd", { params: { limit: 10 } })
      .then((res) => {
        const d = res.data;
        setRenstraQueue(Array.isArray(d) ? d : d?.data || []);
      })
      .catch(() => setRenstraQueue([]))
      .finally(() => setRenstraLoading(false));
  }, []);

  // Cascading check dari e-Pelara
  useEffect(() => {
    if (!user) return;
    setCascadeLoading(true);
    api
      .get("/api/epelara/cascading")
      .then((res) => setCascadeData(res.data ?? null))
      .catch(() => setCascadeData(null))
      .finally(() => setCascadeLoading(false));
  }, [user]);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "SA01",
        status: "akses",
        detail: "Akses modul Monitoring 50 indikator",
      });
    }
  }, [user]);

  const unitKerja = user?.unit_kerja
    ? String(user.unit_kerja).toLowerCase()
    : "";
  const isAllowed =
    !!user &&
    (roleName === "sekretaris" ||
      roleName === "super_admin" ||
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      unitKerja.includes("sekretariat"));

  if (!isAllowed) return <Navigate to="/" replace />;

  const moduleCards = [...sekretariatModules]
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

  const SIDEBAR_MENU = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    {
      id: "inbox",
      label: "Inbox Kepala Dinas",
      icon: "📥",
      badge: inboxCount || null,
    },
    {
      id: "approval",
      label: "Approval Queue",
      icon: "✅",
      badge: approvalCount || null,
    },
    {
      id: "gateway_kadin",
      label: "Gateway Ka.Dinas",
      icon: "🛡️",
      badge: null,
    },
    { id: "timeline", label: "Monitor Perintah", icon: "📋", badge: null },
    {
      id: "scorecard",
      label: "Kinerja / SKP Bawahan",
      icon: "📊",
      badge: null,
    },
    {
      id: "bypass",
      label: "Bypass Alert Center",
      icon: "🔎",
      badge: bypassCount || null,
    },
    {
      id: "konsolidasi",
      label: "Konsolidasi Laporan",
      icon: "📑",
      badge: null,
    },
    { divider: true, label: "MODUL SEKRETARIAT" },
    ...moduleCards.slice(0, 12).map((m) => ({
      id: `mod-${m.id}`,
      label: m.name || m.id,
      icon: "🧩",
    })),
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            <HeroKpiTilesSekretaris />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ApprovalQueuePanel />
                <PengajuanKadinGatewayPanel />
              </div>
              <div className="space-y-6">
                <ComplianceAlertPanel alertData={alertData} />
                <PanelBox title="Aksi Cepat" accent="emerald">
                  <QuickActionBar />
                </PanelBox>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataFlowChart />
              <LintasBidangTable tableData={tableData} />
            </div>
          </div>
        );
      case "inbox":
        return <InboxKadinPanel />;
      case "approval":
        return <ApprovalQueuePanel />;
      case "timeline":
        return <MonitorPerintahTimeline />;
      case "scorecard":
        return <ScorecardBawahanPanel />;
      case "bypass":
        return <BypassAlertCenter />;
      case "konsolidasi":
        return <KonsolidasiLaporanPanel />;
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
              <p className="text-xs text-slate-400">Sekretaris</p>
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
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
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
        <header className="bg-gradient-to-r from-emerald-900/95 to-slate-900/80 border-b border-emerald-700/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-white text-lg">
                Sekretaris — Hub Koordinasi
              </h1>
              <p className="text-emerald-200/70 text-xs">
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
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
