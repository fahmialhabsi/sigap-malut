// frontend/src/ui/dashboards/DashboardBendaharaPengeluaran.jsx
// Role: BENDAHARA PENGELUARAN — Kas, SPJ, GU/TU, Jadwal Bayar
// Tabs: ringkasan | spj | kas | jadwal | laporan

import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line,
} from "recharts";
import api from "../../services/api.js";

// ── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary:  "#4A148C",
  secondary:"#311B92",
  accent:   "#00695C",
  danger:   "#B71C1C",
  warning:  "#E65100",
  success:  "#2E7D32",
  bg:       "#F3E5F5",
  card:     "#FFFFFF",
  border:   "#CE93D8",
  textPri:  "#1A0035",
  textSec:  "#546E7A",
};

const ALLOWED = [
  "bendahara", "bendahara_pengeluaran",
  "super_admin", "sekretaris", "kepala_dinas",
];

const TABS = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "spj",       label: "SPJ Masuk" },
  { id: "kas",       label: "Kas & Bank" },
  { id: "jadwal",    label: "Jadwal Bayar" },
  { id: "laporan",   label: "Laporan" },
];

// Jenis GU/TU
const JENIS_GU = [
  { id: "gu",  label: "Ganti Uang (GU)" },
  { id: "tu",  label: "Tambah Uang (TU)" },
  { id: "ls",  label: "Langsung (LS)" },
  { id: "up",  label: "Uang Persediaan (UP)" },
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

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

function KpiCard({ label, value, sub, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
        padding: "16px 20px", minWidth: 150, cursor: onClick ? "pointer" : "default",
        transition: "box-shadow .15s",
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.boxShadow = "0 2px 10px rgba(74,20,140,.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: 12, color: T.textSec, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || T.primary }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ text }) {
  const map = {
    draft:           { bg: "#ECEFF1", fg: "#546E7A" },
    submitted:       { bg: "#FFF3E0", fg: "#E65100" },
    diajukan:        { bg: "#FFF3E0", fg: "#E65100" },
    verified:        { bg: "#E8F5E9", fg: "#2E7D32" },
    diverifikasi:    { bg: "#E8F5E9", fg: "#2E7D32" },
    rejected:        { bg: "#FFEBEE", fg: "#B71C1C" },
    ditolak:         { bg: "#FFEBEE", fg: "#B71C1C" },
    dikembalikan:    { bg: "#FFEBEE", fg: "#B71C1C" },
    lunas:           { bg: "#E8F5E9", fg: "#1B5E20" },
    menunggu:        { bg: "#FFF3E0", fg: "#F57C00" },
    sp2d_cair:       { bg: "#E8F5E9", fg: "#2E7D32" },
    spm_diterbitkan: { bg: "#E3F2FD", fg: "#1565C0" },
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

// ── Static fallback data ───────────────────────────────────────────────────────
const STATIC_KAS = [
  { bulan: "Jan", kas: 185, bank: 320 },
  { bulan: "Feb", kas: 142, bank: 290 },
  { bulan: "Mar", kas: 210, bank: 350 },
  { bulan: "Apr", kas: 175, bank: 310 },
];

const STATIC_REALISASI = [
  { nama: "Belanja Pegawai",    pagu: 850, realisasi: 720 },
  { nama: "Belanja Barang",     pagu: 420, realisasi: 315 },
  { nama: "Belanja Jasa",       pagu: 180, realisasi: 162 },
  { nama: "Perjalanan Dinas",   pagu: 130, realisasi: 45  },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardBendaharaPengeluaran() {
  const [tab, setTab]         = useState("ringkasan");
  const [kpi, setKpi]         = useState(null);
  const [spjList, setSpjList] = useState([]);
  const [kasData, setKasData] = useState([]);
  const [realData, setRealData] = useState([]);
  const [jadwal, setJadwal]   = useState([]);
  const [lapList, setLapList] = useState([]);
  const [activeSpj, setActiveSpj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif]     = useState(null);
  const [filterStatus, setFilterStatus] = useState("semua");

  const user = getUser();
  const role = (user?.role || user?.roleName || "").toLowerCase();
  const allowed = ALLOWED.includes(role);

  const showNotif = useCallback((msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  }, []);

  const loadKpi = useCallback(async () => {
    try {
      const r = await api.get("/dashboard/bendahara/summary");
      setKpi(r.data?.data || r.data);
    } catch { /* silent */ }
  }, []);

  const loadSpj = useCallback(async () => {
    try {
      const r = await api.get("/spj?limit=50");
      setSpjList(r.data?.data || []);
    } catch { /* silent */ }
  }, []);

  const loadKas = useCallback(async () => {
    try {
      const r = await api.get("/dashboard/bendahara/kas-saldo");
      const d = r.data?.data;
      setKasData(Array.isArray(d) && d.length ? d : STATIC_KAS);
      const r2 = await api.get("/rekening-anggaran");
      const d2 = r2.data?.data || [];
      setRealData(
        d2.length
          ? d2.map((x) => ({
              nama: x.nama?.length > 16 ? x.nama.substring(0, 16) + "…" : x.nama,
              pagu:      Math.round(Number(x.pagu || 0) / 1_000_000),
              realisasi: Math.round(Number(x.realisasi || 0) / 1_000_000),
            }))
          : STATIC_REALISASI
      );
    } catch {
      setKasData(STATIC_KAS);
      setRealData(STATIC_REALISASI);
    }
  }, []);

  const loadJadwal = useCallback(async () => {
    try {
      const r = await api.get("/spj?status=spm_diterbitkan&limit=30");
      setJadwal(r.data?.data || []);
    } catch { /* silent */ }
  }, []);

  const loadLaporan = useCallback(async () => {
    try {
      const r = await api.get("/spj?jenis=laporan&limit=20");
      setLapList(r.data?.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    loadKpi();
    loadSpj();
    loadKas();
  }, [allowed, loadKpi, loadSpj, loadKas]);

  useEffect(() => {
    if (!allowed) return;
    if (tab === "jadwal")  loadJadwal();
    if (tab === "laporan") loadLaporan();
  }, [tab, allowed, loadJadwal, loadLaporan]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!allowed) return <Navigate to="/unauthorized" replace />;

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleVerifikasi = async (id) => {
    setLoading(true);
    try {
      await api.put(`/spj/${id}/verify`);
      showNotif("SPJ berhasil diverifikasi.");
      await loadSpj();
      setActiveSpj(null);
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal verifikasi SPJ.", "error");
    } finally { setLoading(false); }
  };

  const handleTolak = async (id) => {
    const catatan = window.prompt("Alasan penolakan SPJ:");
    if (!catatan) return;
    setLoading(true);
    try {
      await api.put(`/spj/${id}/reject`, { catatan_verifikasi: catatan });
      showNotif("SPJ ditolak.", "warning");
      await loadSpj();
      setActiveSpj(null);
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal menolak SPJ.", "error");
    } finally { setLoading(false); }
  };

  const handleBayar = async (id) => {
    if (!window.confirm("Tandai pembayaran ini sebagai sudah dibayar?")) return;
    setLoading(true);
    try {
      await api.put(`/spj/${id}/bayar`);
      showNotif("Pembayaran dicatat.");
      await loadJadwal();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal mencatat pembayaran.", "error");
    } finally { setLoading(false); }
  };

  // ── Filtered SPJ ──────────────────────────────────────────────────────────
  const filteredSpj = filterStatus === "semua"
    ? spjList
    : spjList.filter((s) => s.status === filterStatus);

  const spjPending  = spjList.filter((s) => ["submitted","diajukan"].includes(s.status)).length;
  const spjVerified = spjList.filter((s) => ["verified","diverifikasi"].includes(s.status)).length;
  const spjTolak    = spjList.filter((s) => ["rejected","ditolak","dikembalikan"].includes(s.status)).length;

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
          <div style={{ fontSize: 18, fontWeight: 700 }}>Dashboard Bendahara Pengeluaran</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Kas, SPJ, & Penatausahaan Keuangan — {user?.name || user?.username || "—"}
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
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
            {t.id === "spj" && spjPending > 0 && (
              <span style={{
                marginLeft: 6, background: T.warning, color: "#fff",
                borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700,
              }}>
                {spjPending}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main id="main-content" style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>

        {/* ── TAB: RINGKASAN ───────────────────────────────────────── */}
        {tab === "ringkasan" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Ringkasan Kas & SPJ</h2>

            {/* KPI row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KpiCard
                label="SPJ Pending Verifikasi"
                value={kpi?.spj_pending ?? spjPending}
                color={T.warning}
                onClick={() => setTab("spj")}
              />
              <KpiCard
                label="SPJ Diverifikasi Bulan Ini"
                value={kpi?.spj_verified ?? spjVerified}
                color={T.accent}
              />
              <KpiCard
                label="Saldo Kas Tunai"
                value={fmt(kpi?.saldo_kas)}
                sub="posisi hari ini"
              />
              <KpiCard
                label="Saldo Bank"
                value={fmt(kpi?.saldo_bank)}
                sub="rekening dinas"
              />
              <KpiCard
                label="Uang Persediaan (UP)"
                value={fmt(kpi?.up_saldo)}
                sub="sisa UP bulan ini"
                color={kpi?.up_saldo < 5_000_000 ? T.danger : T.primary}
              />
            </div>

            {/* Realisasi chart */}
            <div style={{ background: T.card, borderRadius: 10, padding: 20, marginBottom: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: T.primary }}>Realisasi vs Pagu per Rekening (juta Rp)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={realData} margin={{ top: 8, right: 20, left: 0, bottom: 36 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nama" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} unit=" jt" />
                  <Tooltip formatter={(v) => `${v} jt`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="pagu"      name="Pagu"      fill="#CE93D8" />
                  <Bar dataKey="realisasi" name="Realisasi" fill={T.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Kas trend chart */}
            <div style={{ background: T.card, borderRadius: 10, padding: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: T.primary }}>Tren Saldo Kas & Bank (juta Rp)</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={kasData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} unit=" jt" />
                  <Tooltip formatter={(v) => `${v} jt`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="kas"  name="Kas Tunai" stroke={T.primary} strokeWidth={2} dot />
                  <Line type="monotone" dataKey="bank" name="Bank"      stroke={T.accent}  strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── TAB: SPJ MASUK ───────────────────────────────────────── */}
        {tab === "spj" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: T.primary, fontSize: 16, margin: 0 }}>SPJ Masuk</h2>
              {/* Filter */}
              <div style={{ display: "flex", gap: 8 }}>
                {["semua", "submitted", "diajukan", "diverifikasi", "dikembalikan"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: "5px 12px", fontSize: 11, borderRadius: 6,
                      border: `1px solid ${filterStatus === s ? T.primary : T.border}`,
                      background: filterStatus === s ? T.primary : T.card,
                      color: filterStatus === s ? "#fff" : T.textSec,
                      cursor: "pointer", fontWeight: filterStatus === s ? 600 : 400,
                    }}
                  >
                    {s === "semua" ? "Semua" : s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <KpiCard label="Pending"     value={spjPending}  color={T.warning} />
              <KpiCard label="Diverifikasi" value={spjVerified} color={T.accent} />
              <KpiCard label="Ditolak"     value={spjTolak}    color={T.danger} />
            </div>

            {filteredSpj.length === 0 && (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Tidak ada SPJ {filterStatus !== "semua" ? `dengan status "${filterStatus}"` : ""}.
              </div>
            )}

            {filteredSpj.map((spj) => (
              <div key={spj.id} style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                padding: 20, marginBottom: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.textPri }}>
                      {spj.nomor_spj || `SPJ-${(spj.id || "").slice(0, 8)}`}
                    </div>
                    <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                      {spj.kegiatan || spj.judul || "–"} &nbsp;·&nbsp; {fmt(spj.total_anggaran || spj.nilai)}
                    </div>
                    <div style={{ fontSize: 12, color: T.textSec }}>
                      {spj.unit_kerja || "–"} &nbsp;·&nbsp;{" "}
                      {spj.created_at ? new Date(spj.created_at).toLocaleDateString("id-ID") : "–"}
                    </div>
                  </div>
                  <Badge text={spj.status} />
                </div>

                {activeSpj === spj.id ? (
                  <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                    <div style={{ fontSize: 12, color: T.textSec, marginBottom: 8 }}>
                      <strong>Keterangan:</strong> {spj.keterangan || "–"}
                    </div>
                    {spj.catatan_verifikasi && (
                      <div style={{ fontSize: 12, background: "#FFF3E0", borderRadius: 6, padding: "6px 10px", marginBottom: 8 }}>
                        Catatan: {spj.catatan_verifikasi}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["submitted", "diajukan"].includes(spj.status) && (
                        <>
                          <button
                            onClick={() => handleVerifikasi(spj.id)}
                            disabled={loading}
                            style={{
                              background: T.accent, color: "#fff", border: "none",
                              borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                            }}
                          >
                            Verifikasi
                          </button>
                          <button
                            onClick={() => handleTolak(spj.id)}
                            disabled={loading}
                            style={{
                              background: T.danger, color: "#fff", border: "none",
                              borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12,
                            }}
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setActiveSpj(null)}
                        style={{
                          background: "transparent", color: T.textSec,
                          border: `1px solid ${T.border}`, borderRadius: 6,
                          padding: "8px 14px", cursor: "pointer", fontSize: 12,
                        }}
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveSpj(spj.id)}
                    style={{
                      marginTop: 10, background: "transparent", color: T.primary,
                      border: `1px solid ${T.primary}`, borderRadius: 6,
                      padding: "5px 14px", cursor: "pointer", fontSize: 12,
                    }}
                  >
                    Lihat Detail
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: KAS & BANK ──────────────────────────────────────── */}
        {tab === "kas" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Kas & Bank</h2>

            {/* Saldo cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Saldo Kas Tunai",        value: fmt(kpi?.saldo_kas),  color: T.primary },
                { label: "Saldo Rekening Bank",     value: fmt(kpi?.saldo_bank), color: T.secondary },
                { label: "Uang Persediaan (UP)",    value: fmt(kpi?.up_saldo),   color: T.accent },
                { label: "Total Pengeluaran Bulan", value: fmt(kpi?.total_keluar_bulan), color: T.warning },
              ].map((c) => (
                <KpiCard key={c.label} label={c.label} value={c.value} color={c.color} />
              ))}
            </div>

            {/* GU/TU types */}
            <div style={{ background: T.card, borderRadius: 10, padding: 20, marginBottom: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 14, color: T.primary }}>Mekanisme Pencairan Anggaran</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {JENIS_GU.map((g) => (
                  <div key={g.id} style={{
                    background: "#FAF0FF", border: `1px solid ${T.border}`, borderRadius: 8,
                    padding: "12px 16px",
                  }}>
                    <div style={{ fontWeight: 600, color: T.primary, fontSize: 13 }}>{g.label}</div>
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>
                      {g.id === "gu"  && "Penggantian UP yang telah digunakan"}
                      {g.id === "tu"  && "Tambahan UP untuk kebutuhan mendesak"}
                      {g.id === "ls"  && "Pembayaran langsung ke rekanan"}
                      {g.id === "up"  && "Awal tahun — pengisian UP pertama"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend line chart */}
            <div style={{ background: T.card, borderRadius: 10, padding: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: T.primary }}>Tren Posisi Kas & Bank (juta Rp)</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={kasData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} unit=" jt" />
                  <Tooltip formatter={(v) => `${v} jt`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="kas"  name="Kas Tunai" stroke={T.primary} strokeWidth={2} dot />
                  <Line type="monotone" dataKey="bank" name="Bank"      stroke={T.accent}  strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── TAB: JADWAL BAYAR ────────────────────────────────────── */}
        {tab === "jadwal" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Jadwal Pembayaran</h2>
            {jadwal.length === 0 ? (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Tidak ada pembayaran yang dijadwalkan.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.primary, color: "#fff" }}>
                      {["No SPM","Uraian","Penerima","Nilai","Tgl SPM","Status","Aksi"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jadwal.map((j, i) => (
                      <tr key={j.id || i} style={{ background: i % 2 === 0 ? "#FAF0FF" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>{j.spm_nomor || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{j.kegiatan || j.judul || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{j.pptk_nama || j.unit_kerja || "–"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(j.total_anggaran || j.nilai)}</td>
                        <td style={{ padding: "8px 12px" }}>
                          {j.spm_tanggal ? new Date(j.spm_tanggal).toLocaleDateString("id-ID") : "–"}
                        </td>
                        <td style={{ padding: "8px 12px" }}><Badge text={j.status} /></td>
                        <td style={{ padding: "8px 12px" }}>
                          {j.status === "spm_diterbitkan" && (
                            <button
                              onClick={() => handleBayar(j.id)}
                              disabled={loading}
                              style={{
                                background: T.accent, color: "#fff", border: "none",
                                borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600,
                              }}
                            >
                              Catat Bayar
                            </button>
                          )}
                          {j.status === "sp2d_cair" && (
                            <span style={{ color: T.accent, fontSize: 11, fontWeight: 600 }}>✓ SP2D Cair</span>
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

        {/* ── TAB: LAPORAN ─────────────────────────────────────────── */}
        {tab === "laporan" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Laporan Bendahara</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Buku Kas Umum (BKU)",      kode:"bku",   frekuensi:"Harian",     deadline:"Setiap hari kerja" },
                { label: "Buku Pembantu Kas Tunai",   kode:"bpkt",  frekuensi:"Harian",     deadline:"Setiap hari kerja" },
                { label: "Buku Pembantu Bank",        kode:"bpbank",frekuensi:"Per transaksi",deadline:"Hari transaksi" },
                { label: "Laporan Pertanggungjawaban (LPJ)", kode:"lpj", frekuensi:"Bulanan", deadline:"Tgl 10 bulan berikut" },
                { label: "Register Penutupan Kas",    kode:"rpk",   frekuensi:"Triwulanan", deadline:"Akhir triwulan" },
                { label: "Laporan Pajak (SPT Masa)",  kode:"pajak", frekuensi:"Bulanan",    deadline:"Tgl 20 bulan ini" },
              ].map((lap) => {
                const found = lapList.find((l) => l.jenis === lap.kode || l.jenis_dokumen === lap.kode);
                return (
                  <div key={lap.kode} style={{
                    background: T.card, border: `1px solid ${T.border}`,
                    borderRadius: 10, padding: "16px 20px",
                  }}>
                    <div style={{ fontWeight: 600, color: T.textPri, marginBottom: 4, fontSize: 13 }}>{lap.label}</div>
                    <div style={{ fontSize: 11, color: T.textSec }}>
                      {lap.frekuensi} · {lap.deadline}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Badge text={found ? found.status : "belum"} />
                    </div>
                    <button
                      onClick={() => showNotif(`${lap.label} akan diunduh…`)}
                      style={{
                        marginTop: 12, background: T.primary, color: "#fff", border: "none",
                        borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12,
                      }}
                    >
                      Unduh / Cetak
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
                      {["Laporan","Periode","Status","Aksi"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lapList.map((l, i) => (
                      <tr key={l.id || i} style={{ background: i % 2 === 0 ? "#FAF0FF" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "8px 12px", fontWeight: 500 }}>{l.judul || l.nama || "–"}</td>
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
