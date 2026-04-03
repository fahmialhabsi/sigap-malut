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
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
import WorkspaceSertifikasiMutu from "../../components/uptd/workspace/WorkspaceSertifikasiMutu";
import WorkspaceUjiLabTeknis from "../../components/uptd/workspace/WorkspaceUjiLabTeknis";
import api from "../../services/api";

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
  "kasi_mutu_uptd",
  "kasi_teknis_uptd",
  "super_admin",
  "kepala_dinas",
  "kepala_uptd",
];

const SEKSI_LABEL = {
  seksi_manajemen_mutu: "Seksi Manajemen Mutu",
  seksi_manajemen_teknis: "Seksi Manajemen Teknis",
  kasi_mutu: "Seksi Manajemen Mutu",
  kasi_teknis: "Seksi Manajemen Teknis",
  kasi_mutu_uptd: "Seksi Manajemen Mutu",
  kasi_teknis_uptd: "Seksi Manajemen Teknis",
};

export default function DashboardKasiUPTD() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("overview");
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    assignee_user_id: "",
    due_date: "",
  });
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState(null);

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

  useEffect(() => {
    if (!user) return;
    setStaffLoading(true);
    api
      .get("/api/uptd/kasi/staff")
      .then((res) =>
        setStaff(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setStaff([]))
      .finally(() => setStaffLoading(false));
  }, [user]);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  const isMutu =
    roleName === "seksi_manajemen_mutu" ||
    roleName === "kasi_mutu" ||
    roleName === "kasi_mutu_uptd";

  const SIDEBAR_MENU = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    {
      id: "workspace",
      label: isMutu ? "Sertifikasi & Audit" : "Uji Lab & Sampling",
      icon: isMutu ? "🏆" : "🔬",
    },
    { id: "tim", label: "Tim Saya", icon: "👥" },
    { id: "assign", label: "Assign Tugas", icon: "📋" },
    { divider: true, label: "LAINNYA" },
    { id: "skp-saya", label: "SKP Saya (read)", icon: "🎯" },
  ];

  const PanelBox = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  );

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignResult(null);
    if (!assignForm.title || !assignForm.assignee_user_id) {
      setAssignResult({ ok: false, msg: "Judul dan Pelaksana wajib diisi." });
      return;
    }
    setAssigning(true);
    try {
      const res = await api.post("/api/uptd/kasi/assign", assignForm);
      if (res.data?.success) {
        setAssignResult({ ok: true, msg: "Tugas berhasil ditugaskan." });
        setAssignForm({
          title: "",
          description: "",
          assignee_user_id: "",
          due_date: "",
        });
      } else {
        setAssignResult({ ok: false, msg: "Gagal menugaskan." });
      }
    } catch (err) {
      setAssignResult({
        ok: false,
        msg:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Gagal menugaskan.",
      });
    } finally {
      setAssigning(false);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PanelBox title={`📥 Tugas dari Kepala UPTD`}>
                {loading ? (
                  <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
                ) : reports.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Belum ada tugas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reports.slice(0, 8).map((t) => (
                      <div
                        key={t.id}
                        className="border border-gray-100 bg-gray-50 rounded-lg p-3"
                      >
                        <div className="text-sm font-semibold text-gray-800">
                          {t.judul || t.title || "—"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Status: {t.status || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PanelBox>
              <PanelBox title="👥 Tim Saya (Pelaksana Seksi)">
                {staffLoading ? (
                  <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
                ) : staff.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Pelaksana belum terdaftar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {staff.slice(0, 8).map((u) => (
                      <div
                        key={u.id}
                        className="border border-gray-100 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {u.nama_lengkap || u.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {u.unit_kerja}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </PanelBox>
            </div>
            <div>
              {isMutu ? (
                <WorkspaceSertifikasiMutu />
              ) : (
                <WorkspaceUjiLabTeknis />
              )}
            </div>
          </div>
        );
      case "workspace":
        return isMutu ? (
          <WorkspaceSertifikasiMutu />
        ) : (
          <WorkspaceUjiLabTeknis />
        );
      case "tim":
        return (
          <PanelBox title="👥 Tim Pelaksana Seksi">
            {staffLoading ? (
              <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
            ) : staff.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Pelaksana belum terdaftar.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {staff.map((u) => (
                  <div
                    key={u.id}
                    className="border border-gray-100 rounded-lg p-3"
                  >
                    <div className="font-semibold text-gray-800">
                      {u.nama_lengkap || u.username}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {u.unit_kerja}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelBox>
        );
      case "assign":
        return (
          <PanelBox title="📋 Assign Tugas ke Pelaksana (dibatasi seksi)">
            <p className="text-xs text-gray-500 mb-3">
              Dual-track enforcement aktif: Kasi Mutu hanya ke Pelaksana Mutu,
              Kasi Teknis hanya ke Pelaksana Teknis.
            </p>
            <form onSubmit={handleAssign} className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  Judul
                </label>
                <input
                  value={assignForm.title}
                  onChange={(e) =>
                    setAssignForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  Deskripsi (opsional)
                </label>
                <textarea
                  value={assignForm.description}
                  onChange={(e) =>
                    setAssignForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Pelaksana
                  </label>
                  <select
                    value={assignForm.assignee_user_id}
                    onChange={(e) =>
                      setAssignForm((f) => ({
                        ...f,
                        assignee_user_id: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Pilih…</option>
                    {staff.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama_lengkap || u.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Deadline (opsional)
                  </label>
                  <input
                    type="date"
                    value={assignForm.due_date}
                    onChange={(e) =>
                      setAssignForm((f) => ({ ...f, due_date: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {assignResult && (
                <div
                  className={`text-sm rounded-lg px-3 py-2 border ${
                    assignResult.ok
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {assignResult.msg}
                </div>
              )}
              <button
                type="submit"
                disabled={assigning}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold"
              >
                {assigning ? "Menugaskan…" : "Assign Tugas"}
              </button>
            </form>
          </PanelBox>
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 flex flex-col transition-transform duration-200`}
      >
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isMutu ? "🏆" : "🔬"}</span>
            <div>
              <p className="font-bold text-white text-sm">SIGAP-MALUT</p>
              <p className="text-xs text-slate-400">{seksiLabel}</p>
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
                    ? "bg-teal-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-teal-900/95 to-slate-900/80 border-b border-teal-700/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-white text-lg">{seksiLabel}</h1>
              <p className="text-teal-200/70 text-xs">
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
              🔔 {loading ? "…" : 0} notif
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
