// frontend/src/ui/dashboards/DashboardBendaharaGaji.jsx
// Role: BENDAHARA GAJI — Penggajian, Tunjangan, Potongan, SP2D Gaji
// Tabs: ringkasan | daftar_gaji | tunjangan | potongan | slip | laporan

import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../services/api.js";

// ── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary:  "#1A237E",
  secondary:"#0D47A1",
  accent:   "#00838F",
  danger:   "#B71C1C",
  warning:  "#E65100",
  success:  "#2E7D32",
  bg:       "#E8EAF6",
  card:     "#FFFFFF",
  border:   "#9FA8DA",
  textPri:  "#0A0E2A",
  textSec:  "#546E7A",
};

const ALLOWED = [
  "bendahara_gaji", "bendahara",
  "super_admin", "sekretaris", "kepala_dinas",
];

const TABS = [
  { id: "ringkasan",    label: "Ringkasan" },
  { id: "daftar_gaji",  label: "Daftar Gaji" },
  { id: "tunjangan",    label: "Tunjangan" },
  { id: "potongan",     label: "Potongan" },
  { id: "slip",         label: "Slip Gaji" },
  { id: "laporan",      label: "Laporan" },
];

const BULAN_NAMA = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const JENIS_TUNJANGAN = [
  { kode: "tunjangan_jabatan",    label: "Tunjangan Jabatan" },
  { kode: "tunjangan_keluarga",   label: "Tunjangan Keluarga" },
  { kode: "tunjangan_makan",      label: "Tunjangan Makan" },
  { kode: "tunjangan_transport",  label: "Tunjangan Transport" },
  { kode: "tunjangan_kinerja",    label: "Tunjangan Kinerja (TPP)" },
];

const JENIS_POTONGAN = [
  { kode: "bpjs_kesehatan",  label: "BPJS Kesehatan (1%)" },
  { kode: "bpjs_tk",         label: "BPJS Ketenagakerjaan (3%)" },
  { kode: "tapera",          label: "Tapera (0.5%)" },
  { kode: "pph21",           label: "PPh 21" },
  { kode: "taspen",          label: "Iuran Pensiun Taspen (4.75%)" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getUser() {
  try {
    const raw = sessionStorage.getItem("auth-store") || localStorage.getItem("auth-store");
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.state?.user) return p.state.user;
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

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
      padding: "16px 20px", minWidth: 155,
    }}>
      <div style={{ fontSize: 12, color: T.textSec, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || T.primary }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ text }) {
  const map = {
    pending:  { bg: "#FFF3E0", fg: "#E65100" },
    dibayar:  { bg: "#E8F5E9", fg: "#2E7D32" },
    ditahan:  { bg: "#FFEBEE", fg: "#B71C1C" },
    proses:   { bg: "#E3F2FD", fg: "#1565C0" },
  };
  const s = map[(text || "").toLowerCase()] || { bg: "#ECEFF1", fg: "#546E7A" };
  return (
    <span style={{
      background: s.bg, color: s.fg, borderRadius: 4,
      padding: "2px 8px", fontSize: 11, fontWeight: 600,
    }}>
      {text || "–"}
    </span>
  );
}

// ── Static fallback ───────────────────────────────────────────────────────────
const STATIC_GAJI = [
  { id: "s1", nama: "Ahmad Syarif", jabatan: "Kepala Bidang", golongan: "IV/a", gaji_pokok: 3_890_000, tunjangan: 2_100_000, potongan: 480_000, status: "dibayar" },
  { id: "s2", nama: "Siti Rahmawati", jabatan: "Kasubag", golongan: "III/d", gaji_pokok: 3_210_000, tunjangan: 1_650_000, potongan: 385_000, status: "dibayar" },
  { id: "s3", nama: "Budi Santoso", jabatan: "Staf Pelaksana", golongan: "III/b", gaji_pokok: 2_760_000, tunjangan: 980_000, potongan: 310_000, status: "pending" },
  { id: "s4", nama: "Nurul Hidayah", jabatan: "Fungsional Analis", golongan: "III/c", gaji_pokok: 2_990_000, tunjangan: 1_420_000, potongan: 355_000, status: "pending" },
  { id: "s5", nama: "Yusuf Maulana", jabatan: "Staf TU", golongan: "II/d", gaji_pokok: 2_200_000, tunjangan: 720_000, potongan: 265_000, status: "dibayar" },
];

const STATIC_TREND = [
  { bulan: "Jan", bruto: 185, bersih: 162 },
  { bulan: "Feb", bulan2: "Feb", bruto: 188, bersih: 165 },
  { bulan: "Mar", bruto: 187, bersih: 164 },
  { bulan: "Apr", bruto: 192, bersih: 168 },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardBendaharaGaji() {
  const now    = new Date();
  const [tab, setTab]           = useState("ringkasan");
  const [bulan, setBulan]       = useState(now.getMonth() + 1);
  const [tahun, setTahun]       = useState(now.getFullYear());
  const [kpi, setKpi]           = useState(null);
  const [gajiList, setGajiList] = useState([]);
  const [trend, setTrend]       = useState([]);
  const [lapList, setLapList]   = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [searchQ, setSearchQ]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [notif, setNotif]       = useState(null);

  const user  = getUser();
  const role  = (user?.role || user?.roleName || "").toLowerCase();
  const allowed = ALLOWED.includes(role);

  const showNotif = useCallback((msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  }, []);

  const loadGaji = useCallback(async () => {
    try {
      const r = await api.get(`/gaji-pegawai?bulan=${bulan}&tahun=${tahun}`);
      const data = r.data?.data || [];
      setGajiList(data.length ? data : STATIC_GAJI);
    } catch {
      setGajiList(STATIC_GAJI);
    }
  }, [bulan, tahun]);

  const loadKpi = useCallback(async () => {
    try {
      const r = await api.get(`/dashboard/bendahara-gaji/summary?bulan=${bulan}&tahun=${tahun}`);
      setKpi(r.data?.data || null);
    } catch { /* silent */ }
  }, [bulan, tahun]);

  const loadTrend = useCallback(async () => {
    try {
      const r = await api.get(`/dashboard/bendahara-gaji/trend?tahun=${tahun}`);
      const d = r.data?.data || [];
      setTrend(d.length ? d : STATIC_TREND);
    } catch {
      setTrend(STATIC_TREND);
    }
  }, [tahun]);

  const loadLaporan = useCallback(async () => {
    try {
      const r = await api.get(`/gaji-pegawai/laporan?bulan=${bulan}&tahun=${tahun}`);
      setLapList(r.data?.data || []);
    } catch { /* silent */ }
  }, [bulan, tahun]);

  useEffect(() => {
    if (!allowed) return;
    loadKpi();
    loadGaji();
    loadTrend();
  }, [allowed, loadKpi, loadGaji, loadTrend]);

  useEffect(() => {
    if (!allowed) return;
    if (tab === "laporan") loadLaporan();
  }, [tab, allowed, loadLaporan]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!allowed) return <Navigate to="/unauthorized" replace />;

  // ── Computed ──────────────────────────────────────────────────────────────
  const filtered = gajiList.filter((g) =>
    !searchQ || (g.nama || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  const totalBruto  = gajiList.reduce((s, g) => s + Number(g.gaji_pokok || 0) + Number(g.tunjangan || 0), 0);
  const totalPotongan = gajiList.reduce((s, g) => s + Number(g.potongan || 0), 0);
  const totalBersih = totalBruto - totalPotongan;
  const jmlPegawai  = gajiList.length;
  const jmlDibayar  = gajiList.filter((g) => g.status === "dibayar").length;
  const jmlPending  = gajiList.filter((g) => g.status === "pending").length;

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleBayar = async (id) => {
    if (!window.confirm("Tandai gaji ini sebagai sudah dibayar?")) return;
    setLoading(true);
    try {
      await api.put(`/gaji-pegawai/${id}/bayar`);
      showNotif("Gaji berhasil dicatat sebagai dibayar.");
      await loadGaji();
      await loadKpi();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal mencatat pembayaran.", "error");
    } finally { setLoading(false); }
  };

  const handleBayarSemua = async () => {
    if (!window.confirm(`Bayar semua ${jmlPending} pegawai yang pending?`)) return;
    setLoading(true);
    try {
      await api.post(`/gaji-pegawai/bayar-semua`, { bulan, tahun });
      showNotif(`Pembayaran gaji ${BULAN_NAMA[bulan - 1]} ${tahun} dicatat.`);
      await loadGaji();
      await loadKpi();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal memproses pembayaran massal.", "error");
    } finally { setLoading(false); }
  };

  const handleTahan = async (id) => {
    const alasan = window.prompt("Alasan penahanan gaji:");
    if (!alasan) return;
    setLoading(true);
    try {
      await api.put(`/gaji-pegawai/${id}/tahan`, { alasan });
      showNotif("Gaji ditahan.", "warning");
      await loadGaji();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal menahan gaji.", "error");
    } finally { setLoading(false); }
  };

  const handleCetakSlip = (pegawai) => {
    setSelectedPegawai(pegawai);
    setTab("slip");
  };

  // ── Bulan/Tahun selector ──────────────────────────────────────────────────
  const PeriodSelector = () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select
        value={bulan}
        onChange={(e) => setBulan(Number(e.target.value))}
        style={{
          padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`,
          fontSize: 12, color: T.textPri, background: T.card,
        }}
      >
        {BULAN_NAMA.map((b, i) => (
          <option key={i + 1} value={i + 1}>{b}</option>
        ))}
      </select>
      <select
        value={tahun}
        onChange={(e) => setTahun(Number(e.target.value))}
        style={{
          padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`,
          fontSize: 12, color: T.textPri, background: T.card,
        }}
      >
        {[2024, 2025, 2026, 2027].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      {/* Skip link */}
      <a
        href="#main-content"
        style={{
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
          <div style={{ fontSize: 18, fontWeight: 700 }}>Dashboard Bendahara Gaji</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Penggajian & Tunjangan ASN — {user?.name || user?.username || "—"}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, opacity: 0.75 }}>
          <div>Periode: {BULAN_NAMA[bulan - 1]} {tahun}</div>
          <div>{new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</div>
        </div>
      </header>

      {/* Notifikasi */}
      {notif && (
        <div aria-live="polite" style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          background: notif.type === "error" ? T.danger : notif.type === "warning" ? T.warning : T.accent,
          color: "#fff", padding: "10px 20px", borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,.2)", fontSize: 13, maxWidth: 360,
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
            {t.id === "daftar_gaji" && jmlPending > 0 && (
              <span style={{
                marginLeft: 6, background: T.warning, color: "#fff",
                borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700,
              }}>
                {jmlPending}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main id="main-content" style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>

        {/* ── TAB: RINGKASAN ───────────────────────────────────────── */}
        {tab === "ringkasan" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: T.primary, fontSize: 16, margin: 0 }}>
                Ringkasan Gaji — {BULAN_NAMA[bulan - 1]} {tahun}
              </h2>
              <PeriodSelector />
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KpiCard label="Total Pegawai"    value={jmlPegawai} />
              <KpiCard label="Sudah Dibayar"    value={jmlDibayar}    color={T.success} />
              <KpiCard label="Belum Dibayar"    value={jmlPending}    color={T.warning} />
              <KpiCard label="Total Gaji Bruto" value={fmt(kpi?.total_bruto ?? totalBruto)}  sub="sebelum potongan" />
              <KpiCard label="Total Potongan"   value={fmt(kpi?.total_potongan ?? totalPotongan)} color={T.danger} />
              <KpiCard label="Total Gaji Bersih" value={fmt(kpi?.total_bersih ?? totalBersih)} color={T.accent} sub="dibayarkan" />
            </div>

            {/* Trend chart */}
            <div style={{ background: T.card, borderRadius: 10, padding: 20, marginBottom: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: T.primary }}>
                Tren Total Gaji {tahun} (juta Rp)
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trend} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} unit=" jt" />
                  <Tooltip formatter={(v) => `${v} jt`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="bruto"  name="Bruto"  fill="#9FA8DA" />
                  <Bar dataKey="bersih" name="Bersih" fill={T.primary}>
                    {trend.map((_, i) => <Cell key={i} fill={T.primary} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progress bar pembayaran */}
            <div style={{ background: T.card, borderRadius: 10, padding: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: T.primary }}>Status Pembayaran Bulan Ini</div>
              <div style={{ marginBottom: 8, fontSize: 13, color: T.textSec }}>
                {jmlDibayar} dari {jmlPegawai} pegawai sudah dibayar
              </div>
              <div style={{ background: "#EDE7F6", borderRadius: 8, height: 16, overflow: "hidden" }}>
                <div style={{
                  width: `${jmlPegawai > 0 ? Math.round((jmlDibayar / jmlPegawai) * 100) : 0}%`,
                  background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`,
                  height: "100%", borderRadius: 8, transition: "width .4s",
                }} />
              </div>
              <div style={{ fontSize: 12, color: T.textSec, marginTop: 6 }}>
                {jmlPegawai > 0 ? Math.round((jmlDibayar / jmlPegawai) * 100) : 0}% selesai
              </div>
              {jmlPending > 0 && (
                <button
                  onClick={handleBayarSemua}
                  disabled={loading}
                  style={{
                    marginTop: 14, background: T.accent, color: "#fff", border: "none",
                    borderRadius: 8, padding: "10px 20px", cursor: "pointer",
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  Bayar Semua ({jmlPending} pegawai)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: DAFTAR GAJI ─────────────────────────────────────── */}
        {tab === "daftar_gaji" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ color: T.primary, fontSize: 16, margin: 0 }}>
                Daftar Gaji — {BULAN_NAMA[bulan - 1]} {tahun}
              </h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <PeriodSelector />
                <input
                  type="search"
                  placeholder="Cari nama pegawai…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  style={{
                    padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.border}`,
                    fontSize: 12, width: 180,
                  }}
                />
                {jmlPending > 0 && (
                  <button
                    onClick={handleBayarSemua}
                    disabled={loading}
                    style={{
                      background: T.accent, color: "#fff", border: "none",
                      borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}
                  >
                    Bayar Semua Pending
                  </button>
                )}
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.primary, color: "#fff" }}>
                    {["Nama","Jabatan","Gol.","Gaji Pokok","Tunjangan","Potongan","Gaji Bersih","Status","Aksi"].map((h) => (
                      <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: 20, textAlign: "center", color: T.textSec, fontStyle: "italic" }}>
                        {searchQ ? `Tidak ada pegawai dengan nama "${searchQ}"` : "Belum ada data gaji bulan ini."}
                      </td>
                    </tr>
                  )}
                  {filtered.map((g, i) => {
                    const bruto  = Number(g.gaji_pokok || 0) + Number(g.tunjangan || 0);
                    const bersih = bruto - Number(g.potongan || 0);
                    return (
                      <tr key={g.id || i} style={{
                        background: i % 2 === 0 ? "#EEF0FB" : "#fff",
                        borderBottom: `1px solid ${T.border}`,
                      }}>
                        <td style={{ padding: "8px 12px", fontWeight: 500 }}>{g.nama || "–"}</td>
                        <td style={{ padding: "8px 12px", fontSize: 12 }}>{g.jabatan || "–"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{g.golongan || "–"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.gaji_pokok)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: T.success }}>{fmt(g.tunjangan)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: T.danger }}>{fmt(g.potongan)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>{fmt(bersih)}</td>
                        <td style={{ padding: "8px 12px" }}><Badge text={g.status} /></td>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {g.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleBayar(g.id)}
                                  disabled={loading}
                                  style={{
                                    background: T.accent, color: "#fff", border: "none",
                                    borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 10, fontWeight: 600,
                                  }}
                                >
                                  Bayar
                                </button>
                                <button
                                  onClick={() => handleTahan(g.id)}
                                  disabled={loading}
                                  style={{
                                    background: T.danger, color: "#fff", border: "none",
                                    borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 10,
                                  }}
                                >
                                  Tahan
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleCetakSlip(g)}
                              style={{
                                background: T.primary, color: "#fff", border: "none",
                                borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 10,
                              }}
                            >
                              Slip
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot>
                    <tr style={{ background: "#E8EAF6", fontWeight: 700, borderTop: `2px solid ${T.border}` }}>
                      <td colSpan={3} style={{ padding: "10px 12px" }}>TOTAL</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        {fmt(filtered.reduce((s, g) => s + Number(g.gaji_pokok || 0), 0))}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: T.success }}>
                        {fmt(filtered.reduce((s, g) => s + Number(g.tunjangan || 0), 0))}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: T.danger }}>
                        {fmt(filtered.reduce((s, g) => s + Number(g.potongan || 0), 0))}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: T.accent }}>
                        {fmt(filtered.reduce((s, g) => s + (Number(g.gaji_pokok || 0) + Number(g.tunjangan || 0) - Number(g.potongan || 0)), 0))}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: TUNJANGAN ───────────────────────────────────────── */}
        {tab === "tunjangan" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Komponen Tunjangan</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16, marginBottom: 24 }}>
              {JENIS_TUNJANGAN.map((t) => {
                const total = gajiList.reduce((s, g) => s + Number(g[t.kode] || 0), 0);
                return (
                  <div key={t.kode} style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                    padding: "16px 20px",
                  }}>
                    <div style={{ fontWeight: 600, color: T.textPri, marginBottom: 4, fontSize: 13 }}>{t.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.success }}>
                      {total > 0 ? fmt(total) : "–"}
                    </div>
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                      Total bulan ini · {gajiList.length} pegawai
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail per pegawai */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.primary, color: "#fff" }}>
                    <th scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>Nama</th>
                    <th scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>Jabatan</th>
                    <th scope="col" style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>Tunj. Jabatan</th>
                    <th scope="col" style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>Tunj. Keluarga</th>
                    <th scope="col" style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>TPP/Kinerja</th>
                    <th scope="col" style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>Total Tunjangan</th>
                  </tr>
                </thead>
                <tbody>
                  {gajiList.map((g, i) => (
                    <tr key={g.id || i} style={{ background: i % 2 === 0 ? "#EEF0FB" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "8px 12px", fontWeight: 500 }}>{g.nama || "–"}</td>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>{g.jabatan || "–"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.tunjangan_jabatan)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.tunjangan_keluarga)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.tunjangan_kinerja)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: T.success }}>
                        {fmt(g.tunjangan)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: POTONGAN ────────────────────────────────────────── */}
        {tab === "potongan" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Komponen Potongan</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              {JENIS_POTONGAN.map((p) => (
                <div key={p.kode} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "16px 20px",
                }}>
                  <div style={{ fontWeight: 600, color: T.textPri, marginBottom: 4, fontSize: 13 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                    {p.kode === "bpjs_kesehatan"  && "Dipotong langsung dari gaji pokok"}
                    {p.kode === "bpjs_tk"         && "3% dari gaji pokok"}
                    {p.kode === "tapera"           && "0,5% dari gaji pokok"}
                    {p.kode === "pph21"            && "Sesuai tarif progresif PPh 21"}
                    {p.kode === "taspen"           && "4,75% dari gaji pokok (PNS)"}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.danger, marginTop: 8 }}>
                    {fmt(gajiList.reduce((s, g) => s + Number(g[p.kode] || 0), 0)) || "–"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.primary, color: "#fff" }}>
                    {["Nama","Gaji Pokok","BPJS Kes.","BPJS TK","Tapera","PPh 21","Taspen","Total Potongan"].map((h) => (
                      <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: h === "Nama" ? "left" : "right", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gajiList.map((g, i) => (
                    <tr key={g.id || i} style={{ background: i % 2 === 0 ? "#EEF0FB" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "8px 12px", fontWeight: 500 }}>{g.nama || "–"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.gaji_pokok)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.bpjs_kesehatan || Math.round(Number(g.gaji_pokok) * 0.01))}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.bpjs_tk || Math.round(Number(g.gaji_pokok) * 0.03))}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.tapera || Math.round(Number(g.gaji_pokok) * 0.005))}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.pph21)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(g.taspen || Math.round(Number(g.gaji_pokok) * 0.0475))}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: T.danger }}>{fmt(g.potongan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: SLIP GAJI ───────────────────────────────────────── */}
        {tab === "slip" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Cetak Slip Gaji</h2>

            {/* Pegawai selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: T.textSec, display: "block", marginBottom: 6 }}>
                Pilih Pegawai:
              </label>
              <select
                value={selectedPegawai?.id || ""}
                onChange={(e) => setSelectedPegawai(gajiList.find((g) => g.id === e.target.value) || null)}
                style={{
                  padding: "8px 14px", borderRadius: 6, border: `1px solid ${T.border}`,
                  fontSize: 13, width: 300, background: T.card,
                }}
              >
                <option value="">-- Pilih pegawai --</option>
                {gajiList.map((g) => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
            </div>

            {selectedPegawai ? (
              <div style={{
                background: T.card, border: `2px solid ${T.border}`, borderRadius: 12,
                padding: 28, maxWidth: 560,
              }}>
                {/* Slip header */}
                <div style={{ textAlign: "center", marginBottom: 20, borderBottom: `2px solid ${T.primary}`, paddingBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: T.primary, marginBottom: 2 }}>
                    SLIP GAJI ASN
                  </div>
                  <div style={{ fontSize: 12, color: T.textSec }}>
                    Dinas Pangan Provinsi Maluku Utara
                  </div>
                  <div style={{ fontSize: 12, color: T.textSec }}>
                    Periode: {BULAN_NAMA[bulan - 1]} {tahun}
                  </div>
                </div>

                {/* Identitas */}
                <div style={{ marginBottom: 16 }}>
                  {[
                    ["Nama",     selectedPegawai.nama],
                    ["Jabatan",  selectedPegawai.jabatan || "–"],
                    ["Golongan", selectedPegawai.golongan || "–"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: T.textSec }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Penghasilan */}
                <div style={{ background: "#E8EAF6", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: T.primary, marginBottom: 8 }}>PENGHASILAN</div>
                  {[
                    ["Gaji Pokok",    selectedPegawai.gaji_pokok],
                    ["Tunjangan",     selectedPegawai.tunjangan],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                      <span>{k}</span>
                      <span>{fmt(v)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, borderTop: `1px solid ${T.border}`, paddingTop: 6, marginTop: 4 }}>
                    <span>Jumlah Bruto</span>
                    <span>{fmt(Number(selectedPegawai.gaji_pokok || 0) + Number(selectedPegawai.tunjangan || 0))}</span>
                  </div>
                </div>

                {/* Potongan */}
                <div style={{ background: "#FFEBEE", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: T.danger, marginBottom: 8 }}>POTONGAN</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                    <span>Total Potongan</span>
                    <span style={{ color: T.danger }}>{fmt(selectedPegawai.potongan)}</span>
                  </div>
                </div>

                {/* Gaji bersih */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 16, fontWeight: 800, color: T.accent,
                  borderTop: `2px solid ${T.border}`, paddingTop: 12,
                }}>
                  <span>GAJI BERSIH</span>
                  <span>
                    {fmt(
                      Number(selectedPegawai.gaji_pokok || 0) +
                      Number(selectedPegawai.tunjangan  || 0) -
                      Number(selectedPegawai.potongan   || 0)
                    )}
                  </span>
                </div>

                <div style={{ marginTop: 4, marginBottom: 16 }}>
                  <Badge text={selectedPegawai.status} />
                </div>

                <button
                  onClick={() => showNotif(`Slip gaji ${selectedPegawai.nama} akan dicetak…`)}
                  style={{
                    background: T.primary, color: "#fff", border: "none",
                    borderRadius: 8, padding: "10px 24px", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, width: "100%",
                  }}
                >
                  Cetak Slip Gaji
                </button>
              </div>
            ) : (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20 }}>
                Pilih pegawai di atas untuk melihat slip gaji.
              </div>
            )}
          </div>
        )}

        {/* ── TAB: LAPORAN ─────────────────────────────────────────── */}
        {tab === "laporan" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: T.primary, fontSize: 16, margin: 0 }}>Laporan Penggajian</h2>
              <PeriodSelector />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {[
                { label: "Daftar Gaji Induk",           frekuensi: "Bulanan",   deadline: "Tgl 1 bulan gajian" },
                { label: "Rekapitulasi Gaji",            frekuensi: "Bulanan",   deadline: "Bersamaan daftar gaji" },
                { label: "Surat Permintaan Pembayaran Gaji (SPP-LS)", frekuensi:"Bulanan", deadline:"Tgl 5 bulan gajian" },
                { label: "Laporan Potongan BPJS",        frekuensi: "Bulanan",   deadline: "Tgl 10 bulan berikut" },
                { label: "Laporan PPh 21 (SPT Masa)",    frekuensi: "Bulanan",   deadline: "Tgl 20 bulan berikut" },
                { label: "Laporan Taspen & Pensiun",     frekuensi: "Triwulanan",deadline: "Akhir triwulan" },
              ].map((lap, i) => (
                <div key={i} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "16px 20px",
                }}>
                  <div style={{ fontWeight: 600, color: T.textPri, marginBottom: 4, fontSize: 13 }}>{lap.label}</div>
                  <div style={{ fontSize: 11, color: T.textSec }}>
                    {lap.frekuensi} · {lap.deadline}
                  </div>
                  <button
                    onClick={() => showNotif(`${lap.label} — ${BULAN_NAMA[bulan - 1]} ${tahun} akan diunduh…`)}
                    style={{
                      marginTop: 12, background: T.primary, color: "#fff", border: "none",
                      borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12,
                    }}
                  >
                    Unduh / Cetak
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
