// frontend/src/pages/dashboard/fungsional-perencanaan.jsx
// Role: fungsional_perencana | Level 4 | Analis Program & Penyusunan Dokumen

import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, Cell,
} from "recharts";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

const T = {
  primary: "#1565C0", secondary: "#0D47A1", accent: "#FF8F00",
  danger: "#C62828", success: "#2E7D32", warning: "#E65100",
  bg: "#E3F2FD", card: "#FFFFFF", border: "#BBDEFB",
  textPri: "#0A1528", textSec: "#2A5080",
};

const ALLOWED = [
  "fungsional_perencana", "fungsional", "pejabat_fungsional",
  "jabatan_fungsional", "super_admin", "sekretaris", "kepala_dinas",
];

const STATUS_COLOR = {
  draft: "#546E7A", in_review: "#1565C0", disetujui: "#2E7D32",
  published: "#1B5E20", dikembalikan: "#E65100", aktif: "#2E7D32",
  selesai: "#1B5E20", tertunda: "#B71C1C",
};

const JENIS_DOK = [
  { value: "renstra", label: "Renstra" },
  { value: "renja", label: "Renja" },
  { value: "rka", label: "RKA" },
  { value: "dpa", label: "DPA" },
  { value: "lap_bulanan", label: "Laporan Bulanan" },
  { value: "lap_triwulan", label: "Laporan Triwulan" },
  { value: "lkpj", label: "LKPJ" },
  { value: "lakip", label: "LAKIP" },
];

const BIDANG_LIST = [
  { key: "sekretariat", label: "Sekretariat", color: T.primary },
  { key: "ketersediaan", label: "Ketersediaan", color: "#2E7D32" },
  { key: "distribusi", label: "Distribusi", color: "#1565C0" },
  { key: "konsumsi", label: "Konsumsi", color: "#6A1B9A" },
  { key: "uptd", label: "UPTD", color: "#00838F" },
];

function StatusChip({ status }) {
  return (
    <span style={{ background: STATUS_COLOR[status] || "#546E7A", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function KpiTile({ label, value, color, warn, sub }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${warn ? T.danger : T.border}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      {warn && <div style={{ fontSize: 10, color: T.danger, marginTop: 2, fontWeight: 600 }}>⚠ Perlu perhatian</div>}
    </div>
  );
}

function getUser() {
  try {
    const s = sessionStorage.getItem("auth-store") || localStorage.getItem("auth-store");
    if (s) { const p = JSON.parse(s); return p?.state?.user || null; }
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch { return null; }
}

// Fallback static data jika API belum tersedia
const STATIC_PROGRAM = [
  { bidang: "Sekretariat", target: 85, realisasi: 72, anggaran: 1200, real_anggaran: 864 },
  { bidang: "Ketersediaan", target: 90, realisasi: 88, anggaran: 3400, real_anggaran: 2992 },
  { bidang: "Distribusi", target: 80, realisasi: 65, anggaran: 2800, real_anggaran: 1820 },
  { bidang: "Konsumsi", target: 85, realisasi: 80, anggaran: 1900, real_anggaran: 1520 },
  { bidang: "UPTD", target: 75, realisasi: 70, anggaran: 2100, real_anggaran: 1470 },
];

export default function FungsionalPerencanaanDashboard() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || getUser();
  const roleName = (user?.roleName || user?.role || "").toLowerCase();

  const [tab, setTab] = useState("ringkasan");

  // KPI
  const [kpi, setKpi] = useState(null);

  // Program kegiatan + chart
  const [programList, setProgramList] = useState([]);
  const [programLoading, setProgramLoading] = useState(true);

  // Dokumen perencanaan
  const [dokList, setDokList] = useState([]);
  const [dokLoading, setDokLoading] = useState(true);

  // Form buat dokumen
  const [formJenis, setFormJenis] = useState("lap_bulanan");
  const [formJudul, setFormJudul] = useState("");
  const [formPeriode, setFormPeriode] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  // Koordinasi bidang
  const [koordinasi, setKoordinasi] = useState([]);

  // Notifikasi
  const [notifList, setNotifList] = useState([]);

  useEffect(() => {
    if (!ALLOWED.includes(roleName)) return;
    api.get("/dashboard/fungsional-perencana/summary")
      .then((r) => setKpi(r.data?.data || r.data)).catch(() => null);
    api.get("/notifications?limit=8")
      .then((r) => setNotifList(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => null);
    api.get("/dashboard/fungsional-perencana/koordinasi")
      .then((r) => setKoordinasi(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => null);
  }, [roleName]);

  const fetchProgram = useCallback(() => {
    if (!ALLOWED.includes(roleName)) return;
    setProgramLoading(true);
    api.get("/program-kegiatan")
      .then((r) => setProgramList(Array.isArray(r.data?.data) ? r.data.data : STATIC_PROGRAM))
      .catch(() => setProgramList(STATIC_PROGRAM))
      .finally(() => setProgramLoading(false));
  }, [roleName]);
  useEffect(() => { fetchProgram(); }, [fetchProgram]);

  const fetchDok = useCallback(() => {
    if (!ALLOWED.includes(roleName)) return;
    setDokLoading(true);
    api.get("/dokumen-perencanaan")
      .then((r) => setDokList(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setDokList([]))
      .finally(() => setDokLoading(false));
  }, [roleName]);
  useEffect(() => { fetchDok(); }, [fetchDok]);

  // Auth guard AFTER all hooks
  if (!ALLOWED.includes(roleName)) return <Navigate to="/" replace />;

  // Derived
  const programDeviasi = programList.filter((p) => {
    const tgt = p.target_fisik ?? p.target ?? 0;
    const rea = p.realisasi_fisik ?? p.realisasi ?? 0;
    return tgt - rea > 10;
  });
  const dokDraft = dokList.filter((d) => ["draft", "in_review"].includes(d.status));
  const bidangBelumMasuk = koordinasi.filter((b) => !b.data_masuk);

  const chartData = programList.map((p) => ({
    name: p.bidang || p.nama_kegiatan || "—",
    Target: p.target_fisik ?? p.target ?? 0,
    Realisasi: p.realisasi_fisik ?? p.realisasi ?? 0,
  }));

  const anggaranData = programList.map((p) => ({
    name: p.bidang || p.nama_kegiatan || "—",
    Pagu: Math.round((p.anggaran_pagu ?? p.anggaran ?? 0) / 1_000_000),
    Realisasi: Math.round((p.anggaran_realisasi ?? p.real_anggaran ?? 0) / 1_000_000),
  }));

  async function handleBuatDok(e) {
    e.preventDefault();
    if (!formJudul.trim()) return;
    setFormSaving(true);
    setFormMsg(null);
    try {
      await api.post("/dokumen-perencanaan", {
        jenis_dokumen: formJenis,
        judul: formJudul,
        periode: formPeriode || undefined,
        catatan: formCatatan || undefined,
      });
      setFormJudul(""); setFormPeriode(""); setFormCatatan("");
      setFormMsg({ ok: true, text: "Dokumen berhasil dibuat." });
      fetchDok();
    } catch { setFormMsg({ ok: false, text: "Gagal membuat dokumen." }); }
    finally { setFormSaving(false); }
  }

  async function handleSubmitDok(id) {
    try {
      await api.post(`/dokumen-perencanaan/${id}/submit`);
      fetchDok();
    } catch { /* silent */ }
  }

  async function handleUpdateRealisasi(id) {
    const val = window.prompt("Masukkan realisasi fisik terkini (%):");
    if (val === null || isNaN(Number(val))) return;
    try {
      await api.put(`/program-kegiatan/${id}/update-realisasi`, { realisasi_fisik: Number(val) });
      fetchProgram();
    } catch { /* silent */ }
  }

  const kpiTiles = [
    { label: "Realisasi Program Rata-rata", value: kpi?.realisasi_pct != null ? `${kpi.realisasi_pct}%` : (programList.length ? `${Math.round(programList.reduce((s, p) => s + (p.realisasi_fisik ?? p.realisasi ?? 0), 0) / programList.length)}%` : "—"), color: T.primary },
    { label: "Program Deviasi > 10%", value: programDeviasi.length, color: programDeviasi.length > 2 ? T.danger : T.warning, warn: programDeviasi.length > 2 },
    { label: "Dokumen Draft Pending", value: dokDraft.length, color: dokDraft.length > 3 ? T.danger : T.accent, warn: dokDraft.length > 3 },
    { label: "Bidang Belum Kirim Data", value: bidangBelumMasuk.length, color: bidangBelumMasuk.length > 1 ? T.danger : T.success, warn: bidangBelumMasuk.length > 1 },
    { label: "Laporan Tepat Waktu", value: kpi?.lap_tepat_waktu_pct != null ? `${kpi.lap_tepat_waktu_pct}%` : "—", color: (kpi?.lap_tepat_waktu_pct ?? 100) < 90 ? T.danger : T.success, sub: kpi?.lap_tepat_waktu_pct < 90 ? "< 90% threshold" : null },
    { label: "Kegiatan Selesai Tepat Waktu", value: kpi?.kegiatan_tepat_waktu_pct != null ? `${kpi.kegiatan_tepat_waktu_pct}%` : "—", color: T.textSec },
  ];

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "analisis", label: `Analisis Program (${programList.length})` },
    { id: "dokumen", label: `Dokumen (${dokList.length})` },
    { id: "koordinasi", label: "Koordinasi Bidang" },
    { id: "laporan", label: "Laporan Berkala" },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <a href="#main-content" style={{ position: "absolute", left: -9999 }}
        onFocus={(e) => { e.target.style.left = "1rem"; }}
        onBlur={(e) => { e.target.style.left = "-9999px"; }}>
        Lewati ke konten utama
      </a>

      {/* Header */}
      <header role="banner"
        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, borderBottom: `3px solid ${T.accent}` }}
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div style={{ background: T.accent, width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📊</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>SIGAP MALUT</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Fungsional Perencanaan · {user?.name || user?.username || "—"}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {programDeviasi.length > 0 && (
            <span style={{ background: T.danger, color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              {programDeviasi.length} Deviasi
            </span>
          )}
          {dokDraft.length > 0 && (
            <span style={{ background: T.warning, color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              {dokDraft.length} Draft
            </span>
          )}
        </div>
      </header>

      {/* Nav Tabs */}
      <nav style={{ background: T.card, borderBottom: `1px solid ${T.border}` }} className="flex gap-1 px-4 pt-2 overflow-x-auto" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} role="tab" aria-selected={tab === t.id}
            style={{ padding: "9px 14px", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.primary : T.textSec, background: "none", border: "none", borderBottom: tab === t.id ? `3px solid ${T.primary}` : "3px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* ── RINGKASAN ── */}
        {tab === "ringkasan" && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, borderRadius: 14, padding: "20px 24px", color: "#fff" }}>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>Dashboard Fungsional Perencanaan</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3 }}>Analis Program & Penyusunan Dokumen Perencanaan — Sekretariat</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4" aria-live="polite">
              {kpiTiles.map((k) => <KpiTile key={k.label} {...k} />)}
            </div>

            {/* Alert deviasi */}
            {programDeviasi.length > 0 && (
              <div style={{ background: "#FFEBEE", border: `1px solid ${T.danger}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.danger, marginBottom: 8 }}>🚨 Program Deviasi dari Target</div>
                {programDeviasi.slice(0, 3).map((p, i) => {
                  const tgt = p.target_fisik ?? p.target ?? 0;
                  const rea = p.realisasi_fisik ?? p.realisasi ?? 0;
                  return (
                    <div key={p.id ?? i} style={{ fontSize: 12, color: T.textPri, marginBottom: 4 }}>
                      • <strong>{p.nama_kegiatan || p.bidang || "—"}</strong>: Target {tgt}% → Realisasi {rea}% (deviasi {tgt - rea}%)
                    </div>
                  );
                })}
                <button onClick={() => setTab("analisis")} style={{ fontSize: 12, color: T.danger, background: "none", border: "none", cursor: "pointer", marginTop: 4, fontWeight: 600 }}>
                  Lihat semua →
                </button>
              </div>
            )}

            {/* Preview realisasi chart ringkas */}
            {chartData.length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📈 Realisasi Fisik per Bidang</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Target" fill="#90CAF9" />
                    <Bar dataKey="Realisasi">
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.Realisasi >= entry.Target * 0.9 ? T.success : T.danger} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Notifikasi */}
            {notifList.length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPri, marginBottom: 10 }}>🔔 Notifikasi Terbaru</h2>
                {notifList.slice(0, 5).map((n, i) => (
                  <div key={n.id ?? i} style={{ borderBottom: `1px solid ${T.border}`, padding: "8px 0", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: n.read_at ? 400 : 600 }}>{n.message || "—"}</span>
                    <span style={{ fontSize: 11, color: T.textSec, whiteSpace: "nowrap", marginLeft: 8 }}>{n.created_at ? new Date(n.created_at).toLocaleString("id-ID") : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── ANALISIS PROGRAM ── */}
        {tab === "analisis" && (
          <div className="space-y-5">
            {/* Bar chart realisasi vs target */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>📊 Realisasi Fisik vs Target per Bidang</h2>
              {programLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Target" fill="#90CAF9" name="Target (%)" />
                    <Bar dataKey="Realisasi" name="Realisasi (%)">
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.Realisasi >= entry.Target * 0.9 ? T.success : T.danger} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Anggaran chart */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>💰 Pagu vs Realisasi Anggaran (juta Rp)</h2>
              {programLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={anggaranData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit="jt" />
                    <Tooltip formatter={(v) => `Rp ${v}jt`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Pagu" fill="#90CAF9" name="Pagu (jt)" />
                    <Bar dataKey="Realisasi" fill={T.success} name="Realisasi (jt)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tabel detail program */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>📋 Detail Program Kegiatan</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.bg }}>
                      {["Bidang / Kegiatan", "Target Fisik", "Realisasi", "Deviasi", "Serapan Anggaran", "Aksi"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: T.textPri, borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {programList.map((p, i) => {
                      const tgt = p.target_fisik ?? p.target ?? 0;
                      const rea = p.realisasi_fisik ?? p.realisasi ?? 0;
                      const dev = tgt - rea;
                      const pagu = p.anggaran_pagu ?? p.anggaran ?? 0;
                      const realAng = p.anggaran_realisasi ?? p.real_anggaran ?? 0;
                      const serapan = pagu ? Math.round((realAng / pagu) * 100) : 0;
                      return (
                        <tr key={p.id ?? i} style={{ borderBottom: `1px solid ${T.border}`, background: dev > 10 ? "#FFF8F8" : "transparent" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 600 }}>{p.nama_kegiatan || p.bidang || "—"}</td>
                          <td style={{ padding: "10px 12px" }}>{tgt}%</td>
                          <td style={{ padding: "10px 12px", color: rea >= tgt * 0.9 ? T.success : T.danger, fontWeight: 600 }}>{rea}%</td>
                          <td style={{ padding: "10px 12px", color: dev > 10 ? T.danger : T.success, fontWeight: dev > 10 ? 700 : 400 }}>
                            {dev > 0 ? `−${dev}%` : `+${Math.abs(dev)}%`}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ height: 6, width: 80, background: "#E0E0E0", borderRadius: 3 }}>
                                <div style={{ height: 6, width: `${Math.min(serapan, 100)}%`, background: serapan < 70 ? T.danger : T.success, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11 }}>{serapan}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {p.id && (
                              <button onClick={() => handleUpdateRealisasi(p.id)}
                                style={{ background: T.primary, color: "#fff", padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11 }}>
                                Update
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── DOKUMEN ── */}
        {tab === "dokumen" && (
          <div className="space-y-5">
            {/* Form buat dokumen baru */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>➕ Buat Dokumen Perencanaan</h2>
              <form onSubmit={handleBuatDok} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Jenis Dokumen</label>
                    <select value={formJenis} onChange={(e) => setFormJenis(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4 }}>
                      {JENIS_DOK.map((j) => <option key={j.value} value={j.value}>{j.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Periode</label>
                    <input type="text" value={formPeriode} onChange={(e) => setFormPeriode(e.target.value)}
                      placeholder="cth: 2026-Q1 atau 2026-03"
                      style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Judul Dokumen</label>
                  <input type="text" value={formJudul} onChange={(e) => setFormJudul(e.target.value)}
                    placeholder="Masukkan judul dokumen..."
                    style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Catatan (opsional)</label>
                  <textarea value={formCatatan} onChange={(e) => setFormCatatan(e.target.value.slice(0, 500))} rows={2}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4, resize: "vertical" }} />
                </div>
                {formMsg && (
                  <div style={{ fontSize: 12, color: formMsg.ok ? T.success : T.danger, fontWeight: 600 }}>
                    {formMsg.ok ? "✓" : "✗"} {formMsg.text}
                  </div>
                )}
                <button type="submit" disabled={formSaving || !formJudul.trim()}
                  style={{ background: formSaving || !formJudul.trim() ? "#B0BEC5" : T.primary, color: "#fff", padding: "8px 20px", borderRadius: 8, border: "none", cursor: formSaving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
                  {formSaving ? "Menyimpan..." : "💾 Simpan Draft"}
                </button>
              </form>
            </div>

            {/* Daftar dokumen */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>📁 Daftar Dokumen Perencanaan</h2>
              {dokLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
                : dokList.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Belum ada dokumen.</p>
                : dokList.map((d) => (
                  <div key={d.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${STATUS_COLOR[d.status] || "#546E7A"}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: T.textPri }}>{d.judul}</div>
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                          {JENIS_DOK.find((j) => j.value === d.jenis_dokumen)?.label || d.jenis_dokumen}
                          {d.periode ? ` · ${d.periode}` : ""}
                        </div>
                        {d.catatan && <div style={{ fontSize: 11, color: T.textSec, marginTop: 4, fontStyle: "italic" }}>"{d.catatan}"</div>}
                        <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>
                          {d.created_at ? new Date(d.created_at).toLocaleDateString("id-ID") : ""}
                        </div>
                      </div>
                      <StatusChip status={d.status || "draft"} />
                    </div>
                    {d.status === "draft" && (
                      <button onClick={() => handleSubmitDok(d.id)}
                        style={{ marginTop: 8, background: T.primary, color: "#fff", padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>
                        ↑ Submit ke Kasubag
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── KOORDINASI BIDANG ── */}
        {tab === "koordinasi" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 6 }}>🤝 Status Data dari Bidang</h2>
            <p style={{ fontSize: 12, color: T.textSec, marginBottom: 16 }}>Data dibutuhkan untuk penyusunan laporan konsolidasi. Hubungi bidang yang belum mengirim.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(koordinasi.length > 0 ? koordinasi : BIDANG_LIST.map((b) => ({ ...b, data_masuk: false, terakhir_update: null }))).map((b) => (
                <div key={b.key || b.label}
                  style={{ border: `1px solid ${b.data_masuk ? T.success : T.danger}`, borderRadius: 12, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.textPri }}>{b.label}</div>
                    {b.terakhir_update && (
                      <div style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>
                        Update: {new Date(b.terakhir_update).toLocaleDateString("id-ID")}
                      </div>
                    )}
                    {!b.data_masuk && (
                      <div style={{ fontSize: 11, color: T.danger, marginTop: 3, fontWeight: 600 }}>⚠ Data belum diterima</div>
                    )}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28 }}>{b.data_masuk ? "✅" : "⏳"}</div>
                    <div style={{ fontSize: 10, color: b.data_masuk ? T.success : T.danger, fontWeight: 600 }}>
                      {b.data_masuk ? "Sudah" : "Belum"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LAPORAN BERKALA ── */}
        {tab === "laporan" && (
          <div className="space-y-5">
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>📋 Jadwal Laporan Berkala</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.bg }}>
                      {["Jenis Laporan", "Frekuensi", "Deadline", "Status"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: T.textPri, borderBottom: `2px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { jenis: "Laporan Bulanan", frekuensi: "Setiap bulan", deadline: "Tgl 5 bulan berikutnya", status: dokList.some((d) => d.jenis_dokumen === "lap_bulanan" && d.status === "published") ? "published" : "draft" },
                      { jenis: "Laporan Triwulan", frekuensi: "Per 3 bulan", deadline: "Tgl 10 setelah triwulan", status: dokList.some((d) => d.jenis_dokumen === "lap_triwulan" && d.status === "published") ? "published" : "draft" },
                      { jenis: "Renja (Rencana Kerja)", frekuensi: "Tahunan", deadline: "Oktober tahun berjalan", status: dokList.some((d) => d.jenis_dokumen === "renja" && d.status === "disetujui") ? "disetujui" : "draft" },
                      { jenis: "RKA", frekuensi: "Tahunan", deadline: "Agustus tahun berjalan", status: dokList.some((d) => d.jenis_dokumen === "rka" && d.status === "disetujui") ? "disetujui" : "draft" },
                      { jenis: "LAKIP", frekuensi: "Tahunan", deadline: "Februari tahun berikutnya", status: dokList.some((d) => d.jenis_dokumen === "lakip" && d.status === "published") ? "published" : "draft" },
                      { jenis: "LKPJ", frekuensi: "Tahunan", deadline: "Maret tahun berikutnya", status: dokList.some((d) => d.jenis_dokumen === "lkpj" && d.status === "published") ? "published" : "draft" },
                    ].map((r) => (
                      <tr key={r.jenis} style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.jenis}</td>
                        <td style={{ padding: "10px 12px", color: T.textSec }}>{r.frekuensi}</td>
                        <td style={{ padding: "10px 12px", color: T.textSec }}>{r.deadline}</td>
                        <td style={{ padding: "10px 12px" }}><StatusChip status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: "#E3F2FD", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: T.secondary }}>
                Buat laporan baru di tab <strong>Dokumen</strong> — pilih jenis laporan, isi judul dan periode, lalu submit ke Kasubag.
              </div>
            </div>
          </div>
        )}

      </main>

      <footer role="contentinfo" style={{ textAlign: "center", fontSize: 11, color: T.textSec, padding: "12px 0", borderTop: `1px solid ${T.border}`, marginTop: 24 }}>
        SIGAP-MALUT © 2026 · Fungsional Perencanaan — Sekretariat Dinas Pangan
      </footer>
    </div>
  );
}
