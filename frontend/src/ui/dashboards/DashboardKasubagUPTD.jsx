// frontend/src/ui/dashboards/DashboardKasubagUPTD.jsx
// A-10: Dashboard Kepala Sub Bagian Tata Usaha UPTD
// config/roles.json: subbag_tata_usaha → verify_admin, assign_to_uptd_staff, view_unit_tasks
// e-Pelara role (D-10): kasubag UPTD → PENGAWAS (view-only; UPTD bukan bidang program)
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

function normalizeUnit(user) {
  return user?.unit_kerja ? String(user.unit_kerja).toLowerCase() : "";
}

const ALLOWED = [
  "subbag_tata_usaha",
  "kasubag_uptd",
  "kasubbag_tata_usaha",
  "kasubbag_tu_uptd",
  "super_admin",
  "kepala_dinas",
  "kepala_uptd",
];

export default function DashboardKasubagUPTD() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifList, setNotifList] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [kpiSummary, setKpiSummary] = useState(null);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "KSBU-001",
        status: "akses",
        detail: "Akses dashboard Kasubag Tata Usaha UPTD",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    let unitId = user.unit_id || user.unit_kerja;
    if (!unitId || isNaN(Number(unitId))) {
      setTasks([]);
      setLoading(false);
      return;
    }
    api
      .get(`/tasks/${unitId}`, { params: { limit: 10 } })
      .then((res) =>
        setTasks(
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [],
        ),
      )
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setNotifLoading(true);
    api
      .get("/notifications?limit=10")
      .then((res) => {
        if (!cancelled) {
          setNotifList(Array.isArray(res.data?.data) ? res.data.data : []);
        }
      })
      .catch(() => setNotifList([]))
      .finally(() => setNotifLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch KPI summary (kasubag UPTD)
  useEffect(() => {
    api
      .get("/dashboard/kasubag-uptd/summary")
      .then((res) => setKpiSummary(res.data?.data || null))
      .catch(() => setKpiSummary(null));
  }, []);

  const isAllowedRole = ALLOWED.includes(roleName);
  const isAllowedUnit =
    !unit ||
    unit.includes("uptd") ||
    roleName === "super_admin" ||
    roleName === "kepala_dinas";
  const isAllowed =
    !!user && (isAllowedRole || (isAllowedUnit && unit.includes("uptd")));
  if (!isAllowed) return <Navigate to="/" replace />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-900/95 to-slate-900/80 border-2 border-cyan-700/50 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏛️</span>
          Dashboard Kasubag Tata Usaha UPTD
        </h1>
        <p className="text-cyan-200/80 text-sm">
          Unit:{" "}
          <span className="font-semibold text-white">
            {user?.unit_kerja || "—"}
          </span>
          {" · "}Role e-Pelara:{" "}
          <span className="font-bold text-amber-300">PENGAWAS</span>
        </p>
      </div>

      {/* Panel Notifikasi Broadcast UPTD */}
      <div className="mb-4">
        {notifLoading ? (
          <div className="bg-cyan-900/80 border border-cyan-400/30 rounded-xl p-4 text-cyan-200 text-sm animate-pulse">
            Memuat notifikasi…
          </div>
        ) : notifList.filter((n) =>
            n.message?.startsWith("[Broadcast Kepala UPTD]"),
          ).length === 0 ? null : (
          <div className="bg-cyan-900/80 border border-cyan-400/30 rounded-xl p-4 text-cyan-100 text-sm space-y-2">
            <div className="font-bold text-cyan-200 mb-1 flex items-center gap-2">
              <span className="text-lg">📢</span> Notifikasi Kepala UPTD
            </div>
            {notifList
              .filter((n) => n.message?.startsWith("[Broadcast Kepala UPTD]"))
              .map((n, i) => (
                <div
                  key={n.id ?? i}
                  className="border-b border-cyan-700/30 pb-2 mb-2 last:mb-0 last:pb-0 last:border-0"
                >
                  <span className="text-cyan-100">
                    {n.message.replace("[Broadcast Kepala UPTD]", "").trim()}
                  </span>
                  <span className="block text-xs text-cyan-300/70 mt-1">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString("id-ID")
                      : ""}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tugas Unit",
            value: loading ? "…" : tasks.length,
            color: "cyan",
          },
          { label: "Tugas Pending", value: kpiSummary?.tugasPending ?? "—", color: "blue" },
          { label: "Surat Belum Disposisi", value: kpiSummary?.suratMasukBelumDisposisi ?? "—", color: "indigo" },
          { label: "KGB Pending", value: kpiSummary?.kgbPendingApproval ?? "—", color: "emerald" },
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

      {/* Tugas Unit */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">📋 Tugas Unit UPTD</h2>
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat data…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada tugas di unit UPTD.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Judul</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Ditugaskan</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr
                    key={t.id ?? i}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 font-medium">
                      {t.judul || t.title || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-100 text-cyan-700">
                        {t.status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {t.pelaksana || t.assigned_to || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Link ke UPTD Dashboard */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3">🔗 Akses Cepat</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/dashboard/uptd"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition"
          >
            🏛️ Dashboard UPTD Utama
          </a>
        </div>
      </div>

      {/* e-Pelara */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">Akses e-Pelara</h2>
        <p className="text-xs text-gray-500 mb-3">
          Sebagai <strong>PENGAWAS</strong> — Anda dapat memantau dokumen
          perencanaan UPTD (view-only).
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
