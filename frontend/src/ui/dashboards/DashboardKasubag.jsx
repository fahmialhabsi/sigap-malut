// frontend/src/ui/dashboards/DashboardKasubag.jsx
// Role: kasubag_umum_kepegawaian | Level 5 | Verifikator Administrasi Sekretariat

import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

const T = {
  primary: "#00695C", secondary: "#004D40", accent: "#FF8F00",
  danger: "#C62828", success: "#2E7D32", warning: "#E65100",
  bg: "#E0F2F1", card: "#FFFFFF", border: "#B2DFDB",
  textPri: "#0A1F1D", textSec: "#2E6B5E",
};

const ALLOWED = ["kasubag_umum_kepegawaian", "kasubag", "kasubbag_umum_kepegawaian", "super_admin", "sekretaris", "kepala_dinas"];

const STATUS_COLOR = {
  draft: "#546E7A", in_review: "#1565C0", terverifikasi: "#2E7D32",
  dikembalikan: "#E65100", ditolak: "#B71C1C", selesai: "#1B5E20",
  belum_diproses: "#BF360C", terkirim: "#0277BD", diterima: "#00695C",
};

function StatusChip({ status }) {
  return (
    <span style={{ background: STATUS_COLOR[status] || "#546E7A", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function KpiTile({ label, value, color, warn }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${warn ? T.danger : T.border}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{label}</div>
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

const MODUL_SEK = [
  { kode: "SEK-ADM", label: "Administrasi & Kearsipan", icon: "🗃️" },
  { kode: "SEK-HUM", label: "Administrasi SDM & Absensi", icon: "👥" },
  { kode: "SEK-KBJ", label: "Kenaikan Berkala & Jabatan", icon: "🎖️" },
  { kode: "SEK-KEP", label: "SKP & Penilaian Kinerja", icon: "📑" },
  { kode: "SEK-LDS", label: "Layanan Dokumen & Surat", icon: "✉️" },
  { kode: "SEK-LUP", label: "Layanan Umum & Perlengkapan", icon: "🔧" },
  { kode: "SEK-RMH", label: "Rumah Tangga & Fasilitas", icon: "🏠" },
  { kode: "SEK-AST", label: "Pencatatan Aset", icon: "🏢" },
];

export default function DashboardKasubag() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || getUser();
  const roleName = (user?.roleName || user?.role || "").toLowerCase();

  const [tab, setTab] = useState("ringkasan");

  // KPI
  const [kpi, setKpi] = useState(null);

  // Perintah
  const [perintahMasuk, setPerintahMasuk] = useState([]);
  const [perintahKeluar, setPerintahKeluar] = useState([]);
  const [perintahLoading, setPerintahLoading] = useState(true);

  // Form buat perintah ke Pelaksana
  const [formIsi, setFormIsi] = useState("");
  const [formPrioritas, setFormPrioritas] = useState("normal");
  const [formDeadline, setFormDeadline] = useState("");
  const [formSending, setFormSending] = useState(false);

  // Dokumen perlu verifikasi
  const [dokVerif, setDokVerif] = useState([]);
  const [dokLoading, setDokLoading] = useState(true);

  // Surat
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [suratKeluar, setSuratKeluar] = useState([]);
  const [suratLoading, setSuratLoading] = useState(true);

  // Kepegawaian
  const [kepeg, setKepeg] = useState(null);
  const [kepegLoading, setKepegLoading] = useState(true);

  // Notifikasi
  const [notifList, setNotifList] = useState([]);

  useEffect(() => {
    if (!ALLOWED.includes(roleName)) return;
    api.get("/dashboard/kasubag/summary").then((r) => setKpi(r.data?.data || r.data)).catch(() => null);
    api.get("/notifications?limit=8").then((r) => setNotifList(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => null);
    api.get("/dashboard/kasubag/kepegawaian").then((r) => { setKepeg(r.data?.data || r.data); setKepegLoading(false); }).catch(() => setKepegLoading(false));
  }, [roleName]);

  const fetchPerintah = useCallback(() => {
    if (!ALLOWED.includes(roleName)) return;
    setPerintahLoading(true);
    Promise.all([
      api.get("/perintah/masuk").catch(() => ({ data: { data: [] } })),
      api.get("/perintah/keluar").catch(() => ({ data: { data: [] } })),
    ]).then(([masuk, keluar]) => {
      setPerintahMasuk(Array.isArray(masuk.data?.data) ? masuk.data.data : []);
      setPerintahKeluar(Array.isArray(keluar.data?.data) ? keluar.data.data : []);
    }).finally(() => setPerintahLoading(false));
  }, [roleName]);
  useEffect(() => { fetchPerintah(); }, [fetchPerintah]);

  const fetchDokVerif = useCallback(() => {
    if (!ALLOWED.includes(roleName)) return;
    setDokLoading(true);
    api.get("/dashboard/kasubag/verifikasi")
      .then((r) => setDokVerif(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setDokVerif([]))
      .finally(() => setDokLoading(false));
  }, [roleName]);
  useEffect(() => { fetchDokVerif(); }, [fetchDokVerif]);

  const fetchSurat = useCallback(() => {
    if (!ALLOWED.includes(roleName)) return;
    setSuratLoading(true);
    Promise.all([
      api.get("/surat/masuk?limit=20").catch(() => ({ data: { data: [] } })),
      api.get("/surat/keluar?limit=20").catch(() => ({ data: { data: [] } })),
    ]).then(([sm, sk]) => {
      setSuratMasuk(Array.isArray(sm.data?.data) ? sm.data.data : []);
      setSuratKeluar(Array.isArray(sk.data?.data) ? sk.data.data : []);
    }).finally(() => setSuratLoading(false));
  }, [roleName]);
  useEffect(() => { fetchSurat(); }, [fetchSurat]);

  // Auth guard AFTER all hooks
  if (!ALLOWED.includes(roleName)) return <Navigate to="/" replace />;

  const perintahMasukPending = perintahMasuk.filter((p) => !["selesai", "ditolak"].includes(p.status));
  const perintahKeluarPending = perintahKeluar.filter((p) => !["selesai", "ditolak"].includes(p.status));
  const suratBelumProses = suratMasuk.filter((s) => !s.disposisi_at);

  async function handleTerima(id) {
    try { await api.put(`/perintah/${id}/terima`); fetchPerintah(); } catch { /* silent */ }
  }
  async function handleLaporkan(id) {
    const catatan = window.prompt("Catatan laporan ke Sekretaris:");
    if (catatan === null) return;
    try { await api.post(`/perintah/${id}/ajukan`, { catatan }); fetchPerintah(); } catch { /* silent */ }
  }
  async function handleBuatPerintah(e) {
    e.preventDefault();
    if (!formIsi.trim()) return;
    setFormSending(true);
    try {
      await api.post("/perintah", { ke_role: "pelaksana", isi: formIsi, prioritas: formPrioritas, deadline: formDeadline || undefined });
      setFormIsi(""); setFormDeadline("");
      fetchPerintah();
    } catch { /* silent */ }
    finally { setFormSending(false); }
  }
  async function handleVerifikasi(id, aksi) {
    const catatan = aksi === "kembalikan" ? window.prompt("Catatan untuk dikembalikan:") : "";
    if (catatan === null) return;
    try {
      await api.post(`/dashboard/kasubag/verifikasi/${id}/${aksi}`, { catatan });
      fetchDokVerif();
    } catch { /* silent */ }
  }

  const kpiTiles = [
    { label: "Surat Belum Diproses", value: kpi?.surat_belum_proses ?? suratBelumProses.length, color: suratBelumProses.length > 5 ? T.danger : T.warning, warn: suratBelumProses.length > 5 },
    { label: "Dokumen Belum Verifikasi", value: kpi?.dok_belum_verif ?? dokVerif.length, color: dokVerif.length > 3 ? T.danger : T.accent, warn: dokVerif.length > 3 },
    { label: "Perintah Aktif", value: perintahMasukPending.length, color: T.primary },
    { label: "Tugas Pelaksana Pending", value: kpi?.tugas_pelaksana ?? perintahKeluarPending.length, color: perintahKeluarPending.length > 5 ? T.danger : T.textSec, warn: perintahKeluarPending.length > 5 },
    { label: "KGB Pending", value: kpi?.kgb_pending ?? "—", color: T.accent },
    { label: "SKP Belum Lengkap", value: kpi?.skp_belum ?? "—", color: T.warning },
  ];

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "perintah", label: `Perintah (${perintahMasukPending.length + perintahKeluarPending.length})` },
    { id: "verifikasi", label: `Verifikasi (${dokVerif.length})` },
    { id: "administrasi", label: "Administrasi" },
    { id: "kepegawaian", label: "Kepegawaian" },
    { id: "laporan", label: "Laporan & Modul" },
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
          <div style={{ background: T.accent, width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👥</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>SIGAP MALUT</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Kasubag Umum & Kepegawaian · {user?.name || user?.username || "—"}</div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {suratBelumProses.length > 5 && (
            <span style={{ background: T.danger, color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              {suratBelumProses.length} Surat
            </span>
          )}
          {dokVerif.length > 0 && (
            <span style={{ background: T.warning, color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              {dokVerif.length} Verifikasi
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

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── RINGKASAN ── */}
        {tab === "ringkasan" && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, borderRadius: 14, padding: "20px 24px", color: "#fff" }}>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>Dashboard Kasubag Umum & Kepegawaian</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3 }}>Sub Bagian Umum dan Kepegawaian — Sekretariat Dinas Pangan</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4" aria-live="polite">
              {kpiTiles.map((k) => <KpiTile key={k.label} {...k} />)}
            </div>

            {/* Alert strip */}
            {(suratBelumProses.length > 5 || dokVerif.length > 3) && (
              <div style={{ background: "#FFF3E0", border: `1px solid ${T.accent}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.warning, marginBottom: 6 }}>⚠️ Tindakan Diperlukan</div>
                {suratBelumProses.length > 5 && <div style={{ fontSize: 12, color: T.textPri }}>• {suratBelumProses.length} surat masuk belum diproses</div>}
                {dokVerif.length > 3 && <div style={{ fontSize: 12, color: T.textPri }}>• {dokVerif.length} dokumen menunggu verifikasi</div>}
              </div>
            )}

            {/* Tugas Pelaksana pending (preview) */}
            {perintahKeluarPending.length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPri, marginBottom: 10 }}>📋 Tugas Pelaksana Sedang Berjalan</h2>
                {perintahKeluarPending.slice(0, 4).map((p) => (
                  <div key={p.id} style={{ borderBottom: `1px solid ${T.border}`, padding: "8px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: T.textPri }}>{(p.isi || "").slice(0, 70)}</span>
                    <StatusChip status={p.status} />
                  </div>
                ))}
                {perintahKeluarPending.length > 4 && (
                  <button onClick={() => setTab("perintah")} style={{ fontSize: 12, color: T.primary, background: "none", border: "none", cursor: "pointer", marginTop: 8 }}>
                    Lihat semua ({perintahKeluarPending.length}) →
                  </button>
                )}
              </div>
            )}

            {/* Notifikasi */}
            {notifList.length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPri, marginBottom: 10 }}>🔔 Notifikasi Terbaru</h2>
                {notifList.slice(0, 4).map((n, i) => (
                  <div key={n.id ?? i} style={{ borderBottom: `1px solid ${T.border}`, padding: "8px 0", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: n.read_at ? 400 : 600 }}>{n.message || "—"}</span>
                    <span style={{ fontSize: 11, color: T.textSec, whiteSpace: "nowrap", marginLeft: 8 }}>{n.created_at ? new Date(n.created_at).toLocaleString("id-ID") : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PERINTAH ── */}
        {tab === "perintah" && (
          <div className="space-y-5">
            {/* Perintah masuk dari Sekretaris */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📥 Perintah Masuk dari Sekretaris</h2>
              {perintahLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
                : perintahMasuk.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada perintah masuk.</p>
                : perintahMasuk.map((p) => (
                  <div key={p.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${STATUS_COLOR[p.status] || T.primary}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                    <div className="flex justify-between items-start">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{p.nomor_perintah || `#${p.id}`}</div>
                        <div style={{ fontSize: 13, color: T.textPri, marginTop: 4 }}>{p.isi || "—"}</div>
                        {p.deadline && (
                          <div style={{ fontSize: 11, color: new Date(p.deadline) < new Date() ? T.danger : T.textSec, marginTop: 4 }}>
                            Deadline: {new Date(p.deadline).toLocaleDateString("id-ID")}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-3">
                        <StatusChip status={p.status} />
                        <span style={{ fontSize: 10, color: T.textSec, background: "#EEE", borderRadius: 8, padding: "1px 6px" }}>{p.prioritas || "normal"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {p.status === "terkirim" && (
                        <button onClick={() => handleTerima(p.id)} style={{ background: T.primary, color: "#fff", padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>✓ Terima</button>
                      )}
                      {["diterima", "dalam_proses"].includes(p.status) && (
                        <button onClick={() => handleLaporkan(p.id)} style={{ background: T.success, color: "#fff", padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>↑ Laporkan ke Sekretaris</button>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Buat tugas ke Pelaksana */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>📤 Buat Tugas untuk Pelaksana</h2>
              <form onSubmit={handleBuatPerintah} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Prioritas</label>
                    <select value={formPrioritas} onChange={(e) => setFormPrioritas(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4 }}>
                      <option value="rendah">Rendah</option>
                      <option value="normal">Normal</option>
                      <option value="tinggi">Tinggi</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Deadline (opsional)</label>
                    <input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)}
                      style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Instruksi / Tugas</label>
                  <textarea value={formIsi} onChange={(e) => setFormIsi(e.target.value.slice(0, 1000))} rows={3}
                    placeholder="Tuliskan instruksi untuk Pelaksana..."
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4, resize: "vertical" }} />
                  <div style={{ fontSize: 11, color: T.textSec, textAlign: "right" }}>{formIsi.length}/1000</div>
                </div>
                <button type="submit" disabled={formSending || !formIsi.trim()}
                  style={{ background: formSending || !formIsi.trim() ? "#B0BEC5" : T.primary, color: "#fff", padding: "8px 20px", borderRadius: 8, border: "none", cursor: formSending ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
                  {formSending ? "Mengirim..." : "📤 Kirim Tugas"}
                </button>
              </form>
            </div>

            {/* Tracking tugas keluar */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📊 Tracking Tugas Pelaksana</h2>
              {perintahKeluar.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Belum ada tugas dikirim.</p>
                : perintahKeluar.map((p) => (
                  <div key={p.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${STATUS_COLOR[p.status] || "#546E7A"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.nomor_perintah || `#${p.id}`}</div>
                      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{(p.isi || "").slice(0, 80)}{p.isi?.length > 80 ? "..." : ""}</div>
                      {p.progres_persen != null && (
                        <div style={{ marginTop: 5 }}>
                          <div style={{ height: 4, background: "#E0E0E0", borderRadius: 2, width: 160 }}>
                            <div style={{ height: 4, background: T.success, borderRadius: 2, width: `${p.progres_persen}%` }} />
                          </div>
                          <span style={{ fontSize: 10, color: T.textSec }}>{p.progres_persen}%</span>
                        </div>
                      )}
                    </div>
                    <StatusChip status={p.status} />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── VERIFIKASI ── */}
        {tab === "verifikasi" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>🔎 Dokumen Perlu Verifikasi</h2>
            {dokLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
              : dokVerif.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                  <p style={{ color: T.success, fontSize: 14, fontWeight: 600 }}>Semua dokumen sudah terverifikasi</p>
                </div>
              )
              : dokVerif.map((d) => (
                <div key={d.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.accent}`, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.textPri }}>{d.judul || d.title || d.nomor_dokumen || `Dokumen #${d.id}`}</div>
                      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                        Modul: <strong>{d.modul || "—"}</strong> · Diajukan oleh: {d.pengaju || d.dari_user || "—"}
                      </div>
                      {d.catatan_pengaju && (
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 4, fontStyle: "italic" }}>"{d.catatan_pengaju}"</div>
                      )}
                      <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>
                        {d.created_at ? new Date(d.created_at).toLocaleString("id-ID") : ""}
                      </div>
                    </div>
                    <StatusChip status={d.status || "in_review"} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleVerifikasi(d.id, "verifikasi")}
                      style={{ background: T.success, color: "#fff", padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      ✓ Verifikasi
                    </button>
                    <button onClick={() => handleVerifikasi(d.id, "kembalikan")}
                      style={{ background: T.warning, color: "#fff", padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      ↩ Kembalikan
                    </button>
                    <button onClick={() => handleVerifikasi(d.id, "forward-sekretaris")}
                      style={{ background: T.primary, color: "#fff", padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      ↑ Forward ke Sekretaris
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── ADMINISTRASI ── */}
        {tab === "administrasi" && (
          <div className="space-y-5">
            {/* Surat masuk */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📬 Surat Masuk</h2>
              {suratLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
                : suratMasuk.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada surat masuk.</p>
                : suratMasuk.slice(0, 10).map((s) => (
                  <div key={s.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${s.disposisi_at ? T.success : T.danger}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.nomor_surat || s.nomor_agenda || `Surat #${s.id}`}</div>
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                          Dari: {s.pengirim || s.asal_surat || "—"} · {s.tanggal_masuk ? new Date(s.tanggal_masuk).toLocaleDateString("id-ID") : ""}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: s.disposisi_at ? T.success : T.danger, fontWeight: 600 }}>
                        {s.disposisi_at ? "✓ Diproses" : "⚠ Belum"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Surat keluar */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📮 Surat Keluar</h2>
              {suratLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
                : suratKeluar.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada surat keluar.</p>
                : suratKeluar.slice(0, 10).map((s) => (
                  <div key={s.id} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.nomor_surat || s.judul || `Surat #${s.id}`}</div>
                      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>Kepada: {s.tujuan || "—"}</div>
                    </div>
                    <StatusChip status={s.status || "draft"} />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── KEPEGAWAIAN ── */}
        {tab === "kepegawaian" && (
          <div className="space-y-5">
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>👥 Data Kepegawaian</h2>
              {kepegLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
                : kepeg ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Total Pegawai", value: kepeg.total, color: T.primary },
                      { label: "Hadir Hari Ini", value: kepeg.hadir, color: T.success },
                      { label: "Cuti Aktif", value: kepeg.cuti, color: T.warning },
                      { label: "KGB Pending", value: kepeg.kgb_pending, color: kepeg.kgb_pending > 2 ? T.danger : T.accent },
                      { label: "SKP Belum Lengkap", value: kepeg.skp_belum, color: kepeg.skp_belum > 0 ? T.danger : T.success },
                      { label: "Izin / Sakit", value: kepeg.izin_sakit, color: T.textSec },
                    ].map((k) => <KpiTile key={k.label} label={k.label} value={k.value ?? "—"} color={k.color} />)}
                  </div>
                ) : (
                  <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Data kepegawaian belum tersedia.</p>
                )}
            </div>

            <div style={{ background: "#E8F5E9", border: `1px solid #A5D6A7`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "#1B5E20" }}>
                Detail di modul{" "}
                {["SEK-HUM", "SEK-KBJ", "SEK-KEP"].map((m) => (
                  <a key={m} href={`/modul/${m}`} style={{ color: T.primary, fontWeight: 600, marginRight: 8 }}>{m} →</a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LAPORAN & MODUL ── */}
        {tab === "laporan" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>🗂️ Modul yang Dikelola</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {MODUL_SEK.map((m) => (
                <a key={m.kode} href={`/modul/${m.kode}`}
                  style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 14px", textDecoration: "none", display: "block" }}
                  className="hover:shadow-md transition-shadow">
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.textPri }}>{m.kode}</div>
                  <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{m.label}</div>
                </a>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer role="contentinfo" style={{ textAlign: "center", fontSize: 11, color: T.textSec, padding: "12px 0", borderTop: `1px solid ${T.border}`, marginTop: 24 }}>
        SIGAP-MALUT © 2026 · Kasubag Umum & Kepegawaian — Sekretariat Dinas Pangan
      </footer>
    </div>
  );
}
