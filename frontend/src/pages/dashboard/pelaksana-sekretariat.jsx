// frontend/src/pages/dashboard/pelaksana-sekretariat.jsx
// Role: PELAKSANA / STAF — Unit Sekretariat
// Tabs: ringkasan | tugas | surat | modul | notifikasi

import React, { useState, useEffect, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import api from "../../services/api.js";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:  "#4A148C",
  secondary:"#311B92",
  accent:   "#00695C",
  danger:   "#C62828",
  warning:  "#E65100",
  success:  "#2E7D32",
  bg:       "#F3E5F5",
  card:     "#FFFFFF",
  border:   "#CE93D8",
  textPri:  "#1A0035",
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

function Badge({ text }) {
  const map = {
    open:       { bg:"#E3F2FD", fg:"#1565C0" },
    todo:       { bg:"#E3F2FD", fg:"#1565C0" },
    in_progress:{ bg:"#FFF9C4", fg:"#F57F17" },
    proses:     { bg:"#FFF9C4", fg:"#F57F17" },
    done:       { bg:"#E8F5E9", fg:"#2E7D32" },
    selesai:    { bg:"#E8F5E9", fg:"#2E7D32" },
    overdue:    { bg:"#FFEBEE", fg:"#C62828" },
    terlambat:  { bg:"#FFEBEE", fg:"#C62828" },
    belum_baca: { bg:"#FFF3E0", fg:"#E65100" },
    dibaca:     { bg:"#ECEFF1", fg:"#546E7A" },
    disposisi:  { bg:"#F3E5F5", fg:"#6A1B9A" },
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

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
      padding: "14px 18px", minWidth: 140, flex: "1 1 140px",
    }}>
      <div style={{ fontSize: 11, color: T.textSec, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || T.primary }}>{value ?? "–"}</div>
      {sub && <div style={{ fontSize: 10, color: T.textSec, marginTop: 1 }}>{sub}</div>}
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

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PelaksanaSekretariat() {
  const [tab, setTab]               = useState("ringkasan");
  const [tugas, setTugas]           = useState([]);
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [suratKeluar, setSuratKeluar] = useState([]);
  const [notifList, setNotifList]   = useState([]);
  const [detailTugas, setDetailTugas] = useState(null);
  const [filterTugas, setFilterTugas] = useState("semua");
  const [loading, setLoading]       = useState(false);
  const [notif, setNotif]           = useState(null);

  const user    = getUser();
  const role    = (user?.role || user?.roleName || "").toLowerCase();
  const allowed = ALLOWED.includes(role);

  const showNotif = useCallback((msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  }, []);

  const loadTugas = useCallback(async () => {
    try {
      const r = await api.get("/tasks?unit=sekretariat&limit=30");
      const d = r.data?.data || r.data?.tasks || [];
      setTugas(d.length ? d : STATIC_TUGAS);
    } catch { setTugas(STATIC_TUGAS); }
  }, []);

  const loadSurat = useCallback(async () => {
    try {
      const [rm, rk] = await Promise.all([
        api.get("/surat/masuk?limit=20"),
        api.get("/surat/keluar?limit=20"),
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
      const r = await api.get("/notification?limit=20");
      const d = r.data?.data || [];
      setNotifList(d.length ? d : STATIC_NOTIF);
    } catch { setNotifList(STATIC_NOTIF); }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    loadTugas();
    loadNotif();
  }, [allowed, loadTugas, loadNotif]);

  useEffect(() => {
    if (!allowed) return;
    if (tab === "surat") loadSurat();
  }, [tab, allowed, loadSurat]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!allowed) return <Navigate to="/unauthorized" replace />;

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

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSelesaikan = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tasks/${id}`, { status: "done" });
      showNotif("Tugas ditandai selesai.");
      await loadTugas();
      setDetailTugas(null);
    } catch (e) {
      showNotif(e.response?.data?.message || "Gagal mengupdate tugas.", "error");
    } finally { setLoading(false); }
  };

  const handleMulai = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tasks/${id}`, { status: "in_progress" });
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
        color: "#fff", padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Dashboard Pelaksana — Sekretariat</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {user?.name || user?.username || "—"} &nbsp;·&nbsp; Unit Sekretariat
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
        </div>
      </header>

      {/* Notifikasi toast */}
      {notif && (
        <div aria-live="polite" style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          background: notif.type === "error" ? T.danger : notif.type === "warning" ? T.warning : T.accent,
          color: "#fff", padding: "10px 20px", borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,.2)", fontSize: 13, maxWidth: 340,
        }}>
          {notif.msg}
        </div>
      )}

      {/* Tab Bar */}
      <nav style={{ background: T.card, borderBottom: `2px solid ${T.border}`, padding: "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
        {TABS.map((t) => {
          const badge =
            t.id === "tugas"      ? (tugasTodo.length + tugasProses.length) || null :
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

      <main id="main-content" style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── TAB: RINGKASAN ───────────────────────────────────────── */}
        {tab === "ringkasan" && (
          <div>
            <h2 style={{ color: T.primary, fontSize: 15, marginBottom: 14 }}>
              Selamat datang, {user?.name?.split(" ")[0] || "Rekan"}!
            </h2>

            {/* KPI row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <KpiCard label="Tugas Aktif"      value={tugasTodo.length + tugasProses.length} color={T.warning} />
              <KpiCard label="Tugas Selesai"    value={tugasSelesai.length} color={T.success} />
              <KpiCard label="Overdue"          value={tugasOverdue.length} color={T.danger} />
              <KpiCard label="Surat Belum Baca" value={suratBelumBaca} sub="surat masuk" />
              <KpiCard label="Notifikasi Baru"  value={notifBelumBaca} />
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

            {/* Modul shortcut */}
            <div style={{ fontWeight: 600, color: T.primary, marginBottom: 10, fontSize: 13 }}>Akses Cepat Modul</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {MODUL_SEK.slice(0, 6).map((m) => (
                <Link key={m.kode} to={m.path} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: "12px 14px", textDecoration: "none", color: T.primary,
                  fontWeight: 600, fontSize: 12, textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span>{m.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: TUGAS ───────────────────────────────────────────── */}
        {tab === "tugas" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ color: T.primary, fontSize: 15, margin: 0 }}>Tugas Saya</h2>
              <div style={{ display: "flex", gap: 6 }}>
                {["semua","todo","in_progress","done","overdue"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterTugas(s)}
                    style={{
                      padding: "4px 10px", fontSize: 11, borderRadius: 6,
                      border: `1px solid ${filterTugas === s ? T.primary : T.border}`,
                      background: filterTugas === s ? T.primary : T.card,
                      color: filterTugas === s ? "#fff" : T.textSec,
                      cursor: "pointer", fontWeight: filterTugas === s ? 600 : 400,
                    }}
                  >
                    {s === "semua" ? "Semua" : s === "in_progress" ? "Proses" : s === "overdue" ? "Terlambat" : s === "done" ? "Selesai" : "Todo"}
                  </button>
                ))}
              </div>
            </div>

            {filteredTugas.length === 0 && (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Tidak ada tugas.
              </div>
            )}

            {filteredTugas.map((t) => (
              <div key={t.id} style={{
                background: T.card, border: `1px solid ${isOverdue(t.deadline, t.status) ? T.danger : T.border}`,
                borderRadius: 10, padding: 16, marginBottom: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: T.textPri, fontSize: 14 }}>{t.judul || t.title || "–"}</div>
                    {(t.deskripsi || t.description) && (
                      <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>
                        {t.deskripsi || t.description}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <Badge text={t.status} />
                      {t.prioritas && (
                        <span style={{ fontSize: 11, color: prioritasColor(t.prioritas), fontWeight: 600 }}>
                          ● {t.prioritas}
                        </span>
                      )}
                      {t.deadline && (
                        <span style={{ fontSize: 11, color: isOverdue(t.deadline, t.status) ? T.danger : T.textSec }}>
                          Deadline: {new Date(t.deadline).toLocaleDateString("id-ID")}
                          {isOverdue(t.deadline, t.status) && " ⚠"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand detail */}
                {detailTugas === t.id ? (
                  <div style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["todo","open"].includes(t.status) && (
                        <button
                          onClick={() => handleMulai(t.id)}
                          disabled={loading}
                          style={{
                            background: T.warning, color: "#fff", border: "none",
                            borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                          }}
                        >
                          Mulai Kerjakan
                        </button>
                      )}
                      {["in_progress","proses"].includes(t.status) && (
                        <button
                          onClick={() => handleSelesaikan(t.id)}
                          disabled={loading}
                          style={{
                            background: T.accent, color: "#fff", border: "none",
                            borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                          }}
                        >
                          Tandai Selesai
                        </button>
                      )}
                      <button
                        onClick={() => setDetailTugas(null)}
                        style={{
                          background: "transparent", color: T.textSec,
                          border: `1px solid ${T.border}`, borderRadius: 6,
                          padding: "7px 12px", cursor: "pointer", fontSize: 12,
                        }}
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                ) : (
                  !["done","selesai"].includes(t.status) && (
                    <button
                      onClick={() => setDetailTugas(t.id)}
                      style={{
                        marginTop: 10, background: "transparent", color: T.primary,
                        border: `1px solid ${T.primary}`, borderRadius: 6,
                        padding: "5px 12px", cursor: "pointer", fontSize: 11,
                      }}
                    >
                      Kelola Tugas
                    </button>
                  )
                )}
              </div>
            ))}
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
                        background: s.status === "belum_baca" ? "#FAF0FF" : i % 2 === 0 ? "#F5F0EE" : "#fff",
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
                      <tr key={s.id || i} style={{ background: i % 2 === 0 ? "#F5F0EE" : "#fff", borderBottom: `1px solid ${T.border}` }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
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
