// frontend/src/pages/dashboard/pelaksana-sekretariat.jsx
// Role: PELAKSANA / STAF — Unit Sekretariat
// Tabs: ringkasan | tugas | surat | modul | notifikasi

import { useState, useEffect, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import api from "../../services/api.js";
import { useAuthStore } from "../../stores/authStore.js";

// ── Design Tokens (sesuai 05-template-standar-dashboard.md — konsisten semua role) ──
const T = {
  primary:  "#1B4F8A",   // navy — konsisten dengan semua dashboard lain
  secondary:"#2E7D32",   // hijau — konsisten
  accent:   "#F57C00",   // oranye — konsisten
  danger:   "#C62828",
  warning:  "#E65100",
  success:  "#2E7D32",
  info:     "#0277BD",
  bg:       "#F4F6F9",   // abu terang — konsisten
  card:     "#FFFFFF",
  border:   "#DDE3ED",   // konsisten
  textPri:  "#1A2B3C",
  textSec:  "#546E7A",
};

const ALLOWED = [
  "pelaksana", "staf",
  "super_admin", "sekretaris", "kepala_dinas",
  "kasubag_umum_kepegawaian", "kasubbag_umum_kepegawaian",
];

const TABS = [
  { id: "ringkasan",   label: "Ringkasan" },
  { id: "tugas",       label: "Tugas Saya" },
  { id: "spj",         label: "SPJ Saya" },
  { id: "surat",       label: "Surat" },
  { id: "modul",       label: "Modul Kerja" },
  { id: "notifikasi",  label: "Notifikasi" },
];

// Modul Sekretariat yang bisa diakses pelaksana
const MODUL_SEK = [
  { kode:"SEK-ADM", label:"Administrasi",       icon:"📋", path:"/modul/sek-adm" },
  { kode:"SEK-AST", label:"Aset",                icon:"🏢", path:"/modul/sek-ast" },
  { kode:"SEK-HUM", label:"Humas",               icon:"📣", path:"/modul/sek-hum" },
  { kode:"SEK-KBJ", label:"Kebijakan",           icon:"📜", path:"/modul/sek-kbj" },
  { kode:"SEK-KEP", label:"Kepegawaian",         icon:"👤", path:"/modul/sek-kep" },
  { kode:"SEK-KEU", label:"Keuangan",            icon:"💰", path:"/modul/sek-keu" },
  { kode:"SEK-LDS", label:"Laporan Dinas",       icon:"📊", path:"/modul/sek-lds" },
  { kode:"SEK-LKS", label:"Lap. Keu. Semester",  icon:"📈", path:"/modul/sek-lks" },
  { kode:"SEK-LKT", label:"Lap. Keu. Tahunan",   icon:"📉", path:"/modul/sek-lkt" },
  { kode:"SEK-LUP", label:"Lap. Uang Persediaan",icon:"🧾", path:"/modul/sek-lup" },
  { kode:"SEK-REN", label:"Perencanaan",         icon:"🗓", path:"/modul/sek-ren" },
  { kode:"SEK-RMH", label:"Rumah Tangga",        icon:"🏠", path:"/modul/sek-rmh" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function Badge({ text }) {
  const map = {
    // Tugas
    open:                    { bg:"#E3F2FD", fg:"#1565C0" },
    todo:                    { bg:"#E3F2FD", fg:"#1565C0" },
    assigned:                { bg:"#E3F2FD", fg:"#1565C0" },
    accepted:                { bg:"#E8EAF6", fg:"#3949AB" },
    in_progress:             { bg:"#FFF9C4", fg:"#F57F17" },
    proses:                  { bg:"#FFF9C4", fg:"#F57F17" },
    submitted:               { bg:"#E8F5E9", fg:"#1B5E20" },
    done:                    { bg:"#E8F5E9", fg:"#2E7D32" },
    selesai:                 { bg:"#E8F5E9", fg:"#2E7D32" },
    returned:                { bg:"#FFEBEE", fg:"#C62828" },
    dikembalikan:            { bg:"#FFEBEE", fg:"#C62828" },
    overdue:                 { bg:"#FFEBEE", fg:"#C62828" },
    terlambat:               { bg:"#FFEBEE", fg:"#C62828" },
    // SPJ
    draft:                   { bg:"#ECEFF1", fg:"#546E7A" },
    diajukan_ke_bendahara:   { bg:"#E3F2FD", fg:"#1565C0" },
    menunggu_verifikasi:     { bg:"#FFF9C4", fg:"#F57F17" },
    verified:                { bg:"#E8F5E9", fg:"#2E7D32" },
    rejected:                { bg:"#FFEBEE", fg:"#C62828" },
    dibayarkan:              { bg:"#E8F5E9", fg:"#1B5E20" },
    // Surat
    belum_baca:              { bg:"#FFF3E0", fg:"#E65100" },
    dibaca:                  { bg:"#ECEFF1", fg:"#546E7A" },
    disposisi:               { bg:"#EDE7F6", fg:"#6A1B9A" },
  };
  const s = map[(text || "").toLowerCase()] || { bg:"#ECEFF1", fg:"#546E7A" };
  return (
    <span style={{
      background: s.bg, color: s.fg, borderRadius: 4,
      padding: "2px 8px", fontSize: 11, fontWeight: 600,
    }}>
      {text || "–"}
    </span>
  );
}

// KpiCard sesuai pola sistem (trend indicator ▲▼, konsisten dengan fungsional-ketersediaan)
function KpiCard({ label, value, sub, color, trend, unit, good }) {
  const trendColor = good == null ? T.textSec : (trend > 0) === good ? T.success : T.danger;
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
      padding: "14px 18px", minWidth: 0, width: "100%", flex: "1 1 0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 11, color: T.textSec, marginBottom: 3 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: color || T.primary }}>{value ?? "–"}</span>
        {unit && <span style={{ fontSize: 12, color: T.textSec }}>{unit}</span>}
      </div>
      {trend != null && (
        <div style={{ fontSize: 10, color: trendColor, marginTop: 2 }}>
          {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </div>
      )}
      {sub && <div style={{ fontSize: 10, color: T.textSec, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

// ── Section title helper (konsisten dengan fungsional-ketersediaan) ───────────
function SectionTitle({ title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ width: 4, height: 18, background: T.primary, borderRadius: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 700, color: T.textPri, fontSize: 14 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: T.textSec }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Static fallback ───────────────────────────────────────────────────────────
const STATIC_TUGAS = [
  { id:"t1", judul:"Rekap absensi bulan ini",       status:"in_progress", prioritas:"tinggi",  deadline:"2026-03-31", deskripsi:"Rekap kehadiran pegawai sekretariat" },
  { id:"t2", judul:"Arsip surat masuk minggu ini",  status:"todo",        prioritas:"sedang",  deadline:"2026-04-02", deskripsi:"Scan dan arsip 15 surat masuk" },
  { id:"t3", judul:"Persiapan rapat koordinasi",    status:"todo",        prioritas:"tinggi",  deadline:"2026-04-01", deskripsi:"Siapkan materi dan undangan rapat" },
  { id:"t4", judul:"Input data kepegawaian baru",   status:"done",        prioritas:"sedang",  deadline:"2026-03-28", deskripsi:"Entry data 2 pegawai baru" },
];

const STATIC_SURAT_MASUK = [
  { id:"sm1", nomor:"001/DINAS/III/2026", perihal:"Undangan Rakor Pangan",      pengirim:"Dinas Pertanian",     tgl:"2026-03-25", status:"belum_baca" },
  { id:"sm2", nomor:"002/PROV/III/2026",  perihal:"Permintaan Data Stok Pangan",pengirim:"Biro Perekonomian",   tgl:"2026-03-26", status:"disposisi" },
  { id:"sm3", nomor:"003/KEM/III/2026",   perihal:"Edaran Pengisian SKP 2026",  pengirim:"Kemenpan-RB",         tgl:"2026-03-27", status:"dibaca" },
];

const STATIC_SURAT_KELUAR = [
  { id:"sk1", nomor:"100/SEK/III/2026", perihal:"Laporan Bulanan Maret 2026", tujuan:"Sekretaris Daerah", tgl:"2026-03-28", status:"dikirim" },
  { id:"sk2", nomor:"101/SEK/III/2026", perihal:"Permohonan Dana UP",         tujuan:"BPKAD Provinsi",    tgl:"2026-03-29", status:"draft" },
];

const STATIC_NOTIF = [
  { id:"n1", pesan:"Tugas 'Rekap absensi' mendekati deadline",       waktu:"2 jam lalu",  tipe:"warning" },
  { id:"n2", pesan:"Surat masuk baru dari Dinas Pertanian",           waktu:"3 jam lalu",  tipe:"info" },
  { id:"n3", pesan:"Disposisi surat 002/PROV/III/2026 dari Kasubag", waktu:"5 jam lalu",  tipe:"info" },
  { id:"n4", pesan:"Tugas 'Input data kepegawaian' selesai disetujui",waktu:"1 hari lalu", tipe:"success" },
];

const STATIC_SPJ = [
  {
    id:"spj1", judul:"SPPD ke Ternate — Workshop Pangan",
    jenis_spj:"SPPD", total_anggaran:2100000, status:"verified",
    submitted_at:"2026-03-24", catatan_terakhir:"Sudah disetujui Sekretaris",
    updated_at:"2026-03-28",
  },
  {
    id:"spj2", judul:"Honor Narasumber Workshop",
    jenis_spj:"HONOR", total_anggaran:750000, status:"menunggu_verifikasi",
    submitted_at:"2026-03-27", catatan_terakhir:"Menunggu verifikasi PPK",
    updated_at:"2026-03-27",
  },
  {
    id:"spj3", judul:"Pembelian ATK Maret 2026",
    jenis_spj:"ATK", total_anggaran:320000, status:"rejected",
    submitted_at:"2026-03-15", catatan_terakhir:"Kwitansi tidak ada nama toko dan tanggal",
    updated_at:"2026-03-20",
  },
];

const STATIC_KEP = {
  nip: "19950101 202203 1 001",
  jabatan: "Pelaksana — Sekretariat",
  pangkat: "Penata Muda (III/a)",
  golongan: "III/a",
  masa_kerja_tahun: 4,
  masa_kerja_bulan: 2,
  kgb_berikutnya: "2026-10-01",
  kgb_hari_lagi: 185,
  skp_terakhir: { periode: "Semester 1 2025", nilai: 87.5, predikat: "BAIK", status: "disetujui" },
  kenaikan_pangkat_estimasi: "Oktober 2028",
};

// ── TugasCard — reusable card dipakai di list view ────────────────────────────
function TugasCard({ t, detailTugas, setDetailTugas, handleMulai, handleSelesaikan, loading, isOverdue, prioritasColor }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${isOverdue(t.deadline, t.status) ? T.danger : T.border}`,
      borderRadius: 10, padding: 14, marginBottom: 10,
      borderLeft: `3px solid ${["returned","dikembalikan"].includes(t.status) ? T.danger : ["in_progress","proses"].includes(t.status) ? T.accent : T.primary}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: T.textPri, fontSize: 13 }}>{t.judul || t.title || "–"}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
            <Badge text={t.status} />
            {t.prioritas && <span style={{ fontSize: 11, color: prioritasColor(t.prioritas), fontWeight: 600 }}>● {t.prioritas}</span>}
            {t.deadline && (
              <span style={{ fontSize: 11, color: isOverdue(t.deadline, t.status) ? T.danger : T.textSec }}>
                {isOverdue(t.deadline, t.status) ? "⚠ " : ""}Deadline: {new Date(t.deadline).toLocaleDateString("id-ID")}
              </span>
            )}
          </div>
          {(t.catatan_kembalikan || t.returned_note) && (
            <div style={{ marginTop: 6, fontSize: 11, background: "#FFEBEE", color: T.danger, borderRadius: 4, padding: "4px 8px" }}>
              <strong>Catatan:</strong> {t.catatan_kembalikan || t.returned_note}
            </div>
          )}
        </div>
        <Badge text={t.status} />
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["todo","open","assigned","accepted"].includes(t.status) && (
          <button onClick={() => handleMulai(t.id)} disabled={loading} style={{
            background: T.info, color: "#fff", border: "none",
            borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600,
          }}>Mulai</button>
        )}
        {["in_progress","proses"].includes(t.status) && (
          <button onClick={() => handleSelesaikan(t.id)} disabled={loading} style={{
            background: T.success, color: "#fff", border: "none",
            borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600,
          }}>Submit Hasil</button>
        )}
        <button onClick={() => setDetailTugas(detailTugas === t.id ? null : t.id)} style={{
          background: "transparent", color: T.primary, border: `1px solid ${T.primary}`,
          borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11,
        }}>{detailTugas === t.id ? "Tutup" : "Detail"}</button>
      </div>
      {detailTugas === t.id && (
        <div style={{ marginTop: 10, fontSize: 12, color: T.textSec, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
          {t.deskripsi || t.description || "Tidak ada deskripsi tambahan."}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PelaksanaSekretariat() {
  const [tab, setTab]               = useState("ringkasan");
  const [tugas, setTugas]           = useState([]);
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [suratKeluar, setSuratKeluar] = useState([]);
  const [notifList, setNotifList]   = useState([]);
  const [kpi, setKpi]               = useState(null);
  const [absensiHariIni, setAbsensiHariIni] = useState(null);
  const [spjList, setSpjList]       = useState([]);
  const [kepegawaian, setKepegawaian] = useState(null);
  const [detailTugas, setDetailTugas] = useState(null);
  const [filterTugas, setFilterTugas] = useState("semua");
  const [filterSpj, setFilterSpj]   = useState("semua");
  const [loading, setLoading]       = useState(false);
  const [notif, setNotif]           = useState(null);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth
  );

  // ── Auth: Zustand store (konsisten dengan semua dashboard lain) ───────────
  const user    = useAuthStore((state) => state.user);
  const role    = (user?.role || user?.roleName || "").toLowerCase();
  const allowed = ALLOWED.includes(role);

  const showNotif = useCallback((msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Data fetchers — pakai endpoint khusus Pelaksana (routes/pelaksana/) ────
  const loadKpiSummary = useCallback(async () => {
    try {
      const r = await api.get("/pelaksana/dashboard/summary");
      const d = r.data?.data;
      if (d) {
        setKpi(d);
        setAbsensiHariIni(d.absensiHariIni || null);
      }
    } catch { /* fallback ke computed dari tugas */ }
  }, []);

  const loadTugas = useCallback(async () => {
    try {
      const r = await api.get("/pelaksana/tugas?periode=semua&limit=30");
      const d = r.data?.data || [];
      setTugas(d.length ? d : STATIC_TUGAS);
    } catch { setTugas(STATIC_TUGAS); }
  }, []);

  const loadSurat = useCallback(async () => {
    try {
      const [rm, rk] = await Promise.all([
        api.get("/pelaksana/surat/masuk?limit=20"),
        api.get("/pelaksana/surat/keluar?limit=20"),
      ]);
      setSuratMasuk(rm.data?.data?.length ? rm.data.data : STATIC_SURAT_MASUK);
      setSuratKeluar(rk.data?.data?.length ? rk.data.data : STATIC_SURAT_KELUAR);
    } catch {
      setSuratMasuk(STATIC_SURAT_MASUK);
      setSuratKeluar(STATIC_SURAT_KELUAR);
    }
  }, []);

  const loadNotif = useCallback(async () => {
    try {
      const r = await api.get("/pelaksana/notifikasi?limit=20");
      const d = r.data?.data || [];
      setNotifList(d.length ? d : STATIC_NOTIF);
    } catch { setNotifList(STATIC_NOTIF); }
  }, []);

  const loadSpj = useCallback(async () => {
    try {
      const r = await api.get("/pelaksana/spj?limit=20");
      const d = r.data?.data || [];
      setSpjList(d.length ? d : STATIC_SPJ);
    } catch { setSpjList(STATIC_SPJ); }
  }, []);

  const loadKepegawaian = useCallback(async () => {
    try {
      const r = await api.get("/pelaksana/kepegawaian/profil");
      setKepegawaian(r.data?.data || STATIC_KEP);
    } catch { setKepegawaian(STATIC_KEP); }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    loadKpiSummary();
    loadTugas();
    loadSpj();
    loadKepegawaian();
    loadNotif();
  }, [allowed, loadKpiSummary, loadTugas, loadSpj, loadKepegawaian, loadNotif]);

  useEffect(() => {
    if (!allowed) return;
    if (tab === "surat") loadSurat();
  }, [tab, allowed, loadSurat]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!allowed) return <Navigate to="/unauthorized" replace />;

  const isPhone = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
  const isCompact = viewportWidth < 960;
  const pagePaddingX = isPhone ? 12 : isTablet ? 16 : 24;
  const pagePaddingY = isPhone ? 16 : 20;
  const contentMaxWidth =
    viewportWidth >= 1600 ? 1680 : viewportWidth >= 1280 ? 1440 : "100%";
  const summaryGridColumns = isCompact ? "1fr" : "1fr 1fr";
  const taskBoardColumns =
    viewportWidth < 768
      ? "1fr"
      : viewportWidth < 1280
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))";
  const kpiGridColumns =
    viewportWidth < 640
      ? "1fr"
      : viewportWidth < 1100
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(4, minmax(0, 1fr))";

  // ── Computed ──────────────────────────────────────────────────────────────
  const tugasTodo     = tugas.filter((t) => ["todo","open"].includes(t.status));
  const tugasProses   = tugas.filter((t) => ["in_progress","proses"].includes(t.status));
  const tugasSelesai  = tugas.filter((t) => ["done","selesai"].includes(t.status));
  const tugasOverdue  = tugas.filter((t) => {
    if (!t.deadline) return false;
    return new Date(t.deadline) < new Date() && !["done","selesai"].includes(t.status);
  });
  const suratBelumBaca = suratMasuk.filter((s) => s.status === "belum_baca").length;
  const notifBelumBaca = notifList.filter((n) => !n.dibaca && n.tipe !== "read").length;

  const filteredTugas = filterTugas === "semua"
    ? tugas
    : filterTugas === "overdue"
      ? tugasOverdue
      : tugas.filter((t) => t.status === filterTugas);

  // SPJ computed
  const spjDikembalikan = spjList.filter((s) => s.status === "rejected");
  const spjPending      = spjList.filter((s) => ["diajukan_ke_bendahara","menunggu_verifikasi"].includes(s.status));
  const filteredSpj = filterSpj === "semua" ? spjList
    : spjList.filter((s) => s.status === filterSpj);

  // Tugas kanban buckets
  const kanbanBelumMulai  = tugas.filter((t) => ["assigned","accepted","todo","open"].includes(t.status));
  const kanbanSedangJalan = tugas.filter((t) => ["in_progress","proses"].includes(t.status));
  const kanbanDikembalikan = tugas.filter((t) => ["returned","dikembalikan"].includes(t.status));

  // Item dikembalikan gabungan (tugas + SPJ) untuk panel Ringkasan
  const semuaDikembalikan = [
    ...kanbanDikembalikan.map((t) => ({ ...t, _jenis: "tugas" })),
    ...spjDikembalikan.map((s) => ({ ...s, _jenis: "spj" })),
  ];

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSelesaikan = async (id) => {
    setLoading(true);
    try {
      // Coba endpoint baru terlebih dahulu, fallback ke lama
      await api.post(`/pelaksana/tugas/${id}/submit`, { note: "Selesai" })
        .catch(() => api.put(`/tasks/${id}`, { status: "done" }));
      showNotif("Tugas disubmit.");
      await loadTugas();
      setDetailTugas(null);
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal mengupdate tugas.", "error");
    } finally { setLoading(false); }
  };

  const handleMulai = async (id) => {
    setLoading(true);
    try {
      await api.post(`/pelaksana/tugas/${id}/mulai`)
        .catch(() => api.put(`/tasks/${id}`, { status: "in_progress" }));
      showNotif("Tugas dimulai.");
      await loadTugas();
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal memulai tugas.", "error");
    } finally { setLoading(false); }
  };

  const handleBacaSurat = async (id) => {
    try {
      await api.put(`/surat/masuk/${id}/baca`);
      setSuratMasuk((prev) => prev.map((s) => s.id === id ? { ...s, status: "dibaca" } : s));
    } catch { /* silent */ }
  };

  const prioritasColor = (p) => ({
    tinggi: T.danger, sedang: T.warning, rendah: T.success,
  }[p] || T.textSec);

  const isOverdue = (deadline, status) =>
    deadline && new Date(deadline) < new Date() && !["done","selesai"].includes(status);

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
        color: "#fff", padding: isPhone ? "14px 12px" : "14px 24px",
        display: "flex", flexDirection: isPhone ? "column" : "row", alignItems: isPhone ? "flex-start" : "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Dashboard Pelaksana — Sekretariat</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {user?.name || user?.username || "—"} &nbsp;·&nbsp; Unit Sekretariat
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, textAlign: isPhone ? "left" : "right" }}>
          {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
        </div>
      </header>

      {/* Notifikasi toast */}
      {notif && (
        <div aria-live="polite" style={{
          position: "fixed", top: isPhone ? 12 : 16, right: isPhone ? 12 : 16, left: isPhone ? 12 : "auto", zIndex: 9999,
          background: notif.type === "error" ? T.danger : notif.type === "warning" ? T.warning : T.accent,
          color: "#fff", padding: "10px 20px", borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,.2)", fontSize: 13, maxWidth: isPhone ? "calc(100vw - 24px)" : 340,
        }}>
          {notif.msg}
        </div>
      )}

      {/* Tab Bar */}
      <nav style={{ background: T.card, borderBottom: `2px solid ${T.border}`, padding: isPhone ? "0 12px" : "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
        {TABS.map((t) => {
          const badge =
            t.id === "tugas"      ? (kanbanBelumMulai.length + kanbanSedangJalan.length) || null :
            t.id === "spj"        ? spjDikembalikan.length || null :
            t.id === "surat"      ? suratBelumBaca || null :
            t.id === "notifikasi" ? notifBelumBaca || null : null;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "11px 16px", border: "none", cursor: "pointer", fontSize: 13,
                fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? T.primary : T.textSec,
                borderBottom: tab === t.id ? `3px solid ${T.primary}` : "3px solid transparent",
                background: "transparent", whiteSpace: "nowrap",
              }}
            >
              {t.label}
              {badge ? (
                <span style={{
                  marginLeft: 5, background: T.danger, color: "#fff",
                  borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700,
                }}>
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <main id="main-content" style={{ width: "100%", padding: `${pagePaddingY}px ${pagePaddingX}px 32px`, maxWidth: contentMaxWidth, margin: "0 auto" }}>

        {/* ── TAB: RINGKASAN ───────────────────────────────────────── */}
        {tab === "ringkasan" && (
          <div>
            <h2 style={{ color: T.primary, fontSize: 15, marginBottom: 14 }}>
              Selamat datang, {user?.nama_lengkap?.split(" ")[0] || user?.name?.split(" ")[0] || "Rekan"}!
            </h2>

            {/* Strip Absensi Hari Ini (BAGIAN D.3 — selalu terlihat di atas) */}
            <div style={{
              background: absensiHariIni?.status ? "#E8F5E9" : "#FFF3E0",
              border: `1px solid ${absensiHariIni?.status ? T.success : T.accent}`,
              borderRadius: 10, padding: "12px 18px", marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13, color: absensiHariIni?.status ? T.success : T.accent }}>
                  {absensiHariIni?.status
                    ? `✅ Sudah absen hari ini: ${absensiHariIni.status.toUpperCase()} (${absensiHariIni.jam || "—"})`
                    : "⚠ Absensi Hari Ini Belum Diisi"}
                </span>
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                  {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
              {!absensiHariIni?.status && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Hadir", "Sakit", "Ijin", "Dinas Luar"].map((s) => (
                    <button key={s} style={{
                      background: T.primary, color: "#fff", border: "none",
                      borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600,
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* KPI tiles — 4 tiles (BAGIAN D.2) dengan trend indicator */}
            <div style={{ display: "grid", gridTemplateColumns: kpiGridColumns, gap: 12, marginBottom: 20 }}>
              <KpiCard
                label="Tugas Aktif"
                value={kpi?.tugasAktif ?? (tugasTodo.length + tugasProses.length)}
                unit="tugas"
                color={T.warning}
                sub="assigned + in progress"
              />
              <KpiCard
                label="Tugas Overdue"
                value={kpi?.tugasOverdue ?? tugasOverdue.length}
                unit="tugas"
                color={kpi?.tugasOverdue > 0 ? T.danger : T.success}
                sub="melewati deadline"
              />
              <KpiCard
                label="SPJ Pending"
                value={kpi?.spjPending ?? 0}
                unit="SPJ"
                color={T.accent}
                sub="menunggu verifikasi"
              />
              <KpiCard
                label="Slip Gaji"
                value={kpi?.slipGajiBulanIni ?? "—"}
                color={T.info}
                sub={new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
              />
            </div>

            {/* Tugas prioritas tinggi */}
            {tugas.filter((t) => t.prioritas === "tinggi" && !["done","selesai"].includes(t.status)).length > 0 && (
              <div style={{ background: "#FFF3E0", border: `1px solid ${T.warning}`, borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: T.warning, marginBottom: 8, fontSize: 13 }}>
                  Prioritas Tinggi
                </div>
                {tugas
                  .filter((t) => t.prioritas === "tinggi" && !["done","selesai"].includes(t.status))
                  .map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: T.textPri }}>{t.judul}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {t.deadline && (
                          <span style={{ fontSize: 11, color: isOverdue(t.deadline, t.status) ? T.danger : T.textSec }}>
                            {new Date(t.deadline).toLocaleDateString("id-ID")}
                          </span>
                        )}
                        <Badge text={t.status} />
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Surat terbaru */}
            {suratMasuk.filter((s) => s.status === "belum_baca").length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
                <div style={{ fontWeight: 600, color: T.primary, marginBottom: 8, fontSize: 13 }}>
                  Surat Masuk Belum Dibaca
                </div>
                {suratMasuk.filter((s) => s.status === "belum_baca").slice(0, 3).map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>{s.perihal || "–"}</span>
                    <span style={{ color: T.textSec }}>{s.pengirim || "–"}</span>
                  </div>
                ))}
                <button
                  onClick={() => setTab("surat")}
                  style={{
                    marginTop: 8, background: "transparent", color: T.primary,
                    border: `1px solid ${T.primary}`, borderRadius: 6,
                    padding: "4px 12px", cursor: "pointer", fontSize: 11,
                  }}
                >
                  Lihat semua surat
                </button>
              </div>
            )}

            {/* ── ROW B: SPJ Saya + Dikembalikan (2 panel sejajar) ──────── */}
            <div style={{ display: "grid", gridTemplateColumns: summaryGridColumns, gap: 14, marginBottom: 16 }}>

              {/* Panel SPJ Saya */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <SectionTitle title="SPJ Saya" sub="Status terkini" />
                {spjList.length === 0 && <div style={{ fontSize: 12, color: T.textSec, fontStyle: "italic" }}>Belum ada SPJ.</div>}
                {spjList.slice(0, 3).map((s) => (
                  <div key={s.id} style={{
                    borderBottom: `1px solid ${T.border}`, paddingBottom: 10, marginBottom: 10,
                    borderLeft: `3px solid ${s.status === "verified" || s.status === "dibayarkan" ? T.success : s.status === "rejected" ? T.danger : T.accent}`,
                    paddingLeft: 8,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: T.textPri }}>{s.judul || "–"}</div>
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                      {s.jenis_spj && <span style={{ marginRight: 6 }}>[{s.jenis_spj}]</span>}
                      {s.total_anggaran != null && `Rp ${Number(s.total_anggaran).toLocaleString("id-ID")}`}
                    </div>
                    <div style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Badge text={s.status} />
                      {s.status === "rejected" && (
                        <button onClick={() => setTab("spj")} style={{
                          fontSize: 10, background: T.danger, color: "#fff", border: "none",
                          borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontWeight: 600,
                        }}>Perbaiki</button>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={() => setTab("spj")} style={{
                  marginTop: 4, background: "transparent", color: T.primary,
                  border: `1px solid ${T.primary}`, borderRadius: 6,
                  padding: "4px 12px", cursor: "pointer", fontSize: 11, width: "100%",
                }}>+ Buat SPJ Baru</button>
              </div>

              {/* Panel Dikembalikan — badge merah mencolok */}
              <div style={{
                background: semuaDikembalikan.length > 0 ? "#FFF8F8" : T.card,
                border: `1px solid ${semuaDikembalikan.length > 0 ? "#FFCDD2" : T.border}`,
                borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 4, height: 18, background: semuaDikembalikan.length > 0 ? T.danger : T.border, borderRadius: 2 }} />
                  <div>
                    <span style={{ fontWeight: 700, color: T.textPri, fontSize: 14 }}>Perlu Tindakan</span>
                    {semuaDikembalikan.length > 0 && (
                      <span style={{ marginLeft: 8, background: T.danger, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                        {semuaDikembalikan.length}
                      </span>
                    )}
                  </div>
                </div>
                {semuaDikembalikan.length === 0 && (
                  <div style={{ fontSize: 12, color: T.success, fontStyle: "italic" }}>✓ Tidak ada item yang perlu diperbaiki</div>
                )}
                {semuaDikembalikan.map((item) => (
                  <div key={`${item._jenis}-${item.id}`} style={{
                    background: "#FFEBEE", border: `1px solid #FFCDD2`, borderRadius: 8,
                    padding: "10px 12px", marginBottom: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, background: T.danger, color: "#fff", borderRadius: 3, padding: "1px 6px", fontWeight: 700 }}>
                        {item._jenis === "spj" ? "SPJ" : "TUGAS"}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 12, color: T.textPri }}>
                        {item.judul || item.title || "–"}
                      </span>
                    </div>
                    {(item.catatan_terakhir || item.catatan_kembalikan || item.returned_note) && (
                      <div style={{ fontSize: 11, color: T.danger, marginBottom: 6 }}>
                        "{item.catatan_terakhir || item.catatan_kembalikan || item.returned_note}"
                      </div>
                    )}
                    <button onClick={() => setTab(item._jenis === "spj" ? "spj" : "tugas")} style={{
                      width: "100%", background: T.danger, color: "#fff", border: "none",
                      borderRadius: 5, padding: "5px 0", cursor: "pointer", fontSize: 10, fontWeight: 600,
                    }}>Perbaiki Sekarang</button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ROW C: Status Kepegawaian + Jadwal & Pengingat ──────── */}
            <div style={{ display: "grid", gridTemplateColumns: summaryGridColumns, gap: 14, marginBottom: 16 }}>

              {/* Panel Status Kepegawaian (read-only) */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <SectionTitle title="Status Kepegawaian Saya" sub="Data pribadi — hanya Anda yang bisa melihat" />
                {kepegawaian ? (
                  <div style={{ fontSize: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(92px, auto) 1fr", gap: "4px 12px", color: T.textPri, marginBottom: 10 }}>
                      <span style={{ color: T.textSec }}>NIP</span>       <span style={{ fontFamily: "monospace" }}>{kepegawaian.nip || "–"}</span>
                      <span style={{ color: T.textSec }}>Jabatan</span>   <span style={{ fontWeight: 600 }}>{kepegawaian.jabatan || "–"}</span>
                      <span style={{ color: T.textSec }}>Pangkat</span>   <span>{kepegawaian.pangkat || "–"}</span>
                      <span style={{ color: T.textSec }}>Masa kerja</span><span>{kepegawaian.masa_kerja_tahun} th {kepegawaian.masa_kerja_bulan} bln</span>
                    </div>

                    {/* KGB berikutnya */}
                    <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 11, color: T.success, marginBottom: 2 }}>KGB Berikutnya</div>
                      <div style={{ fontSize: 12, color: T.textPri }}>
                        {kepegawaian.kgb_berikutnya ? new Date(kepegawaian.kgb_berikutnya).toLocaleDateString("id-ID", { dateStyle: "long" }) : "–"}
                      </div>
                      {kepegawaian.kgb_hari_lagi != null && (
                        <div style={{ fontSize: 10, color: T.textSec }}>{kepegawaian.kgb_hari_lagi} hari lagi</div>
                      )}
                    </div>

                    {/* SKP terakhir */}
                    {kepegawaian.skp_terakhir && (
                      <div style={{ background: "#E3F2FD", border: "1px solid #90CAF9", borderRadius: 8, padding: "8px 12px" }}>
                        <div style={{ fontWeight: 700, fontSize: 11, color: T.info, marginBottom: 2 }}>
                          Nilai SKP — {kepegawaian.skp_terakhir.periode}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>
                          {kepegawaian.skp_terakhir.nilai}
                          <span style={{ fontSize: 11, fontWeight: 400, color: T.textSec, marginLeft: 6 }}>
                            ({kepegawaian.skp_terakhir.predikat})
                          </span>
                        </div>
                        <Badge text={kepegawaian.skp_terakhir.status} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: T.textSec, fontStyle: "italic" }}>Memuat data kepegawaian…</div>
                )}
              </div>

              {/* Panel Jadwal & Pengingat */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <SectionTitle title="Jadwal & Pengingat" sub="Hari ini dan mendatang" />

                {/* Tugas overdue — pengingat mencolok */}
                {tugasOverdue.length > 0 && (
                  <div style={{ background: "#FFEBEE", border: `1px solid #FFCDD2`, borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.danger, marginBottom: 4 }}>
                      ⚠ {tugasOverdue.length} tugas melewati deadline!
                    </div>
                    {tugasOverdue.slice(0, 2).map((t) => (
                      <div key={t.id} style={{ fontSize: 11, color: T.danger }}>• {t.judul || t.title}</div>
                    ))}
                  </div>
                )}

                {/* Deadline hari ini */}
                {tugas.filter((t) => {
                  if (!t.deadline || ["done","selesai"].includes(t.status)) return false;
                  const d = new Date(t.deadline); const now = new Date();
                  return d.toDateString() === now.toDateString();
                }).length > 0 && (
                  <div style={{ background: "#FFF3E0", border: `1px solid #FFE0B2`, borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 4 }}>Deadline Hari Ini</div>
                    {tugas.filter((t) => {
                      if (!t.deadline || ["done","selesai"].includes(t.status)) return false;
                      return new Date(t.deadline).toDateString() === new Date().toDateString();
                    }).map((t) => (
                      <div key={t.id} style={{ fontSize: 11, color: T.textPri }}>
                        • {t.judul || t.title} — {new Date(t.deadline).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    ))}
                  </div>
                )}

                {/* Item dikembalikan */}
                {semuaDikembalikan.length > 0 && (
                  <div style={{ background: "#FFEBEE", border: `1px solid #FFCDD2`, borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.danger }}>
                      ❌ {semuaDikembalikan.length} item perlu diperbaiki segera
                    </div>
                  </div>
                )}

                {/* KGB mendekati */}
                {kepegawaian?.kgb_hari_lagi != null && kepegawaian.kgb_hari_lagi <= 30 && (
                  <div style={{ background: "#E8F5E9", border: `1px solid #A5D6A7`, borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: T.success }}>
                      📅 KGB jatuh tempo dalam {kepegawaian.kgb_hari_lagi} hari
                    </div>
                  </div>
                )}

                {tugasOverdue.length === 0 && semuaDikembalikan.length === 0 && (
                  <div style={{ fontSize: 12, color: T.success, fontStyle: "italic" }}>✓ Semua jadwal lancar</div>
                )}
              </div>
            </div>

            {/* Modul shortcut */}
            <SectionTitle title="Akses Cepat Modul" />
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isPhone ? 120 : 140}px, 1fr))`, gap: 10 }}>
              {MODUL_SEK.slice(0, 6).map((m) => (
                <Link key={m.kode} to={m.path} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: "12px 14px", textDecoration: "none", color: T.primary,
                  fontWeight: 600, fontSize: 12, textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span>{m.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: TUGAS — Kanban Mini 3 Kolom (BAGIAN D.3) ────────── */}
        {tab === "tugas" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <SectionTitle title="Tugas Saya" sub={`${tugas.length} total · ${kanbanDikembalikan.length} dikembalikan · ${tugasOverdue.length} overdue`} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["semua","Semua"],["done","Selesai"],["overdue","Overdue"]].map(([val, label]) => (
                  <button key={val} onClick={() => setFilterTugas(val)} style={{
                    padding: "4px 10px", fontSize: 11, borderRadius: 6,
                    border: `1px solid ${filterTugas === val ? T.primary : T.border}`,
                    background: filterTugas === val ? T.primary : T.card,
                    color: filterTugas === val ? "#fff" : T.textSec,
                    cursor: "pointer", fontWeight: filterTugas === val ? 600 : 400,
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {filterTugas !== "semua" ? (
              /* ── View filter: list biasa ── */
              filteredTugas.length === 0
                ? <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>Tidak ada tugas.</div>
                : filteredTugas.map((t) => <TugasCard key={t.id} t={t} detailTugas={detailTugas} setDetailTugas={setDetailTugas} handleMulai={handleMulai} handleSelesaikan={handleSelesaikan} loading={loading} isOverdue={isOverdue} prioritasColor={prioritasColor} />)
            ) : (
              /* ── Kanban 3 kolom ── */
              <div style={{ display: "grid", gridTemplateColumns: taskBoardColumns, gap: 12, alignItems: "start" }}>
                {/* KOLOM 1: Belum Mulai */}
                <div style={{ background: "#F8FAFC", border: `1px solid ${T.border}`, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: T.info, fontSize: 12, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>
                    ⏳ Belum Mulai ({kanbanBelumMulai.length})
                  </div>
                  {kanbanBelumMulai.length === 0 && <div style={{ fontSize: 12, color: T.textSec, fontStyle: "italic" }}>Tidak ada</div>}
                  {kanbanBelumMulai.map((t) => (
                    <div key={t.id} style={{
                      background: T.card, border: `1px solid ${isOverdue(t.deadline, t.status) ? T.danger : T.border}`,
                      borderRadius: 8, padding: "10px 12px", marginBottom: 8,
                      borderLeft: `3px solid ${isOverdue(t.deadline, t.status) ? T.danger : T.info}`,
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: T.textPri, marginBottom: 4 }}>
                        {t.judul || t.title || "–"}
                        {t.jenis_tugas === "rutin_harian" && (
                          <span style={{ marginLeft: 5, fontSize: 10, background: "#E8F5E9", color: T.success, padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>RUTIN</span>
                        )}
                        {t._substitusi && (
                          <span style={{ marginLeft: 5, fontSize: 10, background: "#FFF3E0", color: T.accent, padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>SUBSTITUSI</span>
                        )}
                      </div>
                      {t.deadline && (
                        <div style={{ fontSize: 10, color: isOverdue(t.deadline, t.status) ? T.danger : T.textSec, marginBottom: 6 }}>
                          {isOverdue(t.deadline, t.status) ? "⚠ " : ""}Deadline: {new Date(t.deadline).toLocaleDateString("id-ID")}
                        </div>
                      )}
                      {t.prioritas && <div style={{ fontSize: 10, color: prioritasColor(t.prioritas), fontWeight: 600, marginBottom: 6 }}>● {t.prioritas}</div>}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleMulai(t.id)} disabled={loading} style={{
                          flex: 1, background: T.info, color: "#fff", border: "none",
                          borderRadius: 5, padding: "5px 0", cursor: "pointer", fontSize: 10, fontWeight: 600,
                        }}>Mulai</button>
                        <button onClick={() => setDetailTugas(detailTugas === t.id ? null : t.id)} style={{
                          background: "transparent", color: T.textSec, border: `1px solid ${T.border}`,
                          borderRadius: 5, padding: "5px 8px", cursor: "pointer", fontSize: 10,
                        }}>Detail</button>
                      </div>
                      {detailTugas === t.id && (
                        <div style={{ marginTop: 8, fontSize: 11, color: T.textSec, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                          {t.deskripsi || t.description || "Tidak ada deskripsi."}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* KOLOM 2: Sedang Berjalan */}
                <div style={{ background: "#FFFDE7", border: `1px solid #FFE082`, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: "#F57F17", fontSize: 12, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>
                    🔄 Sedang Berjalan ({kanbanSedangJalan.length})
                  </div>
                  {kanbanSedangJalan.length === 0 && <div style={{ fontSize: 12, color: T.textSec, fontStyle: "italic" }}>Tidak ada</div>}
                  {kanbanSedangJalan.map((t) => (
                    <div key={t.id} style={{
                      background: T.card, border: `1px solid ${isOverdue(t.deadline, t.status) ? T.danger : "#FFE082"}`,
                      borderRadius: 8, padding: "10px 12px", marginBottom: 8,
                      borderLeft: `3px solid ${T.accent}`,
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: T.textPri, marginBottom: 4 }}>
                        {t.judul || t.title || "–"}
                      </div>
                      {t.started_at && (
                        <div style={{ fontSize: 10, color: T.textSec, marginBottom: 4 }}>
                          Mulai: {new Date(t.started_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                      {t.deadline && (
                        <div style={{ fontSize: 10, color: isOverdue(t.deadline, t.status) ? T.danger : T.textSec, marginBottom: 6 }}>
                          {isOverdue(t.deadline, t.status) ? "⚠ " : ""}Deadline: {new Date(t.deadline).toLocaleDateString("id-ID")}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleSelesaikan(t.id)} disabled={loading} style={{
                          flex: 1, background: T.success, color: "#fff", border: "none",
                          borderRadius: 5, padding: "5px 0", cursor: "pointer", fontSize: 10, fontWeight: 600,
                        }}>Submit Hasil</button>
                        <button onClick={() => setDetailTugas(detailTugas === t.id ? null : t.id)} style={{
                          background: "transparent", color: T.textSec, border: `1px solid ${T.border}`,
                          borderRadius: 5, padding: "5px 8px", cursor: "pointer", fontSize: 10,
                        }}>Detail</button>
                      </div>
                      {detailTugas === t.id && (
                        <div style={{ marginTop: 8, fontSize: 11, color: T.textSec, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                          {t.deskripsi || t.description || "Tidak ada deskripsi."}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* KOLOM 3: Dikembalikan */}
                <div style={{ background: "#FFF8F8", border: `1px solid #FFCDD2`, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: T.danger, fontSize: 12, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>
                    ↩ Dikembalikan ({kanbanDikembalikan.length})
                  </div>
                  {kanbanDikembalikan.length === 0 && <div style={{ fontSize: 12, color: T.textSec, fontStyle: "italic" }}>Tidak ada</div>}
                  {kanbanDikembalikan.map((t) => (
                    <div key={t.id} style={{
                      background: T.card, border: `1px solid #FFCDD2`,
                      borderRadius: 8, padding: "10px 12px", marginBottom: 8,
                      borderLeft: `3px solid ${T.danger}`,
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: T.textPri, marginBottom: 4 }}>
                        {t.judul || t.title || "–"}
                      </div>
                      {t.catatan_kembalikan && (
                        <div style={{ fontSize: 10, background: "#FFEBEE", color: T.danger, borderRadius: 4, padding: "4px 8px", marginBottom: 6 }}>
                          <strong>Catatan:</strong> {t.catatan_kembalikan}
                        </div>
                      )}
                      <button onClick={() => setDetailTugas(detailTugas === t.id ? null : t.id)} style={{
                        width: "100%", background: T.danger, color: "#fff", border: "none",
                        borderRadius: 5, padding: "5px 0", cursor: "pointer", fontSize: 10, fontWeight: 600,
                      }}>Perbaiki & Submit Ulang</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer stats */}
            <div style={{ marginTop: 14, padding: "8px 14px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.textSec, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <span>{kanbanBelumMulai.length} belum mulai</span>
              <span>{kanbanSedangJalan.length} sedang berjalan</span>
              <span>{kanbanDikembalikan.length} dikembalikan</span>
              <span>{tugasSelesai.length} selesai hari ini</span>
              <span style={{ color: tugasOverdue.length > 0 ? T.danger : T.success, fontWeight: 600 }}>{tugasOverdue.length} overdue</span>
            </div>
          </div>
        )}

        {/* ── TAB: SPJ SAYA ────────────────────────────────────────── */}
        {tab === "spj" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <SectionTitle title="SPJ Saya" sub={`${spjList.length} total · ${spjDikembalikan.length} perlu diperbaiki`} />
              <button style={{
                background: T.primary, color: "#fff", border: "none",
                borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}>+ Buat SPJ Baru</button>
            </div>

            {/* Filter bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                ["semua","Semua"],
                ["draft","Draft"],
                ["diajukan_ke_bendahara","Diajukan"],
                ["menunggu_verifikasi","Verifikasi"],
                ["verified","Disetujui"],
                ["rejected","Dikembalikan"],
              ].map(([val, label]) => (
                <button key={val} onClick={() => setFilterSpj(val)} style={{
                  padding: "4px 10px", fontSize: 11, borderRadius: 6,
                  border: `1px solid ${filterSpj === val ? T.primary : T.border}`,
                  background: filterSpj === val ? T.primary : T.card,
                  color: filterSpj === val ? "#fff" : T.textSec,
                  cursor: "pointer", fontWeight: filterSpj === val ? 600 : 400,
                }}>{label}</button>
              ))}
            </div>

            {filteredSpj.length === 0 && (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>Tidak ada SPJ.</div>
            )}

            {filteredSpj.map((s) => {
              const isRejected = s.status === "rejected";
              const isApproved = ["verified","dibayarkan"].includes(s.status);
              const borderColor = isRejected ? T.danger : isApproved ? T.success : T.accent;
              return (
                <div key={s.id} style={{
                  border: `1px solid ${isRejected ? "#FFCDD2" : T.border}`,
                  borderRadius: 10, padding: 16, marginBottom: 12,
                  borderLeft: `4px solid ${borderColor}`,
                  background: isRejected ? "#FFF8F8" : T.card,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: T.textPri, fontSize: 14 }}>{s.judul || s.kegiatan || "–"}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                        <Badge text={s.status} />
                        {s.jenis_spj && (
                          <span style={{ fontSize: 11, color: T.textSec, background: "#F5F5F5", padding: "1px 7px", borderRadius: 4 }}>
                            {s.jenis_spj}
                          </span>
                        )}
                        {s.total_anggaran != null && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>
                            Rp {Number(s.total_anggaran).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: T.textSec, textAlign: "right", flexShrink: 0 }}>
                      {s.updated_at ? new Date(s.updated_at).toLocaleDateString("id-ID") : "–"}
                    </div>
                  </div>

                  {/* Timeline status — SPJ tracking (BAGIAN C.5) */}
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
                    {[
                      ["draft","Draft"],
                      ["diajukan_ke_bendahara","Bendahara"],
                      ["menunggu_verifikasi","PPK"],
                      ["verified","Sekretaris"],
                      ["dibayarkan","Dibayar"],
                    ].map(([st, label], idx, arr) => {
                      const statuses = ["draft","diajukan_ke_bendahara","menunggu_verifikasi","verified","dibayarkan","rejected"];
                      const currentIdx = statuses.indexOf(s.status);
                      const stepIdx = statuses.indexOf(st);
                      const isDone = s.status === "rejected" ? false : stepIdx <= currentIdx;
                      const isCurrent = s.status === st;
                      return (
                        <div key={st} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%", fontSize: 10, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: isDone ? T.success : isCurrent ? T.accent : "#E0E0E0",
                            color: isDone || isCurrent ? "#fff" : T.textSec,
                            flexShrink: 0,
                          }}>
                            {isDone ? "✓" : idx + 1}
                          </div>
                          <div style={{ fontSize: 9, color: isDone ? T.success : T.textSec, marginLeft: 3, marginRight: 3, whiteSpace: "nowrap" }}>
                            {label}
                          </div>
                          {idx < arr.length - 1 && (
                            <div style={{ width: 16, height: 2, background: isDone ? T.success : "#E0E0E0", marginRight: 3 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Catatan jika dikembalikan */}
                  {isRejected && s.catatan_terakhir && (
                    <div style={{ marginTop: 10, background: "#FFEBEE", border: `1px solid #FFCDD2`, borderRadius: 6, padding: "8px 12px", fontSize: 11, color: T.danger }}>
                      <strong>Catatan: </strong>{s.catatan_terakhir}
                    </div>
                  )}

                  {/* Tombol aksi */}
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    {s.status === "draft" && (
                      <>
                        <button style={{
                          background: T.primary, color: "#fff", border: "none",
                          borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 600,
                        }}>Submit ke Bendahara</button>
                        <button style={{
                          background: "transparent", color: T.textSec, border: `1px solid ${T.border}`,
                          borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11,
                        }}>Edit Draft</button>
                      </>
                    )}
                    {isRejected && (
                      <button style={{
                        background: T.danger, color: "#fff", border: "none",
                        borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 600,
                      }}>Perbaiki & Submit Ulang</button>
                    )}
                    {isApproved && (
                      <button style={{
                        background: T.success, color: "#fff", border: "none",
                        borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 11, fontWeight: 600,
                      }}>Download PDF</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB: SURAT ───────────────────────────────────────────── */}
        {tab === "surat" && (
          <div>
            <h2 style={{ color: T.primary, fontSize: 15, marginBottom: 14 }}>Surat Menyurat</h2>

            {/* Surat Masuk */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: T.primary, marginBottom: 10, fontSize: 13 }}>
                Surat Masuk
                {suratBelumBaca > 0 && (
                  <span style={{
                    marginLeft: 8, background: T.danger, color: "#fff",
                    borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700,
                  }}>
                    {suratBelumBaca} baru
                  </span>
                )}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.primary, color: "#fff" }}>
                      {["No. Surat","Perihal","Pengirim","Tanggal","Status","Aksi"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {suratMasuk.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: 16, textAlign: "center", color: T.textSec, fontStyle: "italic" }}>Tidak ada surat masuk.</td></tr>
                    )}
                    {suratMasuk.map((s, i) => (
                      <tr key={s.id || i} style={{
                        background: s.status === "belum_baca" ? "#EBF5FB" : i % 2 === 0 ? "#F8FAFC" : "#fff",
                        borderBottom: `1px solid ${T.border}`,
                        fontWeight: s.status === "belum_baca" ? 600 : 400,
                      }}>
                        <td style={{ padding: "8px 12px", fontSize: 11 }}>{s.nomor || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{s.perihal || "–"}</td>
                        <td style={{ padding: "8px 12px", fontSize: 12 }}>{s.pengirim || "–"}</td>
                        <td style={{ padding: "8px 12px", fontSize: 11 }}>
                          {s.tgl ? new Date(s.tgl).toLocaleDateString("id-ID") : "–"}
                        </td>
                        <td style={{ padding: "8px 12px" }}><Badge text={s.status} /></td>
                        <td style={{ padding: "8px 12px" }}>
                          {s.status === "belum_baca" && (
                            <button
                              onClick={() => handleBacaSurat(s.id)}
                              style={{
                                background: T.primary, color: "#fff", border: "none",
                                borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontSize: 10,
                              }}
                            >
                              Baca
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Surat Keluar */}
            <div>
              <div style={{ fontWeight: 700, color: T.primary, marginBottom: 10, fontSize: 13 }}>Surat Keluar</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.secondary, color: "#fff" }}>
                      {["No. Surat","Perihal","Tujuan","Tanggal","Status"].map((h) => (
                        <th key={h} scope="col" style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {suratKeluar.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: 16, textAlign: "center", color: T.textSec, fontStyle: "italic" }}>Tidak ada surat keluar.</td></tr>
                    )}
                    {suratKeluar.map((s, i) => (
                      <tr key={s.id || i} style={{ background: i % 2 === 0 ? "#F8FAFC" : "#fff", borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "8px 12px", fontSize: 11 }}>{s.nomor || "–"}</td>
                        <td style={{ padding: "8px 12px" }}>{s.perihal || "–"}</td>
                        <td style={{ padding: "8px 12px", fontSize: 12 }}>{s.tujuan || "–"}</td>
                        <td style={{ padding: "8px 12px", fontSize: 11 }}>
                          {s.tgl ? new Date(s.tgl).toLocaleDateString("id-ID") : "–"}
                        </td>
                        <td style={{ padding: "8px 12px" }}><Badge text={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: MODUL KERJA ─────────────────────────────────────── */}
        {tab === "modul" && (
          <div>
            <h2 style={{ color: T.primary, fontSize: 15, marginBottom: 14 }}>Modul Kerja Sekretariat</h2>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isPhone ? 130 : 160}px, 1fr))`, gap: 12 }}>
              {MODUL_SEK.map((m) => (
                <Link
                  key={m.kode}
                  to={m.path}
                  style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                    padding: "16px 14px", textDecoration: "none",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    transition: "box-shadow .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(74,20,140,.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ fontSize: 28 }}>{m.icon}</span>
                  <span style={{ fontWeight: 600, color: T.primary, fontSize: 12, textAlign: "center" }}>{m.label}</span>
                  <span style={{ fontSize: 10, color: T.textSec }}>{m.kode}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: NOTIFIKASI ──────────────────────────────────────── */}
        {tab === "notifikasi" && (
          <div>
            <h2 style={{ color: T.primary, fontSize: 15, marginBottom: 14 }}>Notifikasi</h2>
            {notifList.length === 0 && (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Tidak ada notifikasi.
              </div>
            )}
            {notifList.map((n, i) => {
              const tipeColor = n.tipe === "warning" ? T.warning : n.tipe === "success" ? T.success : n.tipe === "error" ? T.danger : T.primary;
              const tipeIcon  = n.tipe === "warning" ? "⚠" : n.tipe === "success" ? "✓" : n.tipe === "error" ? "✕" : "ℹ";
              return (
                <div key={n.id || i} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "14px 18px", marginBottom: 10,
                  display: "flex", alignItems: "flex-start", gap: 12,
                  opacity: n.dibaca ? 0.7 : 1,
                }}>
                  <span style={{ fontSize: 18, color: tipeColor, flexShrink: 0, marginTop: 1 }}>{tipeIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.textPri, fontWeight: n.dibaca ? 400 : 600 }}>
                      {n.pesan || n.message || "–"}
                    </div>
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>
                      {n.waktu || (n.created_at ? new Date(n.created_at).toLocaleString("id-ID") : "–")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
