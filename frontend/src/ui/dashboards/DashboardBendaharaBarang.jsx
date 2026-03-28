// frontend/src/ui/dashboards/DashboardBendaharaBarang.jsx
// Role: BENDAHARA BARANG — Aset, Persediaan, BMD, Pengadaan, Laporan
// Tabs: ringkasan | persediaan | aset | pengadaan | mutasi | laporan

import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie,
} from "recharts";
import api from "../../services/api.js";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:  "#4E342E",
  secondary:"#3E2723",
  accent:   "#00695C",
  danger:   "#B71C1C",
  warning:  "#E65100",
  success:  "#2E7D32",
  bg:       "#EFEBE9",
  card:     "#FFFFFF",
  border:   "#BCAAA4",
  textPri:  "#1C0A00",
  textSec:  "#546E7A",
};

const ALLOWED = [
  "bendahara_barang", "bendahara",
  "super_admin", "sekretaris", "kepala_dinas",
];

const TABS = [
  { id: "ringkasan",   label: "Ringkasan" },
  { id: "persediaan",  label: "Persediaan" },
  { id: "aset",        label: "Aset / BMD" },
  { id: "pengadaan",   label: "Pengadaan" },
  { id: "mutasi",      label: "Mutasi Barang" },
  { id: "laporan",     label: "Laporan" },
];

const KONDISI_ASET = ["baik", "rusak_ringan", "rusak_berat"];
const KONDISI_LABEL = { baik: "Baik", rusak_ringan: "Rusak Ringan", rusak_berat: "Rusak Berat" };
const KONDISI_COLOR = { baik: "#2E7D32", rusak_ringan: "#E65100", rusak_berat: "#B71C1C" };

const STATUS_PENGADAAN = ["direncanakan", "proses", "selesai", "dibatalkan"];

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
      padding: "16px 20px", minWidth: 150,
    }}>
      <div style={{ fontSize: 12, color: T.textSec, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || T.primary }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ text }) {
  const map = {
    baik:          { bg: "#E8F5E9", fg: "#2E7D32" },
    rusak_ringan:  { bg: "#FFF3E0", fg: "#E65100" },
    rusak_berat:   { bg: "#FFEBEE", fg: "#B71C1C" },
    direncanakan:  { bg: "#E3F2FD", fg: "#1565C0" },
    proses:        { bg: "#FFF9C4", fg: "#F57F17" },
    selesai:       { bg: "#E8F5E9", fg: "#2E7D32" },
    dibatalkan:    { bg: "#FFEBEE", fg: "#B71C1C" },
    masuk:         { bg: "#E8F5E9", fg: "#2E7D32" },
    keluar:        { bg: "#FFEBEE", fg: "#B71C1C" },
    transfer:      { bg: "#E3F2FD", fg: "#1565C0" },
    penghapusan:   { bg: "#F3E5F5", fg: "#6A1B9A" },
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

// ── Static fallback data ──────────────────────────────────────────────────────
const STATIC_PERSEDIAAN = [
  { id:"p1", kode:"ATK-001", nama:"Kertas HVS A4 (Rim)", satuan:"Rim",  stok: 45, stok_min: 10, nilai_satuan: 65_000,  kondisi:"baik" },
  { id:"p2", kode:"ATK-002", nama:"Tinta Printer Canon",  satuan:"Botol",stok:  8, stok_min: 5,  nilai_satuan: 85_000,  kondisi:"baik" },
  { id:"p3", kode:"BHB-001", nama:"Sabun Cuci Tangan",    satuan:"Botol",stok:  3, stok_min: 10, nilai_satuan: 25_000,  kondisi:"baik" },
  { id:"p4", kode:"ATK-003", nama:"Ballpoint Pilot",      satuan:"Lusin",stok: 12, stok_min: 5,  nilai_satuan: 45_000,  kondisi:"baik" },
  { id:"p5", kode:"BHB-002", nama:"Masker Medis",         satuan:"Box",  stok:  2, stok_min: 5,  nilai_satuan: 120_000, kondisi:"baik" },
];

const STATIC_ASET = [
  { id:"a1", kode_barang:"3.10.01.01.001", nama:"Laptop Dell Latitude",   satuan:"Unit", jumlah: 12, nilai: 14_400_000, kondisi:"baik",         ruangan:"Sekretariat" },
  { id:"a2", kode_barang:"3.10.01.02.001", nama:"Printer HP LaserJet",    satuan:"Unit", jumlah:  6, nilai: 3_600_000,  kondisi:"rusak_ringan",   ruangan:"Sekretariat" },
  { id:"a3", kode_barang:"3.07.01.01.001", nama:"Kursi Kerja Ergonomis",  satuan:"Unit", jumlah: 30, nilai: 4_500_000,  kondisi:"baik",           ruangan:"Semua Ruangan" },
  { id:"a4", kode_barang:"3.06.01.01.001", nama:"Kendaraan Dinas Roda 4", satuan:"Unit", jumlah:  3, nilai:195_000_000, kondisi:"baik",           ruangan:"Pool Kendaraan" },
  { id:"a5", kode_barang:"3.10.02.01.001", nama:"AC Split 1 PK",         satuan:"Unit", jumlah:  8, nilai: 4_000_000,  kondisi:"rusak_berat",    ruangan:"Bidang Distribusi" },
];

const STATIC_PENGADAAN = [
  { id:"pg1", nama:"Pengadaan ATK Triwulan III", jenis:"ATK",   nilai: 15_000_000, status:"proses",       tgl_mulai:"2026-07-01", tgl_selesai:"2026-08-31" },
  { id:"pg2", nama:"Pemeliharaan Kendaraan Dinas", jenis:"Jasa", nilai: 8_500_000,  status:"selesai",      tgl_mulai:"2026-06-01", tgl_selesai:"2026-06-30" },
  { id:"pg3", nama:"Pengadaan Laptop Baru",        jenis:"Modal",nilai: 42_000_000, status:"direncanakan", tgl_mulai:"2026-09-01", tgl_selesai:"2026-10-31" },
];

const STATIC_MUTASI = [
  { id:"m1", tgl:"2026-03-15", nama_barang:"Kertas HVS A4", jumlah: 10, satuan:"Rim",  jenis:"keluar",    tujuan_asal:"ATK",        keterangan:"Distribusi ke Bidang Ketersediaan" },
  { id:"m2", tgl:"2026-03-20", nama_barang:"Toner Printer",  jumlah:  2, satuan:"Unit", jenis:"masuk",     tujuan_asal:"Pengadaan",  keterangan:"Penerimaan barang dari CV Maju Jaya" },
  { id:"m3", tgl:"2026-03-22", nama_barang:"Laptop Dell",    jumlah:  1, satuan:"Unit", jenis:"transfer",  tujuan_asal:"Sekretariat",keterangan:"Transfer ke Bidang Distribusi" },
  { id:"m4", tgl:"2026-03-25", nama_barang:"AC Split Rusak", jumlah:  2, satuan:"Unit", jenis:"penghapusan",tujuan_asal:"Gudang",    keterangan:"Penghapusan BMD kondisi rusak berat" },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardBendaharaBarang() {
  const [tab, setTab]               = useState("ringkasan");
  const [kpi, setKpi]               = useState(null);
  const [persediaan, setPersediaan] = useState([]);
  const [aset, setAset]             = useState([]);
  const [pengadaan, setPengadaan]   = useState([]);
  const [mutasi, setMutasi]         = useState([]);
  const [lapList, setLapList]       = useState([]);
  const [searchQ, setSearchQ]       = useState("");
  const [filterKondisi, setFilterKondisi]   = useState("semua");
  const [filterStatus, setFilterStatus]     = useState("semua");
  const [showFormMutasi, setShowFormMutasi] = useState(false);
  const [formMutasi, setFormMutasi] = useState({ nama_barang:"", jumlah:"", satuan:"", jenis:"keluar", keterangan:"" });
  const [loading, setLoading]       = useState(false);
  const [notif, setNotif]           = useState(null);

  const user  = getUser();
  const role  = (user?.role || user?.roleName || "").toLowerCase();
  const allowed = ALLOWED.includes(role);

  const showNotif = useCallback((msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  }, []);

  const loadKpi = useCallback(async () => {
    try {
      const r = await api.get("/dashboard/bendahara-barang/summary");
      setKpi(r.data?.data || null);
    } catch { /* silent */ }
  }, []);

  const loadPersediaan = useCallback(async () => {
    try {
      const r = await api.get("/barang-persediaan");
      const d = r.data?.data || [];
      setPersediaan(d.length ? d : STATIC_PERSEDIAAN);
    } catch { setPersediaan(STATIC_PERSEDIAAN); }
  }, []);

  const loadAset = useCallback(async () => {
    try {
      const r = await api.get("/barang-aset");
      const d = r.data?.data || [];
      setAset(d.length ? d : STATIC_ASET);
    } catch { setAset(STATIC_ASET); }
  }, []);

  const loadPengadaan = useCallback(async () => {
    try {
      const r = await api.get("/barang-pengadaan");
      const d = r.data?.data || [];
      setPengadaan(d.length ? d : STATIC_PENGADAAN);
    } catch { setPengadaan(STATIC_PENGADAAN); }
  }, []);

  const loadMutasi = useCallback(async () => {
    try {
      const r = await api.get("/barang-mutasi?limit=50");
      const d = r.data?.data || [];
      setMutasi(d.length ? d : STATIC_MUTASI);
    } catch { setMutasi(STATIC_MUTASI); }
  }, []);

  const loadLaporan = useCallback(async () => {
    try {
      const r = await api.get("/dashboard/bendahara-barang/laporan");
      setLapList(r.data?.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    loadKpi();
    loadPersediaan();
    loadAset();
    loadPengadaan();
  }, [allowed, loadKpi, loadPersediaan, loadAset, loadPengadaan]);

  useEffect(() => {
    if (!allowed) return;
    if (tab === "mutasi")  loadMutasi();
    if (tab === "laporan") loadLaporan();
  }, [tab, allowed, loadMutasi, loadLaporan]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!allowed) return <Navigate to="/unauthorized" replace />;

  // ── Computed ──────────────────────────────────────────────────────────────
  const stokMinim = persediaan.filter((p) => Number(p.stok) <= Number(p.stok_min));

  const asetByKondisi = KONDISI_ASET.map((k) => ({
    name:  KONDISI_LABEL[k],
    value: aset.filter((a) => a.kondisi === k).length,
    fill:  KONDISI_COLOR[k],
  })).filter((d) => d.value > 0);

  const nilaiAsetTotal = aset.reduce((s, a) => s + Number(a.nilai || 0) * Number(a.jumlah || 1), 0);

  const filteredPersediaan = persediaan.filter((p) => {
    const matchQ = !searchQ || (p.nama || "").toLowerCase().includes(searchQ.toLowerCase());
    return matchQ;
  });

  const filteredAset = aset.filter((a) => {
    const matchK = filterKondisi === "semua" || a.kondisi === filterKondisi;
    const matchQ = !searchQ || (a.nama || "").toLowerCase().includes(searchQ.toLowerCase());
    return matchK && matchQ;
  });

  const filteredPengadaan = pengadaan.filter((p) =>
    filterStatus === "semua" || p.status === filterStatus
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleLaporKondisi = async (id, kondisi) => {
    setLoading(true);
    try {
      await api.put(`/barang-aset/${id}/kondisi`, { kondisi });
      showNotif("Kondisi aset berhasil diperbarui.");
      await loadAset();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal memperbarui kondisi.", "error");
    } finally { setLoading(false); }
  };

  const handleSubmitMutasi = async () => {
    if (!formMutasi.nama_barang || !formMutasi.jumlah) {
      showNotif("Nama barang dan jumlah wajib diisi.", "warning");
      return;
    }
    setLoading(true);
    try {
      await api.post("/barang-mutasi", {
        ...formMutasi,
        jumlah: Number(formMutasi.jumlah),
        tgl: new Date().toISOString().slice(0, 10),
      });
      showNotif("Mutasi barang berhasil dicatat.");
      setShowFormMutasi(false);
      setFormMutasi({ nama_barang:"", jumlah:"", satuan:"", jenis:"keluar", keterangan:"" });
      await loadMutasi();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal mencatat mutasi.", "error");
    } finally { setLoading(false); }
  };

  const pengadaanChart = pengadaan.slice(0, 6).map((p) => ({
    nama:  p.nama?.length > 16 ? p.nama.substring(0, 16) + "…" : p.nama,
    nilai: Math.round(Number(p.nilai || 0) / 1_000_000),
    status: p.status,
  }));

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
          <div style={{ fontSize: 18, fontWeight: 700 }}>Dashboard Bendahara Barang</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Persediaan, Aset BMD & Pengadaan — {user?.name || user?.username || "—"}
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
            onClick={() => { setTab(t.id); setSearchQ(""); setFilterKondisi("semua"); setFilterStatus("semua"); }}
            style={{
              padding: "12px 18px", border: "none", cursor: "pointer", fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? T.primary : T.textSec,
              borderBottom: tab === t.id ? `3px solid ${T.primary}` : "3px solid transparent",
              background: "transparent",
            }}
          >
            {t.label}
            {t.id === "persediaan" && stokMinim.length > 0 && (
              <span style={{
                marginLeft: 6, background: T.danger, color: "#fff",
                borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700,
              }}>
                {stokMinim.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main id="main-content" style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>

        {/* ── TAB: RINGKASAN ───────────────────────────────────────── */}
        {tab === "ringkasan" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Ringkasan Barang & Aset</h2>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KpiCard label="Total Item Persediaan" value={kpi?.total_persediaan ?? persediaan.length} />
              <KpiCard label="Stok di Bawah Minimum" value={kpi?.stok_minim ?? stokMinim.length} color={T.danger} sub="perlu reorder" />
              <KpiCard label="Total Aset / BMD" value={kpi?.total_aset ?? aset.length} sub="item terdaftar" />
              <KpiCard label="Nilai Aset Total" value={fmt(kpi?.nilai_aset ?? nilaiAsetTotal)} color={T.accent} />
              <KpiCard label="Pengadaan Berjalan" value={kpi?.pengadaan_proses ?? pengadaan.filter((p) => p.status === "proses").length} color={T.warning} />
            </div>

            {/* Kondisi aset pie + pengadaan bar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
              {/* Pie — kondisi aset */}
              <div style={{ background: T.card, borderRadius: 10, padding: 20, border: `1px solid ${T.border}` }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: T.primary, fontSize: 13 }}>
                  Kondisi Aset BMD
                </div>
                {asetByKondisi.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={asetByKondisi}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {asetByKondisi.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: T.textSec, fontSize: 12, textAlign: "center", paddingTop: 40 }}>Belum ada data aset</div>
                )}
              </div>

              {/* Bar — nilai pengadaan */}
              <div style={{ background: T.card, borderRadius: 10, padding: 20, border: `1px solid ${T.border}` }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: T.primary, fontSize: 13 }}>
                  Nilai Pengadaan (juta Rp)
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={pengadaanChart} margin={{ top: 4, right: 16, left: 0, bottom: 36 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nama" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} unit=" jt" />
                    <Tooltip formatter={(v) => `${v} jt`} />
                    <Bar dataKey="nilai" name="Nilai" fill={T.primary}>
                      {pengadaanChart.map((e, i) => (
                        <Cell key={i} fill={
                          e.status === "selesai"      ? T.success  :
                          e.status === "proses"       ? T.warning  :
                          e.status === "dibatalkan"   ? T.danger   : T.primary
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stok minim alert */}
            {stokMinim.length > 0 && (
              <div style={{
                background: "#FFF3E0", border: `1px solid ${T.warning}`, borderRadius: 10,
                padding: "14px 20px",
              }}>
                <div style={{ fontWeight: 700, color: T.warning, marginBottom: 8 }}>
                  ⚠ Persediaan Di Bawah Stok Minimum ({stokMinim.length} item)
                </div>
                {stokMinim.map((p) => (
                  <div key={p.id} style={{ fontSize: 12, color: T.textPri, marginBottom: 3 }}>
                    {p.nama} — stok: <strong>{p.stok} {p.satuan}</strong> (minimum: {p.stok_min})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: PERSEDIAAN ──────────────────────────────────────── */}
        {tab === "persediaan" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ color: T.primary, fontSize: 16, margin: 0 }}>Daftar Persediaan Barang</h2>
              <input
                type="search"
                placeholder="Cari nama barang…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                style={{
                  padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.border}`,
                  fontSize: 12, width: 200,
                }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.primary, color: "#fff" }}>
                    {["Kode","Nama Barang","Satuan","Stok Sekarang","Stok Min","Nilai Satuan","Nilai Total","Status Stok"].map((h) => (
                      <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPersediaan.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 20, textAlign: "center", color: T.textSec, fontStyle: "italic" }}>
                        Tidak ada data persediaan.
                      </td>
                    </tr>
                  )}
                  {filteredPersediaan.map((p, i) => {
                    const isMinim = Number(p.stok) <= Number(p.stok_min);
                    const nilaiTotal = Number(p.nilai_satuan || 0) * Number(p.stok || 0);
                    return (
                      <tr key={p.id || i} style={{
                        background: isMinim ? "#FFF8E1" : i % 2 === 0 ? "#F5F0EE" : "#fff",
                        borderBottom: `1px solid ${T.border}`,
                      }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600, fontSize: 11 }}>{p.kode || "–"}</td>
                        <td style={{ padding: "8px 12px", fontWeight: 500 }}>{p.nama || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{p.satuan || "–"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, color: isMinim ? T.danger : T.success }}>
                          {p.stok ?? "–"}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: T.textSec }}>{p.stok_min ?? "–"}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(p.nilai_satuan)}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmt(nilaiTotal)}</td>
                        <td style={{ padding: "8px 12px" }}>
                          {isMinim
                            ? <span style={{ color: T.danger, fontWeight: 700, fontSize: 11 }}>⚠ MINIM</span>
                            : <span style={{ color: T.success, fontSize: 11 }}>✓ Cukup</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {filteredPersediaan.length > 0 && (
                  <tfoot>
                    <tr style={{ background: "#E8E0DC", fontWeight: 700, borderTop: `2px solid ${T.border}` }}>
                      <td colSpan={6} style={{ padding: "10px 12px" }}>TOTAL NILAI PERSEDIAAN</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: T.accent }}>
                        {fmt(filteredPersediaan.reduce((s, p) => s + Number(p.nilai_satuan || 0) * Number(p.stok || 0), 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: ASET / BMD ──────────────────────────────────────── */}
        {tab === "aset" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ color: T.primary, fontSize: 16, margin: 0 }}>Daftar Aset / Barang Milik Daerah</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["semua", ...KONDISI_ASET].map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilterKondisi(k)}
                    style={{
                      padding: "5px 12px", fontSize: 11, borderRadius: 6,
                      border: `1px solid ${filterKondisi === k ? T.primary : T.border}`,
                      background: filterKondisi === k ? T.primary : T.card,
                      color: filterKondisi === k ? "#fff" : T.textSec,
                      cursor: "pointer", fontWeight: filterKondisi === k ? 600 : 400,
                    }}
                  >
                    {k === "semua" ? "Semua" : KONDISI_LABEL[k]}
                  </button>
                ))}
                <input
                  type="search"
                  placeholder="Cari nama aset…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  style={{
                    padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`,
                    fontSize: 11, width: 160,
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.primary, color: "#fff" }}>
                    {["Kode Barang","Nama Aset","Jumlah","Satuan","Nilai / Unit","Nilai Total","Lokasi","Kondisi","Aksi"].map((h) => (
                      <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAset.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: 20, textAlign: "center", color: T.textSec, fontStyle: "italic" }}>
                        Tidak ada data aset.
                      </td>
                    </tr>
                  )}
                  {filteredAset.map((a, i) => (
                    <tr key={a.id || i} style={{ background: i % 2 === 0 ? "#F5F0EE" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600 }}>{a.kode_barang || "–"}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 500 }}>{a.nama || "–"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>{a.jumlah ?? "–"}</td>
                      <td style={{ padding: "8px 12px" }}>{a.satuan || "Unit"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(a.nilai)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>
                        {fmt(Number(a.nilai || 0) * Number(a.jumlah || 1))}
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: 11 }}>{a.ruangan || "–"}</td>
                      <td style={{ padding: "8px 12px" }}><Badge text={a.kondisi} /></td>
                      <td style={{ padding: "8px 12px" }}>
                        <select
                          defaultValue={a.kondisi}
                          onChange={(e) => handleLaporKondisi(a.id, e.target.value)}
                          style={{
                            padding: "3px 6px", fontSize: 10, borderRadius: 4,
                            border: `1px solid ${T.border}`, background: T.card, cursor: "pointer",
                          }}
                        >
                          {KONDISI_ASET.map((k) => (
                            <option key={k} value={k}>{KONDISI_LABEL[k]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {filteredAset.length > 0 && (
                  <tfoot>
                    <tr style={{ background: "#E8E0DC", fontWeight: 700, borderTop: `2px solid ${T.border}` }}>
                      <td colSpan={4} style={{ padding: "10px 12px" }}>TOTAL NILAI ASET</td>
                      <td />
                      <td style={{ padding: "10px 12px", textAlign: "right", color: T.accent }}>
                        {fmt(filteredAset.reduce((s, a) => s + Number(a.nilai || 0) * Number(a.jumlah || 1), 0))}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: PENGADAAN ───────────────────────────────────────── */}
        {tab === "pengadaan" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ color: T.primary, fontSize: 16, margin: 0 }}>Rencana & Realisasi Pengadaan</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {["semua", ...STATUS_PENGADAAN].map((s) => (
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

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.primary, color: "#fff" }}>
                    {["Nama Paket","Jenis","Nilai","Tgl Mulai","Tgl Selesai","Status"].map((h) => (
                      <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPengadaan.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 20, textAlign: "center", color: T.textSec, fontStyle: "italic" }}>
                        Tidak ada data pengadaan.
                      </td>
                    </tr>
                  )}
                  {filteredPengadaan.map((p, i) => (
                    <tr key={p.id || i} style={{ background: i % 2 === 0 ? "#F5F0EE" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "8px 12px", fontWeight: 500 }}>{p.nama || "–"}</td>
                      <td style={{ padding: "8px 12px" }}>{p.jenis || "–"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmt(p.nilai)}</td>
                      <td style={{ padding: "8px 12px" }}>
                        {p.tgl_mulai ? new Date(p.tgl_mulai).toLocaleDateString("id-ID") : "–"}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {p.tgl_selesai ? new Date(p.tgl_selesai).toLocaleDateString("id-ID") : "–"}
                      </td>
                      <td style={{ padding: "8px 12px" }}><Badge text={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: MUTASI BARANG ───────────────────────────────────── */}
        {tab === "mutasi" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: T.primary, fontSize: 16, margin: 0 }}>Mutasi Barang</h2>
              <button
                onClick={() => setShowFormMutasi(true)}
                style={{
                  background: T.accent, color: "#fff", border: "none",
                  borderRadius: 8, padding: "8px 18px", cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                }}
              >
                + Catat Mutasi
              </button>
            </div>

            {/* Form mutasi */}
            {showFormMutasi && (
              <div style={{
                background: "#FDF6F0", border: `1px solid ${T.border}`, borderRadius: 10,
                padding: 20, marginBottom: 20,
              }}>
                <div style={{ fontWeight: 600, color: T.primary, marginBottom: 12 }}>Form Pencatatan Mutasi Barang</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { key:"nama_barang", label:"Nama Barang", type:"text", placeholder:"Nama barang yang dimutasi" },
                    { key:"jumlah",      label:"Jumlah",      type:"number", placeholder:"0" },
                    { key:"satuan",      label:"Satuan",      type:"text", placeholder:"Unit / Rim / Botol…" },
                    { key:"keterangan",  label:"Keterangan",  type:"text", placeholder:"Tujuan / asal / alasan mutasi" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: T.textSec, display: "block", marginBottom: 4 }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={formMutasi[f.key]}
                        onChange={(e) => setFormMutasi((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        style={{
                          width: "100%", padding: "7px 10px", borderRadius: 6,
                          border: `1px solid ${T.border}`, fontSize: 12, boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, color: T.textSec, display: "block", marginBottom: 4 }}>Jenis Mutasi</label>
                    <select
                      value={formMutasi.jenis}
                      onChange={(e) => setFormMutasi((prev) => ({ ...prev, jenis: e.target.value }))}
                      style={{
                        width: "100%", padding: "7px 10px", borderRadius: 6,
                        border: `1px solid ${T.border}`, fontSize: 12, background: T.card,
                      }}
                    >
                      <option value="keluar">Keluar</option>
                      <option value="masuk">Masuk</option>
                      <option value="transfer">Transfer</option>
                      <option value="penghapusan">Penghapusan</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button
                    onClick={handleSubmitMutasi}
                    disabled={loading}
                    style={{
                      background: T.accent, color: "#fff", border: "none",
                      borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    }}
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setShowFormMutasi(false)}
                    style={{
                      background: "transparent", color: T.textSec, border: `1px solid ${T.border}`,
                      borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13,
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.primary, color: "#fff" }}>
                    {["Tanggal","Nama Barang","Jumlah","Satuan","Jenis","Asal / Tujuan","Keterangan"].map((h) => (
                      <th key={h} scope="col" style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mutasi.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 20, textAlign: "center", color: T.textSec, fontStyle: "italic" }}>
                        Belum ada riwayat mutasi.
                      </td>
                    </tr>
                  )}
                  {mutasi.map((m, i) => (
                    <tr key={m.id || i} style={{ background: i % 2 === 0 ? "#F5F0EE" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "8px 12px" }}>
                        {m.tgl ? new Date(m.tgl).toLocaleDateString("id-ID") : "–"}
                      </td>
                      <td style={{ padding: "8px 12px", fontWeight: 500 }}>{m.nama_barang || "–"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600 }}>{m.jumlah ?? "–"}</td>
                      <td style={{ padding: "8px 12px" }}>{m.satuan || "–"}</td>
                      <td style={{ padding: "8px 12px" }}><Badge text={m.jenis} /></td>
                      <td style={{ padding: "8px 12px" }}>{m.tujuan_asal || "–"}</td>
                      <td style={{ padding: "8px 12px", fontSize: 12, color: T.textSec }}>{m.keterangan || "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: LAPORAN ─────────────────────────────────────────── */}
        {tab === "laporan" && (
          <div>
            <h2 style={{ color: T.primary, marginBottom: 16, fontSize: 16 }}>Laporan Barang & Aset</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {[
                { label: "Laporan Persediaan Bulanan",         frekuensi:"Bulanan",     deadline:"Tgl 5 bulan berikut",    kode:"lp_bulanan" },
                { label: "Laporan BMD Semesteran (KIB A–F)",   frekuensi:"Semesteran",  deadline:"10 Juli / 10 Januari",   kode:"kib_semester" },
                { label: "Laporan Pengadaan Barang/Jasa",      frekuensi:"Per paket",   deadline:"7 hari setelah selesai", kode:"lap_pengadaan" },
                { label: "Berita Acara Pemeriksaan Kas (BAPK)",frekuensi:"Triwulanan",  deadline:"Akhir triwulan",         kode:"bapk" },
                { label: "Rencana Kebutuhan BMD (RKBMD)",      frekuensi:"Tahunan",     deadline:"September tahun berjalan",kode:"rkbmd" },
                { label: "Laporan Mutasi Barang Tahunan",      frekuensi:"Tahunan",     deadline:"31 Januari tahun berikut",kode:"lmb_tahunan" },
              ].map((lap) => {
                const found = lapList.find((l) => l.kode === lap.kode || l.jenis === lap.kode);
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
          </div>
        )}
      </main>
    </div>
  );
}
