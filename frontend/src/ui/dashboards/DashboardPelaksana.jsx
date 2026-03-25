// frontend/src/ui/dashboards/DashboardPelaksana.jsx
// A-10: Dashboard Staf Pelaksana
// config/roles.json: staf_pelaksana → create_draft, update_task_progress, upload_evidence, submit_done, view_assigned
// e-Pelara role (D-10): pelaksana → DRAFTER (create & update draft dokumen)
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

const ALLOWED = ["pelaksana", "staf_pelaksana", "super_admin", "kepala_dinas"];

const PROGRESS_COLOR = {
  pending: "bg-gray-200",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
  terlambat: "bg-red-500",
};

export default function DashboardPelaksana() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "PLK-001",
        status: "akses",
        detail: "Akses dashboard Pelaksana",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/tasks/assigned", { params: { limit: 15 } })
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

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter(
    (t) => !t.status || t.status === "pending",
  ).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900/95 to-slate-900/80 border-2 border-blue-700/50 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">⚙️</span>
          Dashboard Pelaksana
        </h1>
        <p className="text-blue-200/80 text-sm">
          Selamat datang,{" "}
          <span className="font-semibold text-white">
            {user?.nama_lengkap || user?.name || "—"}
          </span>{" "}
          · Unit: {user?.unit_kerja || "—"}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tugas",
            value: loading ? "…" : tasks.length,
            color: "blue",
          },
          {
            label: "Sedang Dikerjakan",
            value: loading ? "…" : inProgress,
            color: "amber",
          },
          { label: "Selesai", value: loading ? "…" : done, color: "emerald" },
          { label: "Menunggu", value: loading ? "…" : pending, color: "gray" },
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

      {/* Progres Bar Keseluruhan */}
      {!loading && tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2">
            📈 Progress Keseluruhan
          </h2>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden mb-1">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round((done / tasks.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {done} dari {tasks.length} tugas selesai (
            {Math.round((done / tasks.length) * 100)}%)
          </p>
        </div>
      )}

      {/* Daftar Tugas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">📋 Tugas Saya</h2>
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat tugas…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada tugas yang ditugaskan.
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div
                key={t.id ?? i}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {t.judul || t.title || "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.modul_id || t.modulId || ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${PROGRESS_COLOR[t.status] ?? "bg-gray-300"}`}
                  />
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {t.status || "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Target Kegiatan Saya (read-only) — Bagian IV, Role 6 */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          🎯 Target Sub-Kegiatan Saya (Read-Only)
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Daftar target sub-kegiatan unit kerja Anda. Kontribusi Anda terhadap
          perencanaan adalah melalui <strong>data operasional</strong> yang Anda
          input (stok, distribusi, lapangan) — data ini digunakan JF untuk
          menyusun Renstra berbasis data. Anda <strong>tidak</strong> mengakses
          form Renstra/Renja langsung.
        </p>
        <div className="flex flex-wrap gap-2">
          <BukaEPelaraButton
            label="Lihat Target (read-only) →"
            targetPath="/dashboard-renstra"
            className="!py-1.5 !px-3 !text-xs"
          />
          <BukaEPelaraButton
            label="Input Data Teknis Lapangan"
            targetPath="/input-laporan"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
      </div>

      {/* e-Pelara */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">Akses e-Pelara</h2>
        <p className="text-xs text-gray-500 mb-3">
          Sebagai <strong>DRAFTER</strong> — Anda dapat membuat dan mengupdate
          draft dokumen perencanaan.
        </p>
        <BukaEPelaraButton
          label="Buka e-Pelara"
          targetPath="/"
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}
