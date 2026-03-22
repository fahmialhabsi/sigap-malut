import React, { useState, useEffect, useCallback } from "react";
import useAuthStore from "../../stores/authStore";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import { Navigate } from "react-router-dom";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import { roleIdToName } from "../../utils/roleMap";
import DashboardSekretariatLayout from "../../layouts/DashboardSekretariatLayout";
import sekretariatModules from "../../data/sekretariatModules";
import api from "../../utils/api";

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

function HeroCard({ title, value, info, accent = "emerald" }) {
  const accentMap = {
    emerald: {
      bg: "bg-gradient-to-t from-black/95 to-slate-900/85",
      border: "border-slate-700",
      title: "text-slate-200",
      value: "text-slate-100",
    },
    blue: {
      bg: "bg-gradient-to-t from-slate-950/90 to-blue-950/70",
      border: "border-blue-700",
      title: "text-blue-200",
      value: "text-blue-100",
    },
    amber: {
      bg: "bg-gradient-to-t from-slate-950/90 to-amber-950/70",
      border: "border-amber-700",
      title: "text-amber-200",
      value: "text-amber-100",
    },
    red: {
      bg: "bg-gradient-to-t from-slate-950/90 to-red-950/70",
      border: "border-red-700",
      title: "text-red-200",
      value: "text-red-100",
    },
  };

  const theme = accentMap[accent] || accentMap.emerald;

  return (
    <div
      className={`rounded-2xl border-2 px-4 py-3 min-h-[86px] flex flex-col justify-between shadow-lg ${theme.bg} ${theme.border}`}
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className={`text-2xl font-extrabold tracking-wide ${theme.value}`}>
        {value}
      </div>
      <div>
        <div className={`text-xs font-semibold ${theme.title}`}>{title}</div>
        <div className="text-[11px] text-slate-200/80 mt-1">{info}</div>
      </div>
    </div>
  );
}

function PanelBox({ title, accent = "emerald", children, className = "" }) {
  const accentMap = {
    emerald: "text-slate-200",
    blue: "text-blue-200",
    amber: "text-amber-200",
    red: "text-red-200",
  };
  const titleColor = accentMap[accent] || accentMap.emerald;

  return (
    <section
      className={`rounded-2xl p-7 flex flex-col border border-slate-800/85 shadow-md flex-1 bg-slate-950/88 ${className}`}
      style={{
        backdropFilter: "blur(17px)",
        WebkitBackdropFilter: "blur(17px)",
      }}
    >
      <h2
        className={`font-bold mb-4 text-xl flex items-center gap-2 ${titleColor}`}
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
                ? "bg-red-950/60 text-red-100"
                : alert.type === "warning"
                  ? "bg-amber-950/60 text-amber-100"
                  : "bg-blue-950/60 text-blue-100"
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
            <tr className="bg-slate-900/90 text-slate-100">
              <th className="px-4 py-2 text-left">Bidang</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Update Terakhir</th>
              <th className="px-4 py-2 text-left">Penanggung Jawab</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-800/70 last:border-none"
              >
                <td className="px-4 py-2">{row.bidang}</td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    row.status === "Valid"
                      ? "text-emerald-300"
                      : row.status === "Revisi"
                        ? "text-amber-300"
                        : "text-red-300"
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
    <div className="flex flex-wrap gap-4 justify-end">
      <button className="bg-blue-900 text-blue-100 px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 border border-blue-700/70">
        Upload Dokumen
      </button>
      <button className="bg-emerald-900 text-emerald-100 px-4 py-2 rounded-lg font-semibold shadow hover:bg-emerald-800 border border-emerald-700/70">
        Generate Laporan
      </button>
      <button className="bg-amber-900 text-amber-100 px-4 py-2 rounded-lg font-semibold shadow hover:bg-amber-800 border border-amber-700/70">
        Broadcast
      </button>
      <button className="bg-slate-900 text-slate-100 px-4 py-2 rounded-lg font-semibold shadow hover:bg-slate-800 border border-slate-600/80">
        Export Data
      </button>
    </div>
  );
}

function AIFeedbackPanel() {
  return (
    <PanelBox title="AI & Feedback" accent="blue">
      <div className="mb-2 text-sm text-slate-200/90">
        Rekomendasi AI: Tidak ada bottleneck terdeteksi. Semua alur berjalan
        normal.
      </div>
      <div className="mb-2">
        <label className="block text-xs mb-1 text-slate-300/90">
          Laporan Masalah/Feedback:
        </label>
        <textarea
          className="w-full border border-slate-700 bg-black/70 rounded p-2 text-sm text-slate-50"
          rows={2}
          placeholder="Tulis feedback atau masalah di sini..."
        />
        <button className="mt-2 bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-800">
          Kirim
        </button>
      </div>
    </PanelBox>
  );
}

function OpenDataPortal() {
  return (
    <PanelBox title="Open Data Portal" accent="amber">
      <div className="mb-2 text-sm text-slate-200/90">
        Ringkasan data publik tersedia untuk diunduh:
      </div>
      <div className="flex gap-2">
        <button className="bg-slate-900 text-slate-100 px-4 py-2 rounded-lg font-semibold shadow hover:bg-slate-800 border border-slate-600/80">
          Download Excel
        </button>
        <button className="bg-slate-900 text-slate-100 px-4 py-2 rounded-lg font-semibold shadow hover:bg-slate-800 border border-slate-600/80">
          Download PDF
        </button>
        <button className="bg-slate-900 text-slate-100 px-4 py-2 rounded-lg font-semibold shadow hover:bg-slate-800 border border-slate-600/80">
          Download CSV
        </button>
      </div>
    </PanelBox>
  );
}

export default function DashboardSekretariat() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const [kpi, setKpi] = useState(FALLBACK_KPI);
  const [alertData, setAlertData] = useState(FALLBACK_ALERTS);
  const [kpiLoading, setKpiLoading] = useState(false);

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

  return (
    <DashboardSekretariatLayout fallbackModules={moduleCards}>
      <div className="w-full px-6 md:px-12 py-8 space-y-8">
        <div
          className="bg-gradient-to-r from-black/95 to-slate-900/92 border-2 border-slate-800/85 rounded-2xl p-8 shadow-2xl"
          style={{
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
            <span className="text-4xl"></span>
            Dashboard Sekretariat
          </h1>
          <p className="text-slate-200/85 text-base leading-relaxed">
            Ringkasan koordinasi lintas bidang, kepatuhan alur, dan administrasi
            operasional Sekretariat.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <HeroCard
            title="Compliance Koordinasi"
            value={
              kpi.complianceAlurKoordinasi !== null
                ? `${kpi.complianceAlurKoordinasi}%`
                : kpiLoading
                  ? "..."
                  : "—"
            }
            info={`${kpi.totalTransaksi30d ?? "—"} transaksi 30 hari`}
            accent="blue"
          />
          <HeroCard
            title="Zero Bypass (30h)"
            value={
              kpi.zeroBypassViolations30d !== null
                ? kpi.zeroBypassViolations30d
                : kpiLoading
                  ? "..."
                  : "—"
            }
            info="Jumlah bypass alur terdeteksi"
            accent={kpi.zeroBypassViolations30d > 0 ? "red" : "emerald"}
          />
          <HeroCard
            title="Avg. Waktu Approval"
            value={
              kpi.avgApprovalTimeHours !== null
                ? `${kpi.avgApprovalTimeHours}j`
                : kpiLoading
                  ? "..."
                  : "—"
            }
            info="Rata-rata jam selesai persetujuan"
            accent="amber"
          />
          <HeroCard
            title="Konsistensi Komoditas"
            value={
              kpi.konsistensiDataKomoditas !== null
                ? `${kpi.konsistensiDataKomoditas}%`
                : kpiLoading
                  ? "..."
                  : "—"
            }
            info={`${kpi.komoditasVerified ?? "—"}/${kpi.komoditasTotal ?? "—"} komoditas verified`}
            accent={
              kpi.konsistensiDataKomoditas !== null &&
              kpi.konsistensiDataKomoditas < 80
                ? "red"
                : "emerald"
            }
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-9">
          <div className="xl:col-span-2 flex flex-col gap-9">
            <DataFlowChart />
            <LintasBidangTable tableData={tableData} />
          </div>
          <div className="xl:col-span-1">
            <ComplianceAlertPanel alertData={alertData} />
          </div>
        </div>

        <PanelBox title="Aksi Cepat" accent="emerald">
          <QuickActionBar />
        </PanelBox>

        <PanelBox title="Modul Sekretariat" accent="blue">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleCards.map((modul) => (
              <div
                key={modul.id}
                className="bg-gradient-to-br from-slate-900/92 to-black/85 border-2 border-slate-700/70 rounded-xl p-5 flex flex-col gap-3 shadow-lg hover:scale-105 transition"
                style={{
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <div className="font-bold text-lg text-slate-100">
                  {modul.name}
                </div>
                <div className="text-xs text-slate-300/80 font-mono">
                  ID: {modul.id}
                </div>
                <div className="mt-2">
                  <FieldMappingPreview modulId={modul.id} />
                </div>
              </div>
            ))}
          </div>
        </PanelBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
          <AIFeedbackPanel />
          <OpenDataPortal />
        </div>
      </div>
    </DashboardSekretariatLayout>
  );
}
