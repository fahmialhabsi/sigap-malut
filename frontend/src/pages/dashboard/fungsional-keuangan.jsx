// frontend/src/pages/dashboard/fungsional-keuangan.jsx
// Role: FUNGSIONAL_KEUANGAN / PPK — Penatausahaan Keuangan Sekretariat
// Tabs: ringkasan | spp_spm | realisasi | gaji | barang | laporan

import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../services/api.js";

// ── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary:  "#1B4F8A",
  secondary:"#0D3360",
  accent:   "#2E7D32",
  danger:   "#C62828",
  warning:  "#F57C00",
  success:  "#2E7D32",
  bg:       "#EFF3FB",
  card:     "#FFFFFF",
  border:   "#BBDEFB",
  textPri:  "#0D1B2A",
  textSec:  "#455A64",
};

const ALLOWED = [
  "fungsional_analis_keuangan","fungsional_keuangan","fungsional",
  "pejabat_fungsional","jabatan_fungsional","ppk",
  "super_admin","sekretaris","kepala_dinas",
];

const TABS = [
  { id:"ringkasan",  label:"Ringkasan" },
  { id:"spp_spm",    label:"SPP / SPM" },
  { id:"realisasi",  label:"Realisasi" },
  { id:"gaji",       label:"Gaji" },
  { id:"barang",     label:"Barang & Jasa" },
  { id:"laporan",    label:"Laporan" },
];

const SPP_CHECKLIST_ITEMS = [
  "Kelengkapan dokumen dasar (SPK/Kontrak/BAST)",
  "Kesesuaian anggaran dengan DIPA/DPA",
  "Kebenaran perhitungan dan kode rekening",
  "Validitas tanda tangan PPTK",
  "Bukti pendukung (kuitansi, faktur pajak)",
];

const MODUL_KEU = [
  { kode:"SEK-KEU", label:"Keuangan" },
  { kode:"SEK-LKT", label:"Laporan Keuangan Tahunan" },
  { kode:"SEK-LKS", label:"Laporan Keuangan Semester" },
  { kode:"SEK-LUP", label:"Laporan Uang Persediaan" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getUser() {
  try {
    const raw = sessionStorage.getItem("auth-store") || localStorage.getItem("auth-store");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.user) return parsed.state.user;
    }
  } catch { /* silent */ }
  try {
    const raw = localStorage.getItem("user");
    if (raw) return JSON.parse(raw);
  } catch { /* silent */ }
  return null;
}

const fmt = (n) => {
  if (n == null) return "–";
  const v = Number(n);
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(2)} M`;
  if (v >= 1_000_000)     return `Rp ${(v / 1_000_000).toFixed(1)} jt`;
  return `Rp ${v.toLocaleString("id-ID")}`;
};

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
      padding: "16px 20px", minWidth: 160,
    }}>
      <div style={{ fontSize: 12, color: T.textSec, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || T.primary }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ text, color }) {
  const map = {
    diajukan:  { bg:"#FFF3E0", fg:"#E65100" },
    diverifikasi: { bg:"#E8F5E9", fg:"#2E7D32" },
    dikembalikan: { bg:"#FFEBEE", fg:"#C62828" },
    diterima:  { bg:"#E8F5E9", fg:"#1B5E20" },
    pending:   { bg:"#FFF3E0", fg:"#F57C00" },
    selesai:   { bg:"#E8F5E9", fg:"#2E7D32" },
    default:   { bg:"#ECEFF1", fg:"#546E7A" },
  };
  const s = map[text?.toLowerCase()] || map.default;
  return (
    <span style={{
      background: s.bg, color: s.fg, borderRadius: 4,
      padding: "2px 8px", fontSize: 11, fontWeight: 600,
    }}>
      {text || "–"}
    </span>
  );
}

// ── Static fallback for rekening anggaran chart ───────────────────────────────
const STATIC_REKENING = [
  { kode: "5.1.01", nama: "Belanja Pegawai",      pagu: 850_000_000, realisasi: 720_000_000 },
  { kode: "5.2.01", nama: "Belanja Barang",        pagu: 420_000_000, realisasi: 315_000_000 },
  { kode: "5.2.02", nama: "Belanja Jasa",          pagu: 180_000_000, realisasi: 162_000_000 },
  { kode: "5.2.03", nama: "Belanja Pemeliharaan",  pagu: 95_000_000,  realisasi: 78_000_000  },
  { kode: "5.2.04", nama: "Belanja Perjalanan",    pagu: 130_000_000, realisasi: 45_000_000  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function FungsionalKeuangan() {
  const [tab, setTab]         = useState("ringkasan");
  const [kpi, setKpi]         = useState(null);
  const [sppList, setSppList] = useState([]);
  const [rekening, setRekening] = useState([]);
  const [gajiList, setGajiList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [lapList, setLapList] = useState([]);
  const [checklist, setChecklist] = useState({});
  const [activeSpp, setActiveSpp] = useState(null);
  const [loading, setLoading]  = useState(false);
  const [notif, setNotif]      = useState(null);

  const user = getUser();
  const role = (user?.role || user?.roleName || "").toLowerCase();
  const allowed = ALLOWED.includes(role);

  // Hooks must be declared before any conditional return
  const showNotif = useCallback((msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  }, []);

  const loadKpi = useCallback(async () => {
    try {
      const r = await api.get("/dashboard/fungsional-analis/summary");
      setKpi(r.data?.data || r.data);
    } catch { /* silent */ }
  }, []);

  const loadSpp = useCallback(async () => {
    try {
      const r = await api.get("/dashboard/fungsional-analis/spp-pending");
      setSppList(r.data?.data || []);
    } catch { /* silent */ }
  }, []);

  const loadRekening = useCallback(async () => {
    try {
      const r = await api.get("/rekening-anggaran");
      const data = r.data?.data || [];
      setRekening(data.length ? data : STATIC_REKENING);
    } catch {
      setRekening(STATIC_REKENING);
    }
  }, []);

  const loadGaji = useCallback(async () => {
    try {
      const r = await api.get("/dashboard/fungsional-analis/gaji-status");
      setGajiList(r.data?.data || []);
    } catch { /* silent */ }
  }, []);

  const loadLaporan = useCallback(async () => {
    try {
      const r = await api.get("/spj?jenis=laporan&limit=20");
      setLapList(r.data?.data || []);
    } catch { /* silent */ }
  }, []);

  const loadBarang = useCallback(async () => {
    try {
      const r = await api.get("/spj?jenis=barang&limit=20");
      setBarangList(r.data?.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    loadKpi();
    loadSpp();
    loadRekening();
  }, [allowed, loadKpi, loadSpp, loadRekening]);

  useEffect(() => {
    if (!allowed) return;
    if (tab === "gaji")   loadGaji();
    if (tab === "barang") loadBarang();
    if (tab === "laporan") loadLaporan();
  }, [tab, allowed, loadGaji, loadBarang, loadLaporan]);

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!allowed) return <Navigate to="/unauthorized" replace />;

  // ── Actions ──────────────────────────────────────────────────────────────
  const allChecked = (id) =>
    SPP_CHECKLIST_ITEMS.every((_, i) => checklist[`${id}-${i}`]);

  const handleVerifikasiSPP = async (id) => {
    if (!allChecked(id)) {
      showNotif("Lengkapi semua checklist verifikasi sebelum melanjutkan.", "warning");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/spj/${id}/verifikasi-ppk`);
      showNotif("SPP berhasil diverifikasi. SPM dapat diterbitkan.");
      await loadSpp();
      setActiveSpp(null);
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal verifikasi SPP.", "error");
    } finally { setLoading(false); }
  };

  const handleKembalikanSPP = async (id) => {
    const catatan = window.prompt("Catatan pengembalian SPP:");
    if (!catatan) return;
    setLoading(true);
    try {
      await api.put(`/spj/${id}/kembalikan-ppk`, { catatan });
      showNotif("SPP dikembalikan ke PPTK.", "warning");
      await loadSpp();
      setActiveSpp(null);
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal mengembalikan SPP.", "error");
    } finally { setLoading(false); }
  };

  const handleTerbitkanSPM = async (id) => {
    if (!window.confirm("Terbitkan SPM untuk SPP ini?")) return;
    setLoading(true);
    try {
      await api.post(`/spj/${id}/terbitkan-spm`);
      showNotif("SPM berhasil diterbitkan.");
      await loadSpp();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal menerbitkan SPM.", "error");
    } finally { setLoading(false); }
  };

  const handleInputSP2D = async (id) => {
    const nomor = window.prompt("Nomor SP2D:");
    if (!nomor) return;
    const tanggal = window.prompt("Tanggal SP2D (YYYY-MM-DD):");
    if (!tanggal) return;
    const nilai = window.prompt("Nilai SP2D (angka):");
    if (!nilai) return;
    setLoading(true);
    try {
      await api.put(`/spj/${id}/input-sp2d`, { sp2d_nomor: nomor, sp2d_tanggal: tanggal, sp2d_nilai: Number(nilai) });
      showNotif("Data SP2D berhasil diinput.");
      await loadSpp();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal input SP2D.", "error");
    } finally { setLoading(false); }
  };

  // ── Render Helpers ────────────────────────────────────────────────────────
  const rekeningChart = rekening.map((r) => ({
    nama:       r.nama?.length > 14 ? r.nama.substring(0, 14) + "…" : (r.nama || r.kode),
    pagu:       Number(r.pagu || r.anggaran_pagu || 0) / 1_000_000,
    realisasi:  Number(r.realisasi || r.anggaran_realisasi || 0) / 1_000_000,
    pct:        pct(Number(r.realisasi || r.anggaran_realisasi || 0), Number(r.pagu || r.anggaran_pagu || 0)),
  }));

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      {/* Skip link */}
      <a href="#main-content" style={{
        position: "absolute", left: -9999, top: 8,
        background: T.primary, color: "#fff", padding: "6px 12px",
        borderRadius: 4, zIndex: 9999, fontSize: 13,
      }}
        onFocus={(e) => { e.target.style.left = "8px"; }}
        onBlur={(e) => { e.target.style.left = "-9999px"; }}
      >
        Lewati ke konten utama
      </a>

      {/* Header */}
      <header role="banner" style={{
        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.secondary} 100%)`,
        color: "#fff", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Dashboard Fungsional Keuangan</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Analisis Keuangan & Penatausahaan — {user?.name || user?.username || "—"}
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>{new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</div>
      </header>

      {/* Notifikasi */}
      {notif && (
        <div aria-live="polite" style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          background: notif.type === "error" ? T.danger : notif.type === "warning" ? T.warning : T.accent,
          color: "#fff", padding: "10px 20px", borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", fontSize: 13, maxWidth: 360,
        }}>
          {notif.msg}
        </div>
      )}

      {/* Tab Bar */}
      <nav style={{ background: T.card, borderBottom: `2px solid ${T.border}`, padding: "0 24px", display: "flex", gap: 4 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "12px 18px", border: "none", cursor: "pointer", fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? T.primary : T.textSec,
              borderBottom: tab === t.id ? `3px solid ${T.primary}` : "3px solid transparent",
              background: "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main id="main-content" style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── TAB: RINGKASAN ───────────────────────────────────────────── */}
        {tab === "ringkasan" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Ringkasan Keuangan</h2>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KpiCard label="SPP Pending Verifikasi" value={kpi?.spp_pending ?? sppList.filter(s => s.status === "diajukan").length} color={T.warning} />
              <KpiCard label="SPM Diterbitkan (bulan ini)" value={kpi?.spm_bulan ?? "–"} />
              <KpiCard label="Realisasi Anggaran" value={kpi?.realisasi_pct != null ? `${kpi.realisasi_pct}%` : "–"} sub="dari total pagu" color={T.accent} />
              <KpiCard label="Sisa Kas / UP" value={fmt(kpi?.saldo_kas)} sub="uang persediaan" />
              <KpiCard label="Laporan Belum Submit" value={kpi?.lap_pending ?? "–"} color={T.danger} />
            </div>

            {/* Rekening chart summary */}
            <div style={{ background: T.card, borderRadius: 10, padding: 20, marginBottom: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: T.primary }}>Realisasi per Rekening Anggaran (juta Rp)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={rekeningChart} margin={{ top: 8, right: 20, left: 0, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nama" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `${v.toFixed(1)} jt`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="pagu" name="Pagu" fill="#90CAF9" />
                  <Bar dataKey="realisasi" name="Realisasi" fill={T.primary}>
                    {rekeningChart.map((entry, i) => (
                      <Cell key={i} fill={entry.pct >= 90 ? T.warning : T.accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Modul shortcut */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {MODUL_KEU.map((m) => (
                <a key={m.kode} href={`/modul/${m.kode.toLowerCase()}`} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: "12px 16px", textDecoration: "none", color: T.primary,
                  fontWeight: 600, fontSize: 13, display: "block",
                }}>
                  <div style={{ fontSize: 10, color: T.textSec }}>{m.kode}</div>
                  {m.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: SPP / SPM ───────────────────────────────────────────── */}
        {tab === "spp_spm" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Verifikasi SPP & Penerbitan SPM</h2>

            {sppList.length === 0 && (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Tidak ada SPP yang pending verifikasi.
              </div>
            )}

            {sppList.map((spp) => (
              <div key={spp.id} style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                padding: 20, marginBottom: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.textPri }}>{spp.nomor_spp || spp.nomor || `SPP-${spp.id?.slice(0,8)}`}</div>
                    <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                      {spp.kegiatan || spp.uraian || "–"} &nbsp;·&nbsp; {fmt(spp.nilai || spp.jumlah)}
                    </div>
                    <div style={{ fontSize: 12, color: T.textSec }}>
                      PPTK: {spp.pptk_nama || "–"} &nbsp;·&nbsp; {spp.created_at ? new Date(spp.created_at).toLocaleDateString("id-ID") : "–"}
                    </div>
                  </div>
                  <Badge text={spp.status} />
                </div>

                {/* Expand checklist */}
                {activeSpp === spp.id ? (
                  <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Checklist Verifikasi PPK</div>
                    {SPP_CHECKLIST_ITEMS.map((item, i) => (
                      <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={!!checklist[`${spp.id}-${i}`]}
                          onChange={(e) => setChecklist((prev) => ({ ...prev, [`${spp.id}-${i}`]: e.target.checked }))}
                        />
                        {item}
                      </label>
                    ))}

                    {/* SPM info if already verified */}
                    {spp.spm_nomor && (
                      <div style={{ background: "#E8F5E9", borderRadius: 6, padding: "8px 12px", fontSize: 12, marginTop: 8 }}>
                        SPM: {spp.spm_nomor} · {spp.spm_tanggal ? new Date(spp.spm_tanggal).toLocaleDateString("id-ID") : "–"}
                        {spp.sp2d_nomor && ` | SP2D: ${spp.sp2d_nomor} · ${fmt(spp.sp2d_nilai)}`}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      {(spp.status === "diajukan" || spp.status === "pending") && (
                        <>
                          <button
                            onClick={() => handleVerifikasiSPP(spp.id)}
                            disabled={!allChecked(spp.id) || loading}
                            style={{
                              background: allChecked(spp.id) ? T.accent : "#BDBDBD",
                              color: "#fff", border: "none", borderRadius: 6,
                              padding: "8px 16px", cursor: allChecked(spp.id) ? "pointer" : "not-allowed",
                              fontSize: 12, fontWeight: 600,
                            }}
                          >
                            Verifikasi SPP
                          </button>
                          <button
                            onClick={() => handleKembalikanSPP(spp.id)}
                            disabled={loading}
                            style={{
                              background: T.danger, color: "#fff", border: "none",
                              borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12,
                            }}
                          >
                            Kembalikan
                          </button>
                        </>
                      )}
                      {spp.status === "diverifikasi" && !spp.spm_nomor && (
                        <button
                          onClick={() => handleTerbitkanSPM(spp.id)}
                          disabled={loading}
                          style={{
                            background: T.primary, color: "#fff", border: "none",
                            borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                          }}
                        >
                          Terbitkan SPM
                        </button>
                      )}
                      {spp.spm_nomor && !spp.sp2d_nomor && (
                        <button
                          onClick={() => handleInputSP2D(spp.id)}
                          disabled={loading}
                          style={{
                            background: T.secondary, color: "#fff", border: "none",
                            borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12,
                          }}
                        >
                          Input SP2D
                        </button>
                      )}
                      <button
                        onClick={() => setActiveSpp(null)}
                        style={{
                          background: "transparent", color: T.textSec, border: `1px solid ${T.border}`,
                          borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12,
                        }}
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveSpp(spp.id)}
                    style={{
                      marginTop: 12, background: "transparent", color: T.primary,
                      border: `1px solid ${T.primary}`, borderRadius: 6,
                      padding: "6px 14px", cursor: "pointer", fontSize: 12,
                    }}
                  >
                    Buka Detail & Checklist
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: REALISASI ───────────────────────────────────────────── */}
        {tab === "realisasi" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Realisasi Anggaran per Rekening</h2>
            <div style={{ background: T.card, borderRadius: 10, padding: 20, marginBottom: 20, border: `1px solid ${T.border}` }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={rekeningChart} margin={{ top: 8, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nama" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} unit=" jt" />
                  <Tooltip formatter={(v) => `Rp ${v.toFixed(1)} jt`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="pagu" name="Pagu (jt)" fill="#90CAF9" />
                  <Bar dataKey="realisasi" name="Realisasi (jt)" fill={T.primary}>
                    {rekeningChart.map((entry, i) => (
                      <Cell key={i} fill={entry.pct >= 90 ? T.warning : T.accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.primary, color: "#fff" }}>
                    {["Kode Rekening","Uraian","Pagu","Realisasi","Sisa","% Realisasi"].map((h) => (
                      <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rekening.map((r, i) => {
                    const pagu  = Number(r.pagu || r.anggaran_pagu || 0);
                    const real  = Number(r.realisasi || r.anggaran_realisasi || 0);
                    const sisa  = pagu - real;
                    const p     = pct(real, pagu);
                    return (
                      <tr key={r.id || i} style={{ background: i % 2 === 0 ? "#F8FBFF" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>{r.kode || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{r.nama || "–"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(pagu)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(real)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: sisa < 0 ? T.danger : T.textPri }}>{fmt(sisa)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <span style={{
                            background: p >= 90 ? "#FFF3E0" : p >= 60 ? "#E8F5E9" : "#FFEBEE",
                            color: p >= 90 ? T.warning : p >= 60 ? T.accent : T.danger,
                            borderRadius: 4, padding: "2px 8px", fontWeight: 600, fontSize: 12,
                          }}>{p}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: GAJI ────────────────────────────────────────────────── */}
        {tab === "gaji" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Penggajian & Tunjangan</h2>
            {gajiList.length === 0 ? (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Tidak ada data gaji bulan ini.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.primary, color: "#fff" }}>
                      {["Nama","Jabatan","Gaji Pokok","Tunjangan","Total","Status","Aksi"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gajiList.map((g, i) => (
                      <tr key={g.id || i} style={{ background: i % 2 === 0 ? "#F8FBFF" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "8px 12px", fontWeight: 500 }}>{g.nama || "–"}</td>
                        <td style={{ padding: "8px 12px", fontSize: 12 }}>{g.jabatan || "–"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.gaji_pokok)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.tunjangan)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmt((g.gaji_pokok || 0) + (g.tunjangan || 0))}</td>
                        <td style={{ padding: "8px 12px" }}><Badge text={g.status} /></td>
                        <td style={{ padding: "8px 12px" }}>
                          <button style={{
                            background: T.primary, color: "#fff", border: "none",
                            borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 11,
                          }} onClick={() => showNotif("Slip gaji akan diunduh…")}>
                            Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: BARANG & JASA ───────────────────────────────────────── */}
        {tab === "barang" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Pengadaan Barang & Jasa</h2>
            {barangList.length === 0 ? (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Belum ada data pengadaan.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.primary, color: "#fff" }}>
                      {["No SPJ","Uraian","Vendor","Nilai","Tgl Tagihan","Status","Aksi"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {barangList.map((b, i) => (
                      <tr key={b.id || i} style={{ background: i % 2 === 0 ? "#F8FBFF" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>{b.nomor || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{b.uraian || b.kegiatan || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{b.vendor || b.pihak_ketiga || "–"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(b.nilai || b.jumlah)}</td>
                        <td style={{ padding: "8px 12px" }}>{b.tgl_tagihan || b.created_at ? new Date(b.tgl_tagihan || b.created_at).toLocaleDateString("id-ID") : "–"}</td>
                        <td style={{ padding: "8px 12px" }}><Badge text={b.status} /></td>
                        <td style={{ padding: "8px 12px" }}>
                          {(b.status === "diajukan" || b.status === "pending") && (
                            <button
                              onClick={() => handleVerifikasiSPP(b.id)}
                              style={{
                                background: T.accent, color: "#fff", border: "none",
                                borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 11,
                              }}
                            >
                              Proses
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: LAPORAN ─────────────────────────────────────────────── */}
        {tab === "laporan" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Laporan Keuangan</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Laporan Realisasi Anggaran",  jenis:"lra",   frekuensi:"Bulanan",    deadline:"Akhir bulan" },
                { label: "Neraca Keuangan",              jenis:"neraca",frekuensi:"Semesteran", deadline:"10 Juli / 10 Jan" },
                { label: "Laporan Arus Kas",             jenis:"lak",   frekuensi:"Triwulanan", deadline:"10 bulan ke-4" },
                { label: "Catatan atas Laporan (CaLK)",  jenis:"calk",  frekuensi:"Tahunan",    deadline:"28 Feb" },
                { label: "Laporan UP / GUP",             jenis:"gup",   frekuensi:"Per SPJ",    deadline:"Sebelum UP habis" },
                { label: "Laporan Pajak Bulanan",        jenis:"pajak", frekuensi:"Bulanan",    deadline:"Tgl 20 bulan ini" },
              ].map((lap) => {
                const found = lapList.find((l) => l.jenis === lap.jenis || l.jenis_dokumen === lap.jenis);
                return (
                  <div key={lap.jenis} style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                    padding: "16px 20px",
                  }}>
                    <div style={{ fontWeight: 600, color: T.textPri, marginBottom: 4 }}>{lap.label}</div>
                    <div style={{ fontSize: 12, color: T.textSec }}>
                      Frekuensi: {lap.frekuensi} &nbsp;·&nbsp; Deadline: {lap.deadline}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Badge text={found ? found.status : "belum"} />
                    </div>
                    <button
                      onClick={() => showNotif(`Laporan ${lap.label} akan diunduh.`)}
                      style={{
                        marginTop: 12, background: T.primary, color: "#fff", border: "none",
                        borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12,
                      }}
                    >
                      Unduh / Lihat
                    </button>
                  </div>
                );
              })}
            </div>

            {lapList.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.primary, color: "#fff" }}>
                      {["Laporan","Jenis","Periode","Status","Aksi"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lapList.map((l, i) => (
                      <tr key={l.id || i} style={{ background: i % 2 === 0 ? "#F8FBFF" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "8px 12px", fontWeight: 500 }}>{l.judul || l.nama || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{l.jenis || l.jenis_dokumen || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{l.periode || "–"}</td>
                        <td style={{ padding: "8px 12px" }}><Badge text={l.status} /></td>
                        <td style={{ padding: "8px 12px" }}>
                          <button
                            onClick={() => showNotif("Laporan akan diunduh…")}
                            style={{
                              background: T.secondary, color: "#fff", border: "none",
                              borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 11,
                            }}
                          >
                            Unduh
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
