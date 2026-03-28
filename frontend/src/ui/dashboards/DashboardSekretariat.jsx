// frontend/src/ui/dashboards/DashboardSekretariat.jsx
// Role: sekretaris | Level 6 | Hub koordinasi Sekretariat

import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

const T = {
  primary: "#283593", secondary: "#1A237E", accent: "#F57C00",
  danger: "#C62828", success: "#2E7D32", warning: "#E65100",
  bg: "#E8EAF6", card: "#FFFFFF", border: "#C5CAE9",
  textPri: "#0D0F2B", textSec: "#3949AB",
};

const ALLOWED = ["sekretaris", "super_admin", "kepala_dinas"];

const STATUS_COLOR = {
  draft: "#546E7A", pending: "#1565C0", in_progress: "#F57C00",
  diajukan: "#7B1FA2", disetujui: "#2E7D32", selesai: "#1B5E20",
  dikembalikan: "#E65100", ditolak: "#B71C1C", terkirim: "#0277BD",
  diterima: "#00695C", belum_disposisi: "#BF360C",
};

const BAWAHAN = [
  { role: "kasubag_umum_kepegawaian", label: "Kasubag Umum & Kepegawaian", icon: "👥" },
  { role: "fungsional_perencana", label: "Fungsional Perencanaan", icon: "📊" },
  { role: "fungsional_analis_keuangan", label: "Fungsional Keuangan", icon: "💰" },
  { role: "bendahara_pengeluaran", label: "Bendahara Pengeluaran", icon: "🏦" },
  { role: "pelaksana", label: "Pelaksana Sekretariat", icon: "📋" },
];

const MODUL_SEK = [
  { kode: "SEK-ADM", label: "Administrasi & Kearsipan", icon: "🗃️" },
  { kode: "SEK-AST", label: "Pengelolaan Aset", icon: "🏢" },
  { kode: "SEK-HUM", label: "Administrasi SDM", icon: "👤" },
  { kode: "SEK-KBJ", label: "Kenaikan Berkala & Jabatan", icon: "🎖️" },
  { kode: "SEK-KEP", label: "Kepegawaian & SKP", icon: "📑" },
  { kode: "SEK-KEU", label: "Pengelolaan Keuangan", icon: "💹" },
  { kode: "SEK-LDS", label: "Layanan Dokumen & Surat", icon: "✉️" },
  { kode: "SEK-LKS", label: "Laporan Kegiatan", icon: "📋" },
  { kode: "SEK-LKT", label: "Laporan Keuangan Triwulan", icon: "📈" },
  { kode: "SEK-LUP", label: "Layanan Umum & Perlengkapan", icon: "🏗️" },
  { kode: "SEK-REN", label: "Perencanaan Program", icon: "🗺️" },
  { kode: "SEK-RMH", label: "Rumah Tangga & Fasilitas", icon: "🏠" },
];

function StatusChip({ status }) {
  return (
    <span style={{ background: STATUS_COLOR[status] || "#546E7A", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function KpiTile({ label, value, color, sub }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
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

export default function DashboardSekretariat() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || getUser();
  const roleName = (user?.roleName || user?.role || "").toLowerCase();

  const [tab, setTab] = useState("ringkasan");

  // KPI
  const [kpi, setKpi] = useState(null);

  // Perintah masuk (dari KaDin) + keluar (ke bawahan)
  const [perintahMasuk, setPerintahMasuk] = useState([]);
  const [perintahKeluar, setPerintahKeluar] = useState([]);
  const [perintahLoading, setPerintahLoading] = useState(true);

  // Form buat perintah ke bawahan
  const [formRole, setFormRole] = useState(BAWAHAN[0].role);
  const [formIsi, setFormIsi] = useState("");
  const [formPrioritas, setFormPrioritas] = useState("normal");
  const [formDeadline, setFormDeadline] = useState("");
  const [formSending, setFormSending] = useState(false);

  // Approval queue
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(true);

  // Surat
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [suratKeluar, setSuratKeluar] = useState([]);
  const [suratLoading, setSuratLoading] = useState(true);

  // Notifikasi
  const [notifList, setNotifList] = useState([]);

  // Keuangan ringkasan
  const [keuangan, setKeuangan] = useState(null);

  // Kepegawaian ringkasan
  const [kepegawaian, setKepegawaian] = useState(null);

  useEffect(() => {
    if (!ALLOWED.includes(roleName)) return;
    api.get("/dashboard/sekretaris/kpi").then((r) => setKpi(r.data?.data || r.data)).catch(() => null);
    api.get("/notifications?limit=10").then((r) => setNotifList(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => null);
    api.get("/dashboard/sekretaris/keuangan").then((r) => setKeuangan(r.data?.data ?? r.data)).catch(() => null);
    api.get("/dashboard/sekretaris/kepegawaian").then((r) => setKepegawaian(r.data?.data ?? r.data)).catch(() => null);
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

  const fetchApproval = useCallback(() => {
    if (!ALLOWED.includes(roleName)) return;
    setApprovalLoading(true);
    api.get("/dashboard/sekretaris/approval-queue")
      .then((r) => setApprovalQueue(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setApprovalQueue([]))
      .finally(() => setApprovalLoading(false));
  }, [roleName]);
  useEffect(() => { fetchApproval(); }, [fetchApproval]);

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

  // Derived counts
  const perintahMasukPending = perintahMasuk.filter((p) => !["selesai", "ditolak"].includes(p.status));
  const perintahKeluarPending = perintahKeluar.filter((p) => !["selesai", "ditolak"].includes(p.status));
  const suratBelumDisposisi = suratMasuk.filter((s) => s.status === "belum_disposisi" || !s.disposisi_at);
  const suratPendingTTD = suratKeluar.filter((s) => !s.ttd_sekretaris_at && s.status !== "draft");

  async function handleTerima(id) {
    try { await api.put(`/perintah/${id}/terima`); fetchPerintah(); } catch { /* silent */ }
  }
  async function handleAjukan(id) {
    const catatan = window.prompt("Catatan laporan ke Kepala Dinas:");
    if (catatan === null) return;
    try { await api.post(`/perintah/${id}/ajukan`, { catatan }); fetchPerintah(); } catch { /* silent */ }
  }
  async function handleBuatPerintah(e) {
    e.preventDefault();
    if (!formIsi.trim()) return;
    setFormSending(true);
    try {
      await api.post("/perintah", {
        ke_role: formRole,
        isi: formIsi,
        prioritas: formPrioritas,
        deadline: formDeadline || undefined,
      });
      setFormIsi("");
      setFormDeadline("");
      fetchPerintah();
    } catch { /* silent */ }
    finally { setFormSending(false); }
  }
  async function handleApproval(id, aksi) {
    const catatan = aksi !== "setujui" ? window.prompt(`Alasan ${aksi}:`) : "";
    if (catatan === null) return;
    try {
      await api.post(`/dashboard/approval/${id}/${aksi}`, { catatan });
      fetchApproval();
    } catch { /* silent */ }
  }
  async function handleDisposisi(id) {
    const tujuan = window.prompt("Disposisi ke (nama/jabatan):");
    if (!tujuan) return;
    try { await api.post(`/surat/masuk/${id}/disposisi`, { tujuan }); fetchSurat(); } catch { /* silent */ }
  }
  async function handleTTD(id) {
    try { await api.put(`/surat/keluar/${id}/ttd`); fetchSurat(); } catch { /* silent */ }
  }

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "perintah", label: `Perintah (${perintahMasukPending.length + perintahKeluarPending.length})` },
    { id: "persetujuan", label: `Persetujuan (${approvalQueue.length})` },
    { id: "surat", label: `Surat & Dokumen` },
    { id: "keuangan", label: "Keuangan" },
    { id: "kepegawaian", label: "Kepegawaian" },
    { id: "laporan", label: "Laporan & Modul" },
  ];

  const kpiTiles = [
    { label: "Surat Belum Disposisi", value: kpi?.surat_belum_disposisi ?? suratBelumDisposisi.length, color: suratBelumDisposisi.length > 10 ? T.danger : T.warning },
    { label: "Surat Pending TTD", value: kpi?.surat_pending_ttd ?? suratPendingTTD.length, color: suratPendingTTD.length > 5 ? T.danger : T.accent },
    { label: "Persetujuan Pending", value: kpi?.approval_pending ?? approvalQueue.length, color: T.primary },
    { label: "Perintah Aktif", value: kpi?.perintah_aktif ?? perintahMasukPending.length, color: T.secondary },
    { label: "Anggaran Terserap", value: kpi?.anggaran_pct != null ? `${kpi.anggaran_pct}%` : "—", color: (kpi?.anggaran_pct ?? 100) < 70 ? T.danger : T.success, sub: kpi?.anggaran_pct < 70 ? "< 70% — Warning" : null },
    { label: "Tugas Bawahan Pending", value: kpi?.tugas_bawahan_pending ?? perintahKeluarPending.length, color: perintahKeluarPending.length > 5 ? T.danger : T.textSec },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <a href="#main-content" style={{ position: "absolute", left: -9999 }}
        onFocus={(e) => { e.target.style.left = "1rem"; }}
        onBlur={(e) => { e.target.style.left = "-9999px"; }}>
        Lewati ke konten utama
      </a>

      {/* Header */}
      <header role="banner" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, borderBottom: `3px solid ${T.accent}` }}
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div style={{ background: T.accent, width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏛️</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>SIGAP MALUT</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Sekretaris Dinas · {user?.name || user?.username || "—"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {suratBelumDisposisi.length > 0 && (
            <span style={{ background: T.danger, color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              {suratBelumDisposisi.length} Disposisi
            </span>
          )}
          {approvalQueue.length > 0 && (
            <span style={{ background: T.warning, color: "#fff", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              {approvalQueue.length} Approval
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
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>Dashboard Sekretaris Dinas</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3 }}>Sekretariat Dinas Pangan Provinsi Maluku Utara</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4" aria-live="polite">
              {kpiTiles.map((k) => <KpiTile key={k.label} {...k} />)}
            </div>

            {/* Alert strip */}
            {(suratBelumDisposisi.length > 10 || suratPendingTTD.length > 5 || approvalQueue.length > 0) && (
              <div style={{ background: "#FFF3E0", border: `1px solid ${T.accent}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.warning, marginBottom: 6 }}>⚠️ Perhatian</div>
                {suratBelumDisposisi.length > 10 && <div style={{ fontSize: 12, color: T.textPri }}>• {suratBelumDisposisi.length} surat masuk belum disposisi</div>}
                {suratPendingTTD.length > 5 && <div style={{ fontSize: 12, color: T.textPri }}>• {suratPendingTTD.length} surat keluar menunggu tanda tangan</div>}
                {approvalQueue.length > 0 && <div style={{ fontSize: 12, color: T.textPri }}>• {approvalQueue.length} dokumen menunggu persetujuan</div>}
              </div>
            )}

            {/* Notifikasi terbaru */}
            {notifList.length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPri, marginBottom: 10 }}>🔔 Notifikasi Terbaru</h2>
                {notifList.slice(0, 5).map((n, i) => (
                  <div key={n.id ?? i} style={{ borderBottom: `1px solid ${T.border}`, padding: "8px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 13, fontWeight: n.read_at ? 400 : 600, color: T.textPri }}>{n.message || "—"}</span>
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
            {/* Perintah masuk dari KaDin */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📥 Perintah Masuk dari Kepala Dinas</h2>
              {perintahLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
                : perintahMasuk.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada perintah masuk.</p>
                : perintahMasuk.map((p) => (
                  <div key={p.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${STATUS_COLOR[p.status] || T.primary}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                    <div className="flex justify-between items-start">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: T.textPri }}>{p.nomor_perintah || `#${p.id}`}</div>
                        <div style={{ fontSize: 13, color: T.textPri, marginTop: 4 }}>{p.isi || "—"}</div>
                        {p.deadline && <div style={{ fontSize: 11, color: new Date(p.deadline) < new Date() ? T.danger : T.textSec, marginTop: 4 }}>Deadline: {new Date(p.deadline).toLocaleDateString("id-ID")}</div>}
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
                        <button onClick={() => handleAjukan(p.id)} style={{ background: T.success, color: "#fff", padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>↑ Laporkan ke KaDin</button>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Buat perintah ke bawahan */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>📤 Buat Perintah ke Bawahan</h2>
              <form onSubmit={handleBuatPerintah} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Ditujukan ke</label>
                    <select value={formRole} onChange={(e) => setFormRole(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4 }}>
                      {BAWAHAN.map((b) => <option key={b.role} value={b.role}>{b.icon} {b.label}</option>)}
                    </select>
                  </div>
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
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Isi Perintah</label>
                  <textarea value={formIsi} onChange={(e) => setFormIsi(e.target.value.slice(0, 1000))} rows={3} placeholder="Tuliskan instruksi/perintah..."
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4, resize: "vertical" }} />
                  <div style={{ fontSize: 11, color: T.textSec, textAlign: "right" }}>{formIsi.length}/1000</div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>Deadline (opsional)</label>
                  <input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)}
                    style={{ display: "block", padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 4 }} />
                </div>
                <button type="submit" disabled={formSending || !formIsi.trim()}
                  style={{ background: formSending || !formIsi.trim() ? "#B0BEC5" : T.primary, color: "#fff", padding: "8px 20px", borderRadius: 8, border: "none", cursor: formSending ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
                  {formSending ? "Mengirim..." : "📤 Kirim Perintah"}
                </button>
              </form>
            </div>

            {/* Perintah keluar — tracking */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📊 Tracking Perintah ke Bawahan</h2>
              {perintahKeluar.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Belum ada perintah dikirim.</p>
                : perintahKeluar.map((p) => (
                  <div key={p.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${STATUS_COLOR[p.status] || "#546E7A"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.nomor_perintah || `#${p.id}`} → {p.ke_role?.replace(/_/g, " ")}</div>
                      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{(p.isi || "").slice(0, 80)}{p.isi?.length > 80 ? "..." : ""}</div>
                      {p.progres_persen != null && (
                        <div style={{ marginTop: 6 }}>
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

        {/* ── PERSETUJUAN ── */}
        {tab === "persetujuan" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>✅ Antrian Persetujuan</h2>
            {approvalLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
              : approvalQueue.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada dokumen menunggu persetujuan.</p>
              : approvalQueue.map((a) => (
                <div key={a.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.accent}`, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.textPri }}>{a.judul || a.title || a.nomor_dokumen || `Dokumen #${a.id}`}</div>
                      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>Jenis: {a.jenis || a.type || "—"} · Dari: {a.pengaju || a.dari_user || "—"}</div>
                      {a.catatan && <div style={{ fontSize: 12, color: T.textSec, marginTop: 2, fontStyle: "italic" }}>"{a.catatan}"</div>}
                    </div>
                    <StatusChip status={a.status} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleApproval(a.id, "setujui")}
                      style={{ background: T.success, color: "#fff", padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓ Setujui</button>
                    <button onClick={() => handleApproval(a.id, "kembalikan")}
                      style={{ background: T.warning, color: "#fff", padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>↩ Kembalikan</button>
                    <button onClick={() => handleApproval(a.id, "tolak")}
                      style={{ background: T.danger, color: "#fff", padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✗ Tolak</button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── SURAT & DOKUMEN ── */}
        {tab === "surat" && (
          <div className="space-y-5">
            {/* Surat masuk */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📬 Surat Masuk</h2>
              {suratLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
                : suratMasuk.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada surat masuk.</p>
                : suratMasuk.map((s) => (
                  <div key={s.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${s.disposisi_at ? T.success : T.danger}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.nomor_surat || s.judul || `Surat #${s.id}`}</div>
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>Dari: {s.pengirim || s.dari || "—"} · {s.tanggal_masuk ? new Date(s.tanggal_masuk).toLocaleDateString("id-ID") : ""}</div>
                      </div>
                      <span style={{ fontSize: 11, color: s.disposisi_at ? T.success : T.danger, fontWeight: 600 }}>
                        {s.disposisi_at ? "✓ Disposisi" : "⚠ Belum Disposisi"}
                      </span>
                    </div>
                    {!s.disposisi_at && (
                      <button onClick={() => handleDisposisi(s.id)}
                        style={{ marginTop: 8, background: T.primary, color: "#fff", padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>
                        📋 Disposisi
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* Surat keluar pending TTD */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 12 }}>📮 Surat Keluar — Pending Tanda Tangan</h2>
              {suratLoading ? <p className="animate-pulse" style={{ color: T.textSec, fontSize: 13 }}>Memuat...</p>
                : suratKeluar.length === 0 ? <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Tidak ada surat keluar pending.</p>
                : suratKeluar.map((s) => (
                  <div key={s.id} style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${s.ttd_sekretaris_at ? T.success : T.warning}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.nomor_surat || s.judul || `Surat #${s.id}`}</div>
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>Kepada: {s.tujuan || "—"} · {s.tanggal_keluar ? new Date(s.tanggal_keluar).toLocaleDateString("id-ID") : ""}</div>
                      </div>
                      <span style={{ fontSize: 11, color: s.ttd_sekretaris_at ? T.success : T.warning, fontWeight: 600 }}>
                        {s.ttd_sekretaris_at ? "✓ TTD" : "⏳ Pending TTD"}
                      </span>
                    </div>
                    {!s.ttd_sekretaris_at && s.status !== "draft" && (
                      <button onClick={() => handleTTD(s.id)}
                        style={{ marginTop: 8, background: T.primary, color: "#fff", padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>
                        ✍️ Tanda Tangan
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── KEUANGAN ── */}
        {tab === "keuangan" && (
          <div className="space-y-5">
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>💹 Ringkasan Keuangan Sekretariat</h2>
              {keuangan ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Anggaran", value: keuangan.total_anggaran ? `Rp ${Number(keuangan.total_anggaran).toLocaleString("id-ID")}` : "—", color: T.primary },
                    { label: "Realisasi", value: keuangan.realisasi ? `Rp ${Number(keuangan.realisasi).toLocaleString("id-ID")}` : "—", color: T.success },
                    { label: "Serapan (%)", value: keuangan.persen_serapan != null ? `${keuangan.persen_serapan}%` : "—", color: (keuangan.persen_serapan ?? 100) < 70 ? T.danger : T.success },
                    { label: "SPP Pending", value: keuangan.spp_pending ?? "—", color: T.warning },
                    { label: "SPM Pending", value: keuangan.spm_pending ?? "—", color: T.accent },
                    { label: "LPJ Pending", value: keuangan.lpj_pending ?? "—", color: T.danger },
                  ].map((k) => <KpiTile key={k.label} {...k} />)}
                </div>
              ) : (
                <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Data keuangan tidak tersedia.</p>
              )}
            </div>
            <div style={{ background: "#FFF8E1", border: `1px solid #FFE082`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "#5D4037" }}>
                Detail laporan keuangan tersedia di modul <strong>SEK-KEU</strong> dan <strong>SEK-LKT</strong>.{" "}
                <a href="/modul/SEK-KEU" style={{ color: T.primary, fontWeight: 600 }}>Buka SEK-KEU →</a>
              </div>
            </div>
          </div>
        )}

        {/* ── KEPEGAWAIAN ── */}
        {tab === "kepegawaian" && (
          <div className="space-y-5">
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>👥 Ringkasan Kepegawaian</h2>
              {kepegawaian ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Pegawai", value: kepegawaian.total ?? "—", color: T.primary },
                    { label: "Pegawai Aktif", value: kepegawaian.aktif ?? "—", color: T.success },
                    { label: "Cuti Aktif", value: kepegawaian.cuti ?? "—", color: T.warning },
                    { label: "KGB Pending", value: kepegawaian.kgb_pending ?? "—", color: kepegawaian.kgb_pending > 3 ? T.danger : T.accent },
                    { label: "SKP Belum Dinilai", value: kepegawaian.skp_belum ?? "—", color: kepegawaian.skp_belum > 0 ? T.danger : T.success },
                    { label: "Pelatihan Pending", value: kepegawaian.pelatihan_pending ?? "—", color: T.textSec },
                  ].map((k) => <KpiTile key={k.label} {...k} />)}
                </div>
              ) : (
                <p style={{ color: T.textSec, fontSize: 13, fontStyle: "italic" }}>Data kepegawaian tidak tersedia.</p>
              )}
            </div>
            <div style={{ background: "#E8F5E9", border: `1px solid #A5D6A7`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "#1B5E20" }}>
                Detail kepegawaian di modul <strong>SEK-HUM</strong>, <strong>SEK-KEP</strong>, dan <strong>SEK-KBJ</strong>.{" "}
                <a href="/modul/SEK-HUM" style={{ color: T.success, fontWeight: 600 }}>Buka SEK-HUM →</a>
              </div>
            </div>
          </div>
        )}

        {/* ── LAPORAN & MODUL ── */}
        {tab === "laporan" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 14 }}>🗂️ Modul Sekretariat</h2>
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
        SIGAP-MALUT © 2026 · Sekretaris Dinas Pangan Provinsi Maluku Utara
      </footer>
    </div>
  );
}
