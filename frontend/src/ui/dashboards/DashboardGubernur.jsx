// frontend/src/ui/dashboards/DashboardGubernur.jsx
// Role: gubernur | Level: 0 (tertinggi)
// Spec: dokumenSistem/37-spesifikasi-dashboard-gubernur.md
// Pattern: fungsional-ketersediaan.jsx (design tokens T, tabs, KPI tiles, recharts, WCAG 2.1 AA)

import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: "#8B0000",      // merah maroon — warna pemerintahan
  accent: "#DAA520",       // emas — warna pemerintahan
  secondary: "#5C0A0A",
  danger: "#B71C1C",
  info: "#1565C0",
  success: "#2E7D32",
  warning: "#E65100",
  bg: "#FAF7F0",
  card: "#FFFFFF",
  border: "#E8D5B0",
  textPri: "#1A0A0A",
  textSec: "#6B3A3A",
};

const ALLOWED = ["gubernur", "super_admin"];

// ─── KPI Statis (fallback) ────────────────────────────────────────────────────
const KPI_STATIC = [
  { id: "k1", label: "Perintah Aktif", value: "—", unit: "", sub: "ke Kepala Dinas", color: T.primary },
  { id: "k2", label: "Perintah Overdue", value: "—", unit: "", sub: "melewati deadline", color: T.danger },
  { id: "k3", label: "Approval Pending", value: "—", unit: "", sub: "dari Kepala Dinas", color: T.warning },
  { id: "k4", label: "Stok Pangan", value: "—", unit: "hari", sub: "rata-rata provinsi", color: T.success },
  { id: "k5", label: "Inflasi Pangan", value: "—", unit: "%", sub: "month-on-month", color: T.info },
  { id: "k6", label: "Kab. Rawan", value: "—", unit: "kab.", sub: "dari 10 kab/kota", color: T.danger },
  { id: "k7", label: "UPTD Aktif", value: "—", unit: "", sub: "dari total UPTD", color: T.success },
  { id: "k8", label: "Aktivitas Sistem", value: "—", unit: "", sub: "transaksi 30 hari", color: T.accent },
];

// ─── 10 Kab/Kota Maluku Utara ────────────────────────────────────────────────
const KAB_KOTA = [
  { id: "ternate", nama: "Kota Ternate" },
  { id: "tidore", nama: "Kota Tidore" },
  { id: "halbar", nama: "Halmahera Barat" },
  { id: "haltim", nama: "Halmahera Timur" },
  { id: "halsel", nama: "Halmahera Selatan" },
  { id: "halut", nama: "Halmahera Utara" },
  { id: "halteng", nama: "Halmahera Tengah" },
  { id: "kepsula", nama: "Kepulauan Sula" },
  { id: "taliabu", nama: "Pulau Taliabu" },
  { id: "morotai", nama: "Morotai" },
];

const IKP_COLOR = { kritis: "#B71C1C", rawan: "#E65100", waspada: "#F9A825", tahan: "#2E7D32", unknown: "#90A4AE" };
const IKP_LABEL = { kritis: "Kritis", rawan: "Rawan", waspada: "Waspada", tahan: "Tahan", unknown: "—" };

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardGubernur() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || getUser();
  const roleName = (user?.roleName || user?.role || "").toLowerCase();

  const [tab, setTab] = useState("ringkasan");
  const [kpi, setKpi] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [ikpMap, setIkpMap] = useState([]);
  const [kinerja, setKinerja] = useState(null);
  const [perintahMasuk, setPerintahMasuk] = useState([]);
  const [perintahKeluar, setPerintahKeluar] = useState([]);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [formState, setFormState] = useState({ judul: "", isi: "", prioritas: "normal", deadline: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Auth guard — all hooks BEFORE conditional return
  if (!ALLOWED.includes(roleName)) return <Navigate to="/" replace />;

  // Fetch KPI summary
  useEffect(() => {
    setKpiLoading(true);
    api.get("/dashboard/gubernur/kpi").then((r) => setKpi(r.data?.data || null)).catch(() => {}).finally(() => setKpiLoading(false));
  }, []);

  // Fetch IKP map
  useEffect(() => { api.get("/dashboard/gubernur/ikp-map").then((r) => setIkpMap(r.data?.data || [])).catch(() => {}); }, []);

  // Fetch kinerja KaDin
  useEffect(() => { api.get("/dashboard/gubernur/kinerja-kadin").then((r) => setKinerja(r.data?.data || null)).catch(() => {}); }, []);

  // Fetch perintah
  const fetchPerintah = useCallback(() => {
    api.get("/perintah/masuk").then((r) => setPerintahMasuk(r.data?.data || [])).catch(() => {});
    api.get("/perintah/keluar").then((r) => setPerintahKeluar(r.data?.data || [])).catch(() => {});
  }, []);
  useEffect(() => { fetchPerintah(); }, [fetchPerintah]);

  // Fetch approval queue + alerts
  useEffect(() => {
    api.get("/dashboard/gubernur/approval-queue").then((r) => setApprovalQueue(r.data?.data || [])).catch(() => {});
    api.get("/dashboard/gubernur/alerts").then((r) => setAlerts(r.data?.data || [])).catch(() => {});
  }, []);

  // KPI data merged
  const kpiData = [
    { ...KPI_STATIC[0], value: kpi?.perintahAktif ?? "—" },
    { ...KPI_STATIC[1], value: kpi?.perintahOverdue ?? "—" },
    { ...KPI_STATIC[2], value: kpi?.approvalPending ?? "—" },
    { ...KPI_STATIC[3], value: kpi?.stokPanganHari ?? "—" },
    { ...KPI_STATIC[4], value: kpi?.inflasiPangan != null ? `${kpi.inflasiPangan}%` : "—" },
    { ...KPI_STATIC[5], value: kpi?.kabRawan ?? "—" },
    { ...KPI_STATIC[6], value: kpi?.uptdAktif != null ? `${kpi.uptdAktif}/${kpi.uptdTotal ?? "?"}` : "—" },
    { ...KPI_STATIC[7], value: kpi?.aktivitasSistem30d ?? "—" },
  ];

  // IKP chart data
  const ikpChartData = ikpMap.map((k) => ({
    name: k.nama.replace("Halmahera ", "Halm. ").replace("Kepulauan ", "Kep. "),
    skor: k.ikp || 0,
    status: k.status,
  }));

  // Buat perintah baru ke KaDin
  async function handleBuatPerintah(e) {
    e.preventDefault();
    if (!formState.judul || !formState.isi) return;
    setSubmitting(true);
    setSubmitMsg("");
    try {
      await api.post("/perintah", {
        ...formState,
        ke_role: "kepala_dinas",
        ke_user_id: null,
      });
      setSubmitMsg("✅ Perintah berhasil dikirim ke Kepala Dinas");
      setFormState({ judul: "", isi: "", prioritas: "normal", deadline: "" });
      fetchPerintah();
    } catch (err) {
      setSubmitMsg(`❌ Gagal: ${err.response?.data?.error || err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Aksi approval
  async function handleApproval(id, aksi) {
    const catatan = aksi !== "setujui" ? prompt(`Catatan ${aksi}:`) : "Disetujui oleh Gubernur";
    if (aksi !== "setujui" && !catatan) return;
    try {
      await api.post(`/perintah/${id}/${aksi}`, { catatan });
      setApprovalQueue((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Gagal: ${err.response?.data?.error || err.message}`);
    }
  }

  const TABS = [
    { id: "ringkasan", label: "Ringkasan Eksekutif" },
    { id: "perintah", label: "Perintah & Instruksi" },
    { id: "persetujuan", label: `Persetujuan${approvalQueue.length > 0 ? ` (${approvalQueue.length})` : ""}` },
    { id: "kinerja", label: "Kinerja KaDin" },
    { id: "peta", label: "Peta IKP" },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <a href="#main-content" style={{ position: "absolute", left: -9999 }}
        onFocus={(e) => { e.target.style.left = "1rem"; e.target.style.top = "1rem"; }}
        onBlur={(e) => { e.target.style.left = "-9999px"; }}>
        Lewati ke konten utama
      </a>

      {/* ── Header ── */}
      <header role="banner" style={{ background: `linear-gradient(135deg, ${T.primary} 0%, ${T.secondary} 100%)`, borderBottom: `3px solid ${T.accent}` }}
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div style={{ background: T.accent, width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏛️</div>
          <div>
            <div style={{ color: T.accent, fontWeight: 800, fontSize: 16 }}>SIGAP MALUT</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Dashboard Gubernur — Provinsi Maluku Utara</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {alerts.length > 0 && (
            <div style={{ background: T.danger, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
              🔔 {alerts.length} Alert
            </div>
          )}
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <nav role="navigation" aria-label="Tab dashboard" style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}
        className="flex gap-1 px-6 pt-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "10px 18px", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, borderBottom: tab === t.id ? `3px solid ${T.primary}` : "3px solid transparent",
              color: tab === t.id ? T.primary : T.textSec, background: "none", border: "none", borderBottom: tab === t.id ? `3px solid ${T.primary}` : "3px solid transparent",
              cursor: "pointer", whiteSpace: "nowrap",
            }}
            aria-selected={tab === t.id} role="tab">
            {t.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Tab: Ringkasan ── */}
        {tab === "ringkasan" && (
          <>
            {/* Hero */}
            <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, borderRadius: 16, padding: "28px 32px", color: "#fff" }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Ringkasan Eksekutif — Gubernur</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                Ketahanan pangan Provinsi Maluku Utara · {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
              </p>
            </div>

            {/* KPI Tiles */}
            <section aria-label="KPI Strategis Gubernur" aria-live="polite">
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>KPI Strategis Ketahanan Pangan</h2>
              {kpiLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => <div key={i} style={{ background: "#eee", borderRadius: 12, height: 96 }} className="animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {kpiData.map((k) => (
                    <div key={k.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderLeft: `4px solid ${k.color}`, borderRadius: 12, padding: "16px 18px" }}
                      role="status" aria-label={`${k.label}: ${k.value} ${k.unit}`}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}{k.unit && <span style={{ fontSize: 13 }}> {k.unit}</span>}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.textPri, marginTop: 4 }}>{k.label}</div>
                      <div style={{ fontSize: 11, color: T.textSec }}>{k.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Alerts */}
            {alerts.length > 0 && (
              <section aria-label="Alert Kritis">
                <h2 style={{ fontSize: 15, fontWeight: 700, color: T.danger, marginBottom: 12 }}>⚠️ Alert Kritis</h2>
                <div className="space-y-2">
                  {alerts.map((a, i) => (
                    <div key={i} style={{ background: a.level === "kritis" ? "#FFEBEE" : "#FFF3E0", border: `1px solid ${a.level === "kritis" ? T.danger : T.warning}`, borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 20 }}>{a.level === "kritis" ? "🔴" : "🟡"}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>{a.pesan}</div>
                        <div style={{ fontSize: 11, color: T.textSec }}>{a.tipe?.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Kinerja KaDin ringkasan */}
            {kinerja && (
              <section aria-label="Ringkasan Kinerja Kepala Dinas">
                <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>Kinerja Kepala Dinas</h2>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Perintah", value: kinerja.totalPerintah },
                    { label: "Selesai", value: kinerja.perintahSelesai },
                    { label: "Overdue", value: kinerja.perintahOverdue },
                    { label: "Tidak Respon", value: kinerja.perintahTakRespons },
                  ].map((m) => (
                    <div key={m.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: T.primary }}>{m.value ?? "—"}</div>
                      <div style={{ fontSize: 12, color: T.textSec }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Tab: Perintah ── */}
        {tab === "perintah" && (
          <div className="space-y-6">
            {/* Buat Perintah */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 16 }}>📋 Buat Perintah ke Kepala Dinas</h2>
              <form onSubmit={handleBuatPerintah} className="space-y-4">
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>Judul Perintah *</label>
                  <input value={formState.judul} onChange={(e) => setFormState((p) => ({ ...p, judul: e.target.value }))} required
                    style={{ width: "100%", marginTop: 4, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14 }}
                    placeholder="Judul perintah atau instruksi" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>Isi Perintah *</label>
                  <textarea value={formState.isi} onChange={(e) => setFormState((p) => ({ ...p, isi: e.target.value }))} required rows={4}
                    style={{ width: "100%", marginTop: 4, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, resize: "vertical" }}
                    placeholder="Isi instruksi secara rinci..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>Prioritas</label>
                    <select value={formState.prioritas} onChange={(e) => setFormState((p) => ({ ...p, prioritas: e.target.value }))}
                      style={{ width: "100%", marginTop: 4, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14 }}>
                      <option value="normal">Normal</option>
                      <option value="tinggi">Tinggi</option>
                      <option value="kritis">Kritis</option>
                      <option value="rendah">Rendah</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>Deadline</label>
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

            {/* Perintah Keluar */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 16 }}>📤 Perintah yang Sudah Dikirim</h2>
              {perintahKeluar.length === 0 ? (
                <p style={{ fontSize: 13, color: T.textSec, fontStyle: "italic" }}>Belum ada perintah yang dikirim.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#FFF8F0" }}>
                      {["Nomor", "Judul", "Prioritas", "Deadline", "Progress", "Status"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", color: T.textSec, fontWeight: 600, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {perintahKeluar.map((p) => (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11 }}>{p.nomor_perintah || "—"}</td>
                          <td style={{ padding: "10px 12px", fontWeight: 600 }}>{p.judul}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ background: p.prioritas === "kritis" ? T.danger : p.prioritas === "tinggi" ? T.warning : "#546E7A", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11 }}>
                              {p.prioritas}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", color: T.textSec, fontSize: 12 }}>{p.deadline ? new Date(p.deadline).toLocaleDateString("id-ID") : "—"}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ background: "#eee", borderRadius: 4, height: 6, width: 80 }}>
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

        {/* ── Tab: Persetujuan ── */}
        {tab === "persetujuan" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 16 }}>✅ Antrian Persetujuan dari Kepala Dinas</h2>
            {approvalQueue.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.textSec }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <p>Tidak ada dokumen yang menunggu persetujuan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvalQueue.map((p) => (
                  <div key={p.id} style={{ border: `1px solid ${T.border}`, borderLeft: `5px solid ${T.accent}`, borderRadius: 12, padding: 20 }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div style={{ fontWeight: 700, color: T.textPri, fontSize: 15 }}>{p.judul}</div>
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>
                          {p.nomor_perintah} · Dikirim {p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "—"}
                        </div>
                        <p style={{ fontSize: 13, color: T.textPri, marginTop: 8, lineHeight: 1.5 }}>{p.isi}</p>
                      </div>
                      <StatusChip status={p.status} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => handleApproval(p.id, "setujui")}
                        style={{ background: T.success, color: "#fff", padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        ✓ Setujui
                      </button>
                      <button onClick={() => handleApproval(p.id, "kembalikan")}
                        style={{ background: T.warning, color: "#fff", padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        ↩ Kembalikan
                      </button>
                      <button onClick={() => handleApproval(p.id, "tolak")}
                        style={{ background: T.danger, color: "#fff", padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        ✕ Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Kinerja KaDin ── */}
        {tab === "kinerja" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 20 }}>📊 Monitoring Kinerja Kepala Dinas</h2>
            {!kinerja ? (
              <p style={{ fontSize: 13, color: T.textSec, fontStyle: "italic" }}>Memuat data kinerja...</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Perintah Diberikan", value: kinerja.totalPerintah, color: T.info },
                    { label: "Selesai / Disetujui", value: kinerja.perintahSelesai, color: T.success },
                    { label: "Overdue", value: kinerja.perintahOverdue, color: T.danger },
                    { label: "Tidak Direspon > 2 Hari", value: kinerja.perintahTakRespons, color: T.warning },
                  ].map((m) => (
                    <div key={m.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderLeft: `4px solid ${m.color}`, borderRadius: 10, padding: "16px" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value ?? "—"}</div>
                      <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {kinerja.selesaiRate && (
                  <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 13, color: T.textSec, marginBottom: 8 }}>Tingkat Penyelesaian</div>
                    <div style={{ background: "#eee", borderRadius: 6, height: 12 }}>
                      <div style={{ background: T.success, width: `${kinerja.selesaiRate}%`, height: "100%", borderRadius: 6 }} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.success, marginTop: 6 }}>{kinerja.selesaiRate}%</div>
                  </div>
                )}
                <div style={{ background: "#FFF3E0", border: "1px solid #FFCC80", borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 13, color: T.textPri }}>
                    <strong>SLA Target:</strong> Kepala Dinas harus merespon perintah Gubernur dalam 2×24 jam sejak perintah diterima.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Peta IKP ── */}
        {tab === "peta" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 8 }}>🗺️ Peta IKP — 10 Kab/Kota Maluku Utara</h2>
            <div className="flex gap-4 flex-wrap mb-4">
              {Object.entries(IKP_LABEL).filter(([k]) => k !== "unknown").map(([k, v]) => (
                <div key={k} className="flex items-center gap-1">
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: IKP_COLOR[k] }} />
                  <span style={{ fontSize: 12, color: T.textSec }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {KAB_KOTA.map((k) => {
                const data = ikpMap.find((d) => d.id === k.id);
                const status = data?.status || "unknown";
                return (
                  <div key={k.id} style={{ background: IKP_COLOR[status] + "22", border: `2px solid ${IKP_COLOR[status]}`, borderRadius: 10, padding: "14px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: IKP_COLOR[status] }}>{IKP_LABEL[status]}</div>
                    <div style={{ fontSize: 12, color: T.textPri, fontWeight: 600, marginTop: 4 }}>{k.nama}</div>
                    {data?.ikp && <div style={{ fontSize: 11, color: T.textSec }}>IKP: {data.ikp}</div>}
                  </div>
                );
              })}
            </div>
            {ikpChartData.filter((d) => d.skor > 0).length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ikpChartData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`IKP: ${v}`, ""]} />
                  <Bar dataKey="skor" radius={[4, 4, 0, 0]}>
                    {ikpChartData.map((d, i) => (
                      <Cell key={i} fill={IKP_COLOR[d.status] || IKP_COLOR.unknown} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

      </main>

      <footer role="contentinfo" style={{ textAlign: "center", fontSize: 11, color: T.textSec, padding: "16px 0", borderTop: `1px solid ${T.border}`, marginTop: 32 }}>
        SIGAP-MALUT © 2026 · Pemerintah Provinsi Maluku Utara · Dashboard Gubernur · v1.0.0
      </footer>
    </div>
  );
}
