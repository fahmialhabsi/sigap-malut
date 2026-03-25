// frontend/src/ui/dashboards/DashboardKasiUPTD.jsx
// A-10: Dashboard Kepala Seksi UPTD (Manajemen Mutu & Manajemen Teknis)
// config/roles.json:
//   seksi_manajemen_mutu   → verify_technical, view_lab_results, assign_corrections
//   seksi_manajemen_teknis → verify_technical, view_inspection_reports, assign_tindak_lanjut
// e-Pelara role (D-10): UPTD bukan bidang program → PENGAWAS (view-only)
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
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

const ALLOWED = [
  "seksi_manajemen_mutu",
  "seksi_manajemen_teknis",
  "kasi_uptd",
  "kasi_mutu",
  "kasi_teknis",
  "super_admin",
  "kepala_dinas",
  "kepala_uptd",
];

const SEKSI_LABEL = {
  seksi_manajemen_mutu: "Seksi Manajemen Mutu",
  seksi_manajemen_teknis: "Seksi Manajemen Teknis",
  kasi_mutu: "Seksi Manajemen Mutu",
  kasi_teknis: "Seksi Manajemen Teknis",
};

export default function DashboardKasiUPTD() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const seksiLabel = SEKSI_LABEL[roleName] || "Kepala Seksi UPTD";

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "KASI-UPTD-001",
        status: "akses",
        detail: `Akses dashboard ${seksiLabel}`,
      });
    }
  }, [user, seksiLabel]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get("/tasks/unit", { params: { limit: 10 } });
        if (!cancelled) {
          setReports(
            Array.isArray(res.data?.data)
              ? res.data.data
              : Array.isArray(res.data)
                ? res.data
                : [],
          );
        }
      } catch {
        if (!cancelled) setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReports();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  const isMutu =
    roleName === "seksi_manajemen_mutu" || roleName === "kasi_mutu";
  const kpiLabels = isMutu
    ? [
        {
          label: "Verifikasi Teknis",
          value: loading ? "…" : reports.length,
          color: "blue",
        },
        { label: "Hasil Lab Pending", value: "—", color: "amber" },
        { label: "Koreksi Diberikan", value: "—", color: "red" },
        { label: "Selesai", value: "—", color: "emerald" },
      ]
    : [
        {
          label: "Verifikasi Teknis",
          value: loading ? "…" : reports.length,
          color: "blue",
        },
        { label: "Laporan Inspeksi", value: "—", color: "indigo" },
        { label: "Tindak Lanjut", value: "—", color: "amber" },
        { label: "Selesai", value: "—", color: "emerald" },
      ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-900/95 to-slate-900/80 border-2 border-teal-700/50 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🔬</span>
          Dashboard {seksiLabel}
        </h1>
        <p className="text-teal-200/80 text-sm">
          Unit:{" "}
          <span className="font-semibold text-white">
            {user?.unit_kerja || "UPTD"}
          </span>
          {" · "}Role e-Pelara:{" "}
          <span className="font-bold text-amber-300">PENGAWAS</span>
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiLabels.map((kpi) => (
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

      {/* Tugas / Laporan */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">
          📋 {isMutu ? "Antrian Verifikasi Mutu" : "Antrian Verifikasi Teknis"}
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat data…</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada antrian verifikasi.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Judul</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Ditugaskan ke</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 font-medium text-gray-800 max-w-[240px] truncate">
                      {r.title || r.judul || `Laporan #${i + 1}`}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === "done" || r.status === "selesai"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.status || "pending"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {r.assignee || r.penanggung_jawab || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Wewenang */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
        <h2 className="font-bold text-teal-800 mb-3">
          🛡️ Wewenang {seksiLabel}
        </h2>
        <ul className="space-y-1 text-sm text-teal-700">
          <li>
            ✅ Verifikasi teknis hasil {isMutu ? "laboratorium" : "inspeksi"}
          </li>
          <li>
            ✅{" "}
            {isMutu
              ? "Melihat hasil lab dan memberikan koreksi"
              : "Melihat laporan inspeksi dan menugaskan tindak lanjut"}
          </li>
          <li>🚫 Tidak dapat melakukan final approve (hak Kepala UPTD)</li>
          <li>🚫 Tidak dapat mengakses data lintas bidang</li>
        </ul>
      </div>

      {/* e-Pelara */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">Akses e-Pelara</h2>
        <p className="text-sm text-gray-500 mb-3">
          Anda dapat mengakses e-Pelara dengan role{" "}
          <span className="font-semibold text-amber-600">PENGAWAS</span>{" "}
          (view-only).
        </p>
        <BukaEPelaraButton
          label="Buka e-Pelara — UPTD"
          targetPath="/"
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}
