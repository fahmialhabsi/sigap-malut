// frontend/src/ui/dashboards/DashboardKepalaDinas.jsx
// Role: kepala_dinas | Level: 7
// Spec: dokumenSistem/38-spesifikasi-dashboard-kepala-dinas.md
// Pattern: fungsional-ketersediaan.jsx (design tokens T, tabs, KPI, recharts, WCAG 2.1 AA)

import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: "#1B4F8A",
  secondary: "#163D6E",
  accent: "#F57C00",
  danger: "#C62828",
  info: "#0277BD",
  success: "#2E7D32",
  warning: "#E65100",
  bg: "#F4F6F9",
  card: "#FFFFFF",
  border: "#DDE3ED",
  textPri: "#1A2B3C",
  textSec: "#546E7A",
};

const ALLOWED = ["kepala_dinas", "super_admin"];

// ─── Status chip ─────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  terkirim: "#1565C0", diterima: "#0277BD", dalam_proses: "#F57C00",
  diajukan: "#7B1FA2", disetujui: "#2E7D32", dikembalikan: "#E65100",
  ditolak: "#B71C1C", selesai: "#1B5E20", escalated: "#880E4F",
};

function StatusChip({ status }) {
  return (
    <span style={{ background: STATUS_COLOR[status] || "#546E7A", color: "#fff" }}
      className="px-2 py-0.5 rounded-full text-xs font-semibold">
      {status?.replace(/_/g, " ")}
    </span>
  );
}

// ─── Auth helper ─────────────────────────────────────────────────────────────
function getUser() {
  try {
    const s = sessionStorage.getItem("auth-store") || localStorage.getItem("auth-store");
    if (s) { const p = JSON.parse(s); return p?.state?.user || null; }
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

// ─── Bawahan langsung Kepala Dinas ────────────────────────────────────────────
const BAWAHAN_ROLES = [
  { role: "sekretaris", label: "Sekretaris", icon: "📋" },
  { role: "kepala_bidang_ketersediaan", label: "Kabid Ketersediaan", icon: "🌾" },
  { role: "kepala_bidang_distribusi", label: "Kabid Distribusi", icon: "🚚" },
  { role: "kepala_bidang_konsumsi", label: "Kabid Konsumsi", icon: "🍽️" },
  { role: "kepala_uptd", label: "Kepala UPTD", icon: "🏭" },
];

export default function DashboardKepalaDinas() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || getUser();
  const roleName = (user?.roleName || user?.role || "").toLowerCase();

  const [tab, setTab] = useState("ringkasan");
  const [kpi, setKpi] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kinerja, setKinerja] = useState([]);
  const [perintahMasuk, setPerintahMasuk] = useState([]);
  const [perintahKeluar, setPerintahKeluar] = useState([]);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [formState, setFormState] = useState({ judul: "", isi: "", ke_role: "sekretaris", prioritas: "normal", deadline: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  // All hooks BEFORE conditional return (React Rules of Hooks)
  useEffect(() => {
    if (!ALLOWED.includes(roleName)) return;
    setKpiLoading(true);
    api.get("/dashboard/kepala-dinas/kpi").then((r) => setKpi(r.data?.data || null)).catch(() => null).finally(() => setKpiLoading(false));
  }, [roleName]);

  useEffect(() => {
    if (!ALLOWED.includes(roleName)) return;
    api.get("/dashboard/kepala-dinas/kinerja-bawahan").then((r) => setKinerja(r.data?.data || [])).catch(() => null);
    api.get("/dashboard/kepala-dinas/approval-queue").then((r) => setApprovalQueue(r.data?.data || [])).catch(() => null);
  }, [roleName]);

  const fetchPerintah = useCallback(() => {
    if (!ALLOWED.includes(roleName)) return;
    api.get("/perintah/masuk").then((r) => setPerintahMasuk(r.data?.data || [])).catch(() => null);
    api.get("/perintah/keluar").then((r) => setPerintahKeluar(r.data?.data || [])).catch(() => null);
  }, [roleName]);
  useEffect(() => { fetchPerintah(); }, [fetchPerintah]);

  // Auth guard AFTER all hooks
  if (!ALLOWED.includes(roleName)) return <Navigate to="/" replace />;

  const kpiData = [
    { id: "k1", label: "Perintah Masuk Aktif", value: kpi?.perintahMasukAktif ?? "—", color: T.primary, sub: "dari Gubernur" },
    { id: "k2", label: "Perintah Keluar Aktif", value: kpi?.perintahKeluarAktif ?? "—", color: T.info, sub: "ke bawahan" },
    { id: "k3", label: "Approval Pending", value: kpi?.approvalPending ?? "—", color: "#7B1FA2", sub: "dari bawahan" },
    { id: "k4", label: "Perintah Overdue", value: kpi?.perintahOverdue ?? "—", color: T.danger, sub: "lewat deadline" },
  ];

  async function handleBuatPerintah(e) {
    e.preventDefault();
    if (!formState.judul || !formState.isi || !formState.ke_role) return;
    setSubmitting(true);
    setSubmitMsg("");
    try {
      await api.post("/perintah", { ...formState, ke_user_id: null });
      setSubmitMsg("✅ Perintah berhasil dikirim");
      setFormState({ judul: "", isi: "", ke_role: "sekretaris", prioritas: "normal", deadline: "" });
      fetchPerintah();
    } catch (err) {
      setSubmitMsg(`❌ ${err.response?.data?.error || err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTerima(id) {
    try { await api.put(`/perintah/${id}/terima`); fetchPerintah(); } catch { /* silent */ }
  }
  async function handleAjukan(id) {
    const catatan = prompt("Catatan laporan ke Gubernur:");
    if (!catatan) return;
    try { await api.post(`/perintah/${id}/ajukan`, { catatan }); fetchPerintah(); } catch { /* silent */ }
  }
  async function handleApproval(id, aksi) {
    const catatan = aksi === "setujui" ? "Disetujui" : prompt(`Catatan ${aksi}:`);
    if (aksi !== "setujui" && !catatan) return;
    try {
      await api.post(`/perintah/${id}/${aksi}`, { catatan });
      setApprovalQueue((prev) => prev.filter((p) => p.id !== id));
    } catch (err) { alert(err.response?.data?.error || err.message); }
  }

  const kinerjaChartData = kinerja.map((k) => ({
    name: BAWAHAN_ROLES.find((b) => b.role === k.role)?.label || k.role,
    selesai: parseInt(k.selesai) || 0,
    overdue: parseInt(k.overdue) || 0,
  }));

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "perintah_masuk", label: `Perintah Masuk${perintahMasuk.filter((p) => p.status === "terkirim").length > 0 ? ` (${perintahMasuk.filter((p) => p.status === "terkirim").length})` : ""}` },
    { id: "perintah_keluar", label: "Perintah Keluar" },
    { id: "persetujuan", label: `Persetujuan${approvalQueue.length > 0 ? ` (${approvalQueue.length})` : ""}` },
    { id: "kinerja", label: "Kinerja Bawahan" },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <a href="#main-content" style={{ position: "absolute", left: -9999 }}
        onFocus={(e) => { e.target.style.left = "1rem"; }} onBlur={(e) => { e.target.style.left = "-9999px"; }}>
        Lewati ke konten utama
      </a>

      {/* Header */}
      <header role="banner" style={{ background: `linear-gradient(135deg, ${T.primary} 0%, ${T.secondary} 100%)`, borderBottom: `3px solid ${T.accent}` }}
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div style={{ background: T.accent, width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏛️</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>SIGAP MALUT</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Dashboard Kepala Dinas Pangan</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {approvalQueue.length > 0 && (
            <div style={{ background: T.danger, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
              {approvalQueue.length} Approval
            </div>
          )}
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <nav role="navigation" aria-label="Tab dashboard kepala dinas" style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}
        className="flex gap-1 px-6 pt-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} role="tab" aria-selected={tab === t.id}
            style={{ padding: "10px 16px", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.primary : T.textSec, background: "none", border: "none", borderBottom: tab === t.id ? `3px solid ${T.primary}` : "3px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Ringkasan ── */}
        {tab === "ringkasan" && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, borderRadius: 16, padding: "24px 28px", color: "#fff" }}>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard Kepala Dinas</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>Dinas Pangan Provinsi Maluku Utara</p>
            </div>

            {/* KPI */}
            <section aria-live="polite">
              <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>KPI Operasional</h2>
              {kpiLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => <div key={i} style={{ background: "#eee", height: 88, borderRadius: 12 }} className="animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {kpiData.map((k) => (
                    <div key={k.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderLeft: `4px solid ${k.color}`, borderRadius: 12, padding: "16px 18px" }}
                      role="status" aria-label={`${k.label}: ${k.value}`}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.textPri, marginTop: 4 }}>{k.label}</div>
                      <div style={{ fontSize: 11, color: T.textSec }}>{k.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Perintah dari Gubernur — ringkasan */}
            {perintahMasuk.filter((p) => p.dari_role === "gubernur").length > 0 && (
              <section>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📥 Perintah dari Gubernur</h2>
                <div className="space-y-2">
                  {perintahMasuk.filter((p) => p.dari_role === "gubernur").slice(0, 3).map((p) => (
                    <div key={p.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.primary}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.judul}</div>
                        <div style={{ fontSize: 11, color: T.textSec }}>{p.nomor_perintah} · {p.deadline ? `Deadline: ${new Date(p.deadline).toLocaleDateString("id-ID")}` : "Tanpa deadline"}</div>
                      </div>
                      <StatusChip status={p.status} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Perintah Masuk ── */}
        {tab === "perintah_masuk" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 16 }}>📥 Perintah Masuk dari Gubernur</h2>
            {perintahMasuk.length === 0 ? (
              <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada perintah masuk.</p>
            ) : (
              <div className="space-y-4">
                {perintahMasuk.map((p) => (
                  <div key={p.id} style={{ border: `1px solid ${T.border}`, borderLeft: `5px solid ${T.primary}`, borderRadius: 12, padding: 20 }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.judul}</div>
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>
                          {p.nomor_perintah} · Dari: <strong>{p.dari_role}</strong> · Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString("id-ID") : "—"}
                        </div>
                        <p style={{ fontSize: 13, color: T.textPri, marginTop: 8, lineHeight: 1.5 }}>{p.isi}</p>
                        {/* Progress bar */}
                        <div style={{ marginTop: 10 }}>
                          <div style={{ background: "#eee", borderRadius: 4, height: 6, width: 200 }}>
                            <div style={{ background: T.primary, width: `${p.progres_persen || 0}%`, height: "100%", borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 11, color: T.textSec }}>{p.progres_persen || 0}% selesai</span>
                        </div>
                      </div>
                      <StatusChip status={p.status} />
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {p.status === "terkirim" && (
                        <button onClick={() => handleTerima(p.id)}
                          style={{ background: T.info, color: "#fff", padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          ✓ Terima
                        </button>
                      )}
                      {["diterima", "dalam_proses"].includes(p.status) && (
                        <button onClick={() => handleAjukan(p.id)}
                          style={{ background: T.success, color: "#fff", padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          ↑ Ajukan ke Gubernur
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Perintah Keluar ── */}
        {tab === "perintah_keluar" && (
          <div className="space-y-6">
            {/* Form buat perintah */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 16 }}>📤 Buat Perintah ke Bawahan</h2>
              <form onSubmit={handleBuatPerintah} className="space-y-4">
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Kepada</label>
                  <select value={formState.ke_role} onChange={(e) => setFormState((p) => ({ ...p, ke_role: e.target.value }))}
                    style={{ width: "100%", marginTop: 4, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14 }}>
                    {BAWAHAN_ROLES.map((b) => <option key={b.role} value={b.role}>{b.icon} {b.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Judul Perintah *</label>
                  <input value={formState.judul} onChange={(e) => setFormState((p) => ({ ...p, judul: e.target.value }))} required
                    style={{ width: "100%", marginTop: 4, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14 }}
                    placeholder="Judul instruksi..." />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Isi Perintah *</label>
                  <textarea value={formState.isi} onChange={(e) => setFormState((p) => ({ ...p, isi: e.target.value }))} required rows={3}
                    style={{ width: "100%", marginTop: 4, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, resize: "vertical" }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>Prioritas</label>
                    <select value={formState.prioritas} onChange={(e) => setFormState((p) => ({ ...p, prioritas: e.target.value }))}
                      style={{ width: "100%", marginTop: 4, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14 }}>
                      <option value="normal">Normal</option>
                      <option value="tinggi">Tinggi</option>
                      <option value="kritis">Kritis</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>Deadline</label>
                    <input type="datetime-local" value={formState.deadline} onChange={(e) => setFormState((p) => ({ ...p, deadline: e.target.value }))}
                      style={{ width: "100%", marginTop: 4, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14 }} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={submitting}
                    style={{ background: T.primary, color: "#fff", padding: "10px 24px", borderRadius: 8, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14 }}>
                    {submitting ? "Mengirim..." : "Kirim Perintah"}
                  </button>
                  {submitMsg && <span style={{ fontSize: 13 }}>{submitMsg}</span>}
                </div>
              </form>
            </div>

            {/* Daftar perintah keluar */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>Riwayat Perintah Keluar</h2>
              {perintahKeluar.length === 0 ? (
                <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Belum ada perintah keluar.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#F0F4FF" }}>
                      {["Nomor", "Judul", "Kepada", "Prioritas", "Deadline", "Progress", "Status"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", color: T.textSec, fontWeight: 600, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {perintahKeluar.map((p) => (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11 }}>{p.nomor_perintah || "—"}</td>
                          <td style={{ padding: "10px 12px", fontWeight: 600 }}>{p.judul}</td>
                          <td style={{ padding: "10px 12px", color: T.textSec }}>{BAWAHAN_ROLES.find((b) => b.role === p.ke_role)?.label || p.ke_role}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ background: p.prioritas === "kritis" ? T.danger : p.prioritas === "tinggi" ? T.warning : "#546E7A", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11 }}>{p.prioritas}</span>
                          </td>
                          <td style={{ padding: "10px 12px", color: T.textSec, fontSize: 12 }}>{p.deadline ? new Date(p.deadline).toLocaleDateString("id-ID") : "—"}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ background: "#eee", borderRadius: 4, height: 6, width: 60 }}>
                              <div style={{ background: T.primary, width: `${p.progres_persen || 0}%`, height: "100%", borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 11, color: T.textSec }}>{p.progres_persen || 0}%</span>
                          </td>
                          <td style={{ padding: "10px 12px" }}><StatusChip status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Persetujuan ── */}
        {tab === "persetujuan" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 16 }}>✅ Antrian Persetujuan dari Bawahan</h2>
            {approvalQueue.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.textSec }}>
                <div style={{ fontSize: 40 }}>✅</div>
                <p style={{ marginTop: 8 }}>Tidak ada dokumen menunggu persetujuan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvalQueue.map((p) => (
                  <div key={p.id} style={{ border: `1px solid ${T.border}`, borderLeft: `5px solid ${T.accent}`, borderRadius: 12, padding: 20 }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.judul}</div>
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>{p.nomor_perintah} · Dari: {p.dari_role}</div>
                        <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{p.isi}</p>
                      </div>
                      <StatusChip status={p.status} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => handleApproval(p.id, "setujui")} style={{ background: T.success, color: "#fff", padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>✓ Setujui</button>
                      <button onClick={() => handleApproval(p.id, "kembalikan")} style={{ background: T.warning, color: "#fff", padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>↩ Kembalikan</button>
                      <button onClick={() => handleApproval(p.id, "tolak")} style={{ background: T.danger, color: "#fff", padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>✕ Tolak</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Kinerja Bawahan ── */}
        {tab === "kinerja" && (
          <div className="space-y-6">
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 16 }}>📊 Kinerja 5 Bawahan Langsung</h2>
              {kinerja.length === 0 ? (
                <p style={{ color: T.textSec, fontSize: 13 }}>Memuat data kinerja...</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {kinerja.map((k) => {
                      const b = BAWAHAN_ROLES.find((x) => x.role === k.role);
                      return (
                        <div key={k.role} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
                          <div style={{ fontSize: 28, marginBottom: 4 }}>{b?.icon || "👤"}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.textPri }}>{b?.label || k.role}</div>
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: T.success }}>{k.selesai}</div>
                            <div style={{ fontSize: 11, color: T.textSec }}>selesai dari {k.total}</div>
                          </div>
                          {k.overdue > 0 && <div style={{ fontSize: 11, color: T.danger, marginTop: 4 }}>{k.overdue} overdue</div>}
                          {k.rate && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ background: "#eee", borderRadius: 4, height: 4 }}>
                                <div style={{ background: T.success, width: `${k.rate}%`, height: "100%", borderRadius: 4 }} />
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: T.success, marginTop: 2 }}>{k.rate}%</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {kinerjaChartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={kinerjaChartData} margin={{ left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="selesai" fill={T.success} name="Selesai" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="overdue" fill={T.danger} name="Overdue" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </main>

      <footer role="contentinfo" style={{ textAlign: "center", fontSize: 11, color: T.textSec, padding: "16px 0", borderTop: `1px solid ${T.border}`, marginTop: 32 }}>
        SIGAP-MALUT © 2026 · Dinas Pangan Provinsi Maluku Utara · Dashboard Kepala Dinas
      </footer>
    </div>
  );
}
