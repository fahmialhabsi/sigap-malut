// frontend/src/ui/dashboards/DashboardKasubag.jsx
// A-10: Dashboard Kepala Sub Bagian Umum & Kepegawaian
// config/roles.json: kasubag_umum_kepegawaian → view_unit_tasks, assign_to_pelaksana, verify, create_task_unit
// e-Pelara role (D-10): kasubag unit yang ada di bidang → ADMINISTRATOR
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
  "kasubag",
  "kasubag_umum_kepegawaian",
  "kasubbag",
  "kasubbag_umum",
  "kasubbag_kepegawaian",
  "super_admin",
  "sekretaris",
  "kepala_dinas",
];

export default function DashboardKasubag() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "KSB-001",
        status: "akses",
        detail: "Akses dashboard Kasubag Umum & Kepegawaian",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/tasks/unit", { params: { limit: 10 } })
      .then((res) =>
        setTasks(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [user]);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-900/95 to-slate-900/80 border-2 border-teal-700/50 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">📁</span>
          Dashboard Kasubag Umum &amp; Kepegawaian
        </h1>
        <p className="text-teal-200/80 text-sm">
          Unit:{" "}
          <span className="font-semibold text-white">
            {user?.unit_kerja || "—"}
          </span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tugas Unit",
            value: loading ? "…" : tasks.length,
            color: "teal",
          },
          { label: "Tugas Pending Assign", value: "—", color: "amber" },
          { label: "Terverifikasi", value: "—", color: "emerald" },
          { label: "Baru Dibuat", value: "—", color: "blue" },
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

      {/* Daftar Tugas Unit */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">📋 Tugas Unit</h2>
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat data…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada tugas di unit Anda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Judul</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Pelaksana</th>
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
                      <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">
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

      {/* Panel Perencanaan SDM — Bagian IV, Role 7 */}
      <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          👥 Perencanaan SDM &amp; Administrasi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <div className="font-semibold text-teal-800 text-sm mb-1">
              📋 Formasi Pegawai
            </div>
            <p className="text-xs text-teal-600 mb-2">
              Data jumlah pegawai per jabatan — menjadi input sisi SDM di
              Renstra.
            </p>
            <a
              href="/kepegawaian/formasi"
              className="inline-block text-xs font-medium text-teal-700 hover:underline"
            >
              → Lihat Formasi
            </a>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="font-semibold text-blue-800 text-sm mb-1">
              🎓 Kebutuhan Diklat
            </div>
            <p className="text-xs text-blue-600 mb-2">
              Usulan kegiatan pendidikan & pelatihan untuk dimasukkan ke Renja
              Sekretariat.
            </p>
            <a
              href="/kepegawaian/diklat"
              className="inline-block text-xs font-medium text-blue-700 hover:underline"
            >
              → Input Diklat
            </a>
          </div>
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div className="font-semibold text-indigo-800 text-sm mb-1">
              📝 Renja Sekretariat
            </div>
            <p className="text-xs text-indigo-600 mb-2">
              Input sub-kegiatan administrasi umum & kepegawaian ke Renja di
              e-Pelara.
            </p>
            <BukaEPelaraButton
              label="Input Renja →"
              targetPath="/dashboard-renja"
              className="!py-1 !px-2 !text-xs"
            />
          </div>
        </div>
      </div>

      {/* Akreditasi Kepegawaian Quick Links */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3">🔗 Akses Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Kepegawaian",
              href: "/dashboard/kepegawaian",
              icon: "👥",
            },
            { label: "Keuangan", href: "/dashboard/keuangan", icon: "💰" },
            {
              label: "Tugas Sekretariat",
              href: "/sekretariat-tasks",
              icon: "📋",
            },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-200 rounded-xl transition text-center"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-xs font-medium text-gray-700">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* e-Pelara */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">Akses e-Pelara</h2>
        <BukaEPelaraButton
          label="Buka e-Pelara — Administrasi"
          targetPath="/"
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}
