// frontend/src/pages/dashboard/pelaksana-uptd.jsx
// Role: pelaksana | Unit: UPTD

import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

const T = {
  primary: "#00838F", secondary: "#006064", accent: "#FF8F00",
  danger: "#C62828", success: "#2E7D32", warning: "#E65100",
  bg: "#E0F7FA", card: "#FFFFFF", border: "#B2EBF2",
  textPri: "#0A1B1D", textSec: "#3A6B6E",
};

const ALLOWED = ["pelaksana", "staf", "uptd", "super_admin", "kepala_dinas", "kepala_uptd", "subbag_tata_usaha", "kasubag_uptd"];
const STATUS_COLOR = { draft: "#546E7A", assigned: "#1565C0", in_progress: "#F57C00", submitted: "#7B1FA2", verified: "#2E7D32", closed: "#1B5E20", rejected: "#B71C1C" };

function StatusChip({ status }) {
  return <span style={{ background: STATUS_COLOR[status] || "#546E7A", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{status?.replace(/_/g, " ")}</span>;
}

function getUser() {
  try {
    const s = sessionStorage.getItem("auth-store") || localStorage.getItem("auth-store");
    if (s) { const p = JSON.parse(s); return p?.state?.user || null; }
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch { return null; }
}

const MODUL_UPT = [
  { kode: "UPT-ADM", label: "Administrasi UPTD", icon: "📋" },
  { kode: "UPT-AST", label: "Aset UPTD", icon: "🏭" },
  { kode: "UPT-INS", label: "Inspeksi & Pengawasan", icon: "🔍" },
  { kode: "UPT-KEP", label: "Kepegawaian UPTD", icon: "👤" },
  { kode: "UPT-KEU", label: "Keuangan UPTD", icon: "💰" },
  { kode: "UPT-MTU", label: "Mutu Pangan", icon: "⭐" },
  { kode: "UPT-TKN", label: "Teknis Operasional", icon: "⚙️" },
];

export default function PelaksanaUPTDDashboard() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || getUser();
  const roleName = (user?.roleName || user?.role || "").toLowerCase();

  const [tab, setTab] = useState("ringkasan");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [notifList, setNotifList] = useState([]);

  useEffect(() => {
    if (!ALLOWED.includes(roleName)) return;
    api.get("/notifications?limit=8").then((r) => setNotifList(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => null);
  }, [roleName]);

  const fetchTasks = useCallback(() => {
    if (!ALLOWED.includes(roleName)) return;
    setTasksLoading(true);
    api.get("/tasks?unit=uptd&limit=20")
      .then((r) => setTasks(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, [roleName]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  if (!ALLOWED.includes(roleName)) return <Navigate to="/" replace />;

  const taskAktif = tasks.filter((t) => !["closed","verified"].includes(t.status));
  const taskOverdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && !["closed","verified"].includes(t.status));

  async function handleMulai(id) { try { await api.put(`/tasks/${id}/mulai`); fetchTasks(); } catch { /* silent */ } }
  async function handleSelesai(id) { try { await api.put(`/tasks/${id}/selesai`); fetchTasks(); } catch { /* silent */ } }

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "tugas", label: `Tugas (${taskAktif.length})` },
    { id: "modul", label: "Modul UPTD" },
    { id: "notifikasi", label: "Notifikasi" },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <a href="#main-content" style={{ position: "absolute", left: -9999 }} onFocus={(e) => { e.target.style.left = "1rem"; }} onBlur={(e) => { e.target.style.left = "-9999px"; }}>Lewati ke konten utama</a>

      <header role="banner" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, borderBottom: `3px solid ${T.accent}` }}
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div style={{ background: T.accent, width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏭</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>SIGAP MALUT</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Pelaksana — UPTD · {user?.unit_kerja || "—"}</div>
          </div>
        </div>
        {taskOverdue.length > 0 && <span style={{ background: T.danger, color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{taskOverdue.length} Overdue</span>}
      </header>

      <nav style={{ background: T.card, borderBottom: `1px solid ${T.border}` }} className="flex gap-1 px-4 pt-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} role="tab" aria-selected={tab === t.id}
            style={{ padding: "9px 14px", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.primary : T.textSec, background: "none", border: "none", borderBottom: tab === t.id ? `3px solid ${T.primary}` : "3px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {tab === "ringkasan" && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, borderRadius: 14, padding: "20px 24px", color: "#fff" }}>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>Dashboard Pelaksana UPTD</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3 }}>{user?.name || user?.username || "—"} · {user?.unit_kerja || "UPTD Dinas Pangan"}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-live="polite">
              {[
                { label: "Tugas Aktif", value: taskAktif.length, color: T.primary },
                { label: "Overdue", value: taskOverdue.length, color: T.danger },
                { label: "Selesai", value: tasks.filter((t) => ["closed","verified"].includes(t.status)).length, color: T.success },
                { label: "Total", value: tasks.length, color: "#546E7A" },
              ].map((k) => (
                <div key={k.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderLeft: `4px solid ${k.color}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>{k.label}</div>
                </div>
              ))}
            </div>
            {taskAktif.slice(0, 3).length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPri, marginBottom: 10 }}>📋 Tugas Aktif</h2>
                {taskAktif.slice(0, 3).map((t) => (
                  <div key={t.id} style={{ borderBottom: `1px solid ${T.border}`, padding: "9px 0", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{t.title || t.judul || "—"}</span>
                    <StatusChip status={t.status} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "tugas" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>📋 Tugas UPTD</h2>
            {tasksLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
              : tasks.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Belum ada tugas.</p>
              : tasks.map((t) => (
                <div key={t.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${STATUS_COLOR[t.status] || "#546E7A"}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title || t.judul || "—"}</div>
                      {t.due_date && <div style={{ fontSize: 11, color: new Date(t.due_date) < new Date() && !["closed","verified"].includes(t.status) ? T.danger : T.textSec, marginTop: 3 }}>
                        Deadline: {new Date(t.due_date).toLocaleDateString("id-ID")}
                      </div>}
                    </div>
                    <StatusChip status={t.status} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {t.status === "assigned" && <button onClick={() => handleMulai(t.id)} style={{ background: T.primary, color: "#fff", padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>▶ Mulai</button>}
                    {t.status === "in_progress" && <button onClick={() => handleSelesai(t.id)} style={{ background: T.success, color: "#fff", padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>✓ Selesai</button>}
                  </div>
                </div>
              ))}
          </div>
        )}

        {tab === "modul" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>🗂️ Modul UPTD</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {MODUL_UPT.map((m) => (
                <a key={m.kode} href={`/modul/${m.kode}`} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 14px", textDecoration: "none", display: "block" }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.textPri }}>{m.kode}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{m.label}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {tab === "notifikasi" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>🔔 Notifikasi</h2>
            {notifList.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada notifikasi.</p>
              : notifList.map((n, i) => (
                <div key={n.id ?? i} style={{ background: n.read_at ? "#F9FAFB" : "#E0FDFF", border: `1px solid ${n.read_at ? T.border : "#67E8F9"}`, borderRadius: 10, padding: "11px 14px", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read_at ? 400 : 600 }}>{n.message || "—"}</div>
                  <div style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>{n.created_at ? new Date(n.created_at).toLocaleString("id-ID") : ""}</div>
                </div>
              ))}
          </div>
        )}
      </main>

      <footer role="contentinfo" style={{ textAlign: "center", fontSize: 11, color: T.textSec, padding: "12px 0", borderTop: `1px solid ${T.border}`, marginTop: 24 }}>
        SIGAP-MALUT © 2026 · Pelaksana UPTD · Dinas Pangan
      </footer>
    </div>
  );
}
