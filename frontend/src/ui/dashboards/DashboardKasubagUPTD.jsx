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
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("overview");
  const [tuStaff, setTuStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    assignee_user_id: "",
    due_date: "",
  });
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState(null);

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
    api
      .get("/tasks/unit", { params: { limit: 10 } })
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
    if (!user) return;
    setStaffLoading(true);
    api
      .get("/api/uptd/kasubag/tu-staff")
      .then((res) =>
        setTuStaff(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setTuStaff([]))
      .finally(() => setStaffLoading(false));
  }, [user]);

  const isAllowedRole = ALLOWED.includes(roleName);
  const isAllowedUnit =
    !unit ||
    unit.includes("uptd") ||
    roleName === "super_admin" ||
    roleName === "kepala_dinas";
  const isAllowed =
    !!user && (isAllowedRole || (isAllowedUnit && unit.includes("uptd")));
  if (!isAllowed) return <Navigate to="/" replace />;

  const SIDEBAR_MENU = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    { id: "inbox", label: "Inbox Kepala UPTD", icon: "📥", badge: null },
    { id: "tim", label: "Tim Saya (Pelaksana TU)", icon: "👥", badge: null },
    { id: "assign", label: "Assign Tugas TU", icon: "📋", badge: null },
    { divider: true, label: "MODUL TU (ADMINISTRATIF)" },
    { id: "absensi", label: "Absensi Staf UPTD", icon: "📅" },
    { id: "surat", label: "Surat Masuk/Keluar", icon: "📬" },
    { id: "kgb", label: "Alert KGB UPTD", icon: "🔔" },
    { divider: true, label: "LAINNYA" },
    { id: "skp-saya", label: "SKP Saya (read)", icon: "🎯" },
  ];

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignResult(null);
    if (!assignForm.title || !assignForm.assignee_user_id) {
      setAssignResult({ ok: false, msg: "Judul dan Pelaksana TU wajib diisi." });
      return;
    }
    setAssigning(true);
    try {
      const res = await api.post("/api/uptd/kasubag/assign-tu", assignForm);
      if (res.data?.success) {
        setAssignResult({ ok: true, msg: "Tugas berhasil ditugaskan ke Pelaksana TU." });
        setAssignForm({ title: "", description: "", assignee_user_id: "", due_date: "" });
      } else {
        setAssignResult({ ok: false, msg: "Gagal menugaskan." });
      }
    } catch (err) {
      setAssignResult({
        ok: false,
        msg: err?.response?.data?.message || err?.response?.data?.error || "Gagal menugaskan.",
      });
    } finally {
      setAssigning(false);
    }
  };

  const PanelBox = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Tugas Unit", value: loading ? "…" : tasks.length, color: "cyan" },
                { label: "Staf TU", value: staffLoading ? "…" : tuStaff.length, color: "blue" },
                { label: "Alert KGB", value: "—", color: "amber" },
                { label: "Surat Masuk", value: "—", color: "indigo" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpi.color}-50 border-${kpi.color}-200`}
                >
                  <div className={`text-3xl font-bold text-${kpi.color}-700`}>{kpi.value}</div>
                  <div className={`text-xs font-medium text-${kpi.color}-600`}>{kpi.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PanelBox title="📋 Tugas Unit UPTD (Jalur Administratif)">
                {loading ? (
                  <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
                ) : tasks.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Belum ada tugas.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.slice(0, 8).map((t) => (
                      <div key={t.id} className="border border-gray-100 bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-800">{t.judul || t.title || "—"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Status: {t.status || "—"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </PanelBox>
              <PanelBox title="👥 Tim Saya (Pelaksana TU)">
                {staffLoading ? (
                  <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
                ) : tuStaff.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Pelaksana TU belum terdaftar.</p>
                ) : (
                  <div className="space-y-2">
                    {tuStaff.slice(0, 8).map((u) => (
                      <div key={u.id} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{u.nama_lengkap || u.username}</div>
                          <div className="text-xs text-gray-500">{u.unit_kerja}</div>
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
          </div>
        );
      case "tim":
        return (
          <PanelBox title="👥 Tim Pelaksana TU Saya">
            {staffLoading ? (
              <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
            ) : tuStaff.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Pelaksana TU belum terdaftar.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tuStaff.map((u) => (
                  <div key={u.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="font-semibold text-gray-800">{u.nama_lengkap || u.username}</div>
                    <div className="text-xs text-gray-500 mt-1">{u.unit_kerja}</div>
                  </div>
                ))}
              </div>
            )}
          </PanelBox>
        );
      case "assign":
        return (
          <PanelBox title="📋 Assign Tugas ke Pelaksana TU (wajib jalur administratif)">
            <p className="text-xs text-gray-500 mb-3">
              Sesuai aturan dual-track: Kasubag TU hanya boleh menugaskan ke Pelaksana TU. Sistem akan menolak jika target bukan TU.
            </p>
            <form onSubmit={handleAssign} className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Judul</label>
                <input
                  value={assignForm.title}
                  onChange={(e) => setAssignForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Contoh: Rekap surat masuk minggu ini"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Deskripsi (opsional)</label>
                <textarea
                  value={assignForm.description}
                  onChange={(e) => setAssignForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Catatan instruksi…"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Pelaksana TU</label>
                  <select
                    value={assignForm.assignee_user_id}
                    onChange={(e) => setAssignForm((f) => ({ ...f, assignee_user_id: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Pilih…</option>
                    {tuStaff.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama_lengkap || u.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Deadline (opsional)</label>
                  <input
                    type="date"
                    value={assignForm.due_date}
                    onChange={(e) => setAssignForm((f) => ({ ...f, due_date: e.target.value }))}
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
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm font-semibold"
              >
                {assigning ? "Menugaskan…" : "Assign Tugas"}
              </button>
            </form>
          </PanelBox>
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
              <p className="text-xs text-slate-400">Kasubag TU UPTD</p>
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
                    ? "bg-cyan-600 text-white"
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
          <BukaEPelaraButton label="e-Pelara" targetPath="/" className="w-full !py-2 !text-xs" />
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
        <header className="bg-gradient-to-r from-cyan-900/95 to-slate-900/80 border-b border-cyan-700/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-white text-lg">Kasubag TU UPTD</h1>
              <p className="text-cyan-200/70 text-xs">
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
