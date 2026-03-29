// frontend/src/ui/dashboards/DashboardSekretariat.jsx
// Role: sekretaris | Level 6 | Hub koordinasi & gateway Sekretariat → Kepala Dinas
// Panels: InboxKadin | ApprovalQueue 5-tab | MonitorPerintah | ScorecardBawahan
//         Monitor50KPI | BypassAlert | KonsolidasiLaporan | ProgramPrioritas (SPPG+TPID)

import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  primary: "#283593", secondary: "#1A237E", accent: "#F57C00",
  danger: "#C62828", success: "#2E7D32", warning: "#E65100",
  bg: "#E8EAF6", card: "#FFFFFF", border: "#C5CAE9",
  textPri: "#0D0F2B", textSec: "#3949AB",
  sidebarBg: "#1A237E", sidebarText: "#E8EAF6", sidebarActive: "#283593",
};

const ALLOWED = ["sekretaris", "super_admin", "kepala_dinas"];

const STATUS_COLOR = {
  draft: "#546E7A", menunggu_verifikasi_kasubag: "#1565C0",
  menunggu_analisa_jf: "#7B1FA2", menunggu_persetujuan_sekretaris: "#E65100",
  disetujui: "#2E7D32", ditolak: "#B71C1C",
  dikembalikan_sekretaris: "#E65100", diteruskan_ke_kadin: "#0277BD",
  diterbitkan: "#1565C0", dibaca: "#558B2F", diproses: "#F57C00",
  selesai: "#1B5E20", on_target: "#2E7D32", warning: "#E65100",
  below_target: "#B71C1C", no_data: "#90A4AE",
};

const PRIORITAS_COLOR = { kritis: "#B71C1C", mendesak: "#B71C1C", tinggi: "#E65100", normal: "#1565C0", rendah: "#546E7A" };

const BAWAHAN = [
  { role: "kasubag_umum_kepegawaian", label: "Kasubag Umum & Kepeg.", jabatan: "kasubag_umum_kepeg", icon: "👥" },
  { role: "fungsional_perencana", label: "JF Perencanaan", jabatan: "jf_perencanaan", icon: "📊" },
  { role: "fungsional_analis_keuangan", label: "JF Keuangan / PPK", jabatan: "jf_keuangan", icon: "💰" },
  { role: "bendahara_pengeluaran", label: "Bendahara Pengeluaran", jabatan: "bendahara_pengeluaran", icon: "🏦" },
  { role: "bendahara_gaji", label: "Bendahara Gaji", jabatan: "bendahara_gaji", icon: "💵" },
  { role: "bendahara_barang", label: "Bendahara Barang", jabatan: "bendahara_barang", icon: "📦" },
  { role: "pelaksana", label: "Pelaksana Sekretariat", jabatan: "pelaksana_sekretariat", icon: "📋" },
];

const SIDEBAR_ITEMS = [
  { key: "overview", label: "Dashboard", icon: "📊" },
  { key: "inbox_kadin", label: "Inbox Kepala Dinas", icon: "📥", badge: "inbox_kadin" },
  { key: "approval", label: "Approval Queue", icon: "✅", badge: "approval_pending" },
  { key: "monitor_perintah", label: "Monitor Perintah", icon: "📋" },
  { key: "scorecard", label: "Kinerja Bawahan", icon: "🎯" },
  { key: "kpi", label: "Monitor 50 KPI", icon: "📈" },
  { key: "bypass", label: "Bypass Alert", icon: "🔍", badge: "bypass_bulan_ini" },
  { key: "konsolidasi", label: "Konsolidasi Bidang", icon: "📑" },
  { key: "sppg", label: "SPPG / TPID", icon: "🌾" },
  { key: "notifikasi", label: "Notifikasi", icon: "🔔", badge: "notif_unread" },
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

const KPI_KATEGORI = ["operasional", "akuntabilitas", "kepegawaian", "keuangan", "aset", "strategis"];

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
function Badge({ n, color = T.danger }) {
  if (!n) return null;
  return (
    <span style={{
      background: color, color: "#fff", borderRadius: 10,
      fontSize: 10, fontWeight: 700, padding: "1px 6px", marginLeft: 6,
    }}>{n > 99 ? "99+" : n}</span>
  );
}

function StatusChip({ status, size = 11 }) {
  const color = STATUS_COLOR[status] || "#546E7A";
  return (
    <span style={{ background: color, color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: size, fontWeight: 600 }}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: T.card, borderRadius: 12, padding: 18,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: `1px solid ${T.border}`, ...style,
    }}>
      {children}
    </div>
  );
}

function KpiTile({ label, value, color, sub, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.card, border: `1px solid ${T.border}`, borderLeft: `5px solid ${color}`,
        borderRadius: 10, padding: "14px 16px", cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.12)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? "—"}</div>
      </div>
      <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function Btn({ children, onClick, color = T.primary, size = "sm", disabled = false, style }) {
  const pad = size === "sm" ? "4px 12px" : "8px 18px";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#ccc" : color, color: "#fff", border: "none",
        borderRadius: 6, padding: pad, fontSize: size === "sm" ? 12 : 13,
        cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, ...style,
      }}
    >
      {children}
    </button>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.textPri }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: T.textSec }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ msg = "Tidak ada data" }) {
  return <div style={{ textAlign: "center", color: "#90A4AE", padding: 24, fontSize: 13 }}>{msg}</div>;
}

function getUser() {
  try {
    const s = sessionStorage.getItem("auth-store") || localStorage.getItem("auth-store");
    if (s) { const p = JSON.parse(s); return p?.state?.user || null; }
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch { return null; }
}

// ─── PANEL COMPONENTS ─────────────────────────────────────────────────────────

function InboxKadinPanel({ badges, onBadgeChange }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [distribusiModal, setDistribusiModal] = useState(null);
  const [distRole, setDistRole] = useState(BAWAHAN[0].role);
  const [distIsi, setDistIsi] = useState("");

  const fetch = useCallback(() => {
    setLoading(true);
    api.get("/sekretaris/inbox-kadin").then((r) => {
      const data = Array.isArray(r.data?.data) ? r.data.data : [];
      setList(data);
      onBadgeChange?.("inbox_kadin", data.filter((p) => p.status === "diterbitkan").length);
    }).catch(() => setList([])).finally(() => setLoading(false));
  }, [onBadgeChange]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = filter === "all" ? list
    : filter === "pending" ? list.filter((p) => p.status === "diterbitkan")
    : filter === "diproses" ? list.filter((p) => ["dibaca", "diproses"].includes(p.status))
    : filter === "selesai" ? list.filter((p) => p.status === "selesai")
    : list.filter((p) => p.is_overdue);

  async function handleKonfirmasi(id) {
    try { await api.post(`/sekretaris/inbox-kadin/${id}/konfirmasi`); fetch(); } catch { /**/ }
  }
  async function handleSelesai(id) {
    const cat = window.prompt("Catatan laporan ke Kepala Dinas:");
    if (cat === null) return;
    try { await api.post(`/sekretaris/inbox-kadin/${id}/lapor-selesai`, { catatan: cat }); fetch(); } catch { /**/ }
  }
  async function handleDistribusi() {
    if (!distRole || !distribusiModal) return;
    try {
      await api.post(`/sekretaris/inbox-kadin/${distribusiModal}/distribusi`, { ke_role: distRole, isi_distribusi: distIsi });
      setDistribusiModal(null); setDistIsi("");
      fetch();
    } catch { /**/ }
  }

  return (
    <Card>
      <SectionHeader
        title="Inbox Kepala Dinas"
        sub="Perintah & task dari Kepala Dinas"
        action={<Btn onClick={fetch} color={T.secondary} size="sm">Refresh</Btn>}
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { key: "all", label: "Semua" },
          { key: "pending", label: "Belum Dibaca" },
          { key: "diproses", label: "Sedang Diproses" },
          { key: "selesai", label: "Selesai" },
          { key: "overdue", label: "Terlambat" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: filter === f.key ? T.primary : "#EEF0F5", color: filter === f.key ? "#fff" : T.textSec,
            border: "none", cursor: "pointer",
          }}>{f.label}</button>
        ))}
      </div>
      {loading ? <EmptyState msg="Memuat..." /> : filtered.length === 0 ? <EmptyState msg="Tidak ada perintah" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((p) => (
            <div key={p.id} style={{
              border: `1px solid ${p.is_overdue ? T.danger : T.border}`,
              borderLeft: `4px solid ${PRIORITAS_COLOR[p.prioritas] || T.primary}`,
              borderRadius: 8, padding: "10px 12px", background: p.is_overdue ? "#FFF3E0" : "#FAFAFA",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: T.textPri }}>{p.isi || `Perintah #${p.id}`}</div>
                  <div style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>
                    {p.prioritas?.toUpperCase()} · {p.jam_masuk != null ? `${p.jam_masuk} jam lalu` : "Baru"}
                    {p.deadline && ` · Deadline: ${new Date(p.deadline).toLocaleDateString("id-ID")}`}
                    {p.is_overdue && <span style={{ color: T.danger, fontWeight: 700 }}> · TERLAMBAT</span>}
                  </div>
                </div>
                <StatusChip status={p.status} />
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {p.status === "diterbitkan" && (
                  <Btn onClick={() => handleKonfirmasi(p.id)} color={T.success}>Konfirmasi Terima</Btn>
                )}
                {["dibaca", "diproses"].includes(p.status) && (
                  <>
                    <Btn onClick={() => setDistribusiModal(p.id)} color={T.accent}>Distribusi ke Bawahan</Btn>
                    <Btn onClick={() => handleSelesai(p.id)} color={T.success}>Lapor Selesai</Btn>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {distribusiModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 440, maxWidth: "95vw" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Distribusi ke Bawahan</div>
            <label style={{ fontSize: 12, color: T.textSec }}>Distribusi ke:</label>
            <select value={distRole} onChange={(e) => setDistRole(e.target.value)}
              style={{ display: "block", width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, marginTop: 4, marginBottom: 10, fontSize: 13 }}>
              {BAWAHAN.map((b) => <option key={b.role} value={b.role}>{b.icon} {b.label}</option>)}
            </select>
            <label style={{ fontSize: 12, color: T.textSec }}>Instruksi tambahan (opsional):</label>
            <textarea value={distIsi} onChange={(e) => setDistIsi(e.target.value)}
              rows={3} placeholder="Ketik instruksi tambahan..."
              style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, marginTop: 4, marginBottom: 14, fontSize: 13, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn onClick={() => { setDistribusiModal(null); setDistIsi(""); }} color="#546E7A">Batal</Btn>
              <Btn onClick={handleDistribusi} color={T.primary}>Distribusikan</Btn>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function ApprovalQueuePanel({ onBadgeChange }) {
  const TABS = [
    { key: "kasubag", label: "Kasubag", icon: "👥" },
    { key: "jf_perencanaan", label: "JF Perencanaan", icon: "📊" },
    { key: "jf_keuangan", label: "JF Keuangan", icon: "💰" },
    { key: "bendahara", label: "Bendahara", icon: "🏦" },
    { key: "bidang_uptd", label: "Bidang+UPTD", icon: "🏛️" },
  ];
  const [activeTab, setActiveTab] = useState("kasubag");
  const [list, setList] = useState([]);
  const [badges, setBadges] = useState({});
  const [loading, setLoading] = useState(true);
  const [putuskanModal, setPutuskanModal] = useState(null);
  const [catatan, setCatatan] = useState("");

  const fetch = useCallback((tab) => {
    setLoading(true);
    api.get(`/sekretaris/approval?tab=${tab}`).then((r) => {
      setList(Array.isArray(r.data?.data) ? r.data.data : []);
      if (r.data?.badges) {
        setBadges(r.data.badges);
        const totalPending = Object.values(r.data.badges).reduce((a, b) => a + b, 0);
        onBadgeChange?.("approval_pending", totalPending);
      }
    }).catch(() => setList([])).finally(() => setLoading(false));
  }, [onBadgeChange]);

  useEffect(() => { fetch(activeTab); }, [activeTab, fetch]);

  async function handlePutuskan(id, aksi) {
    if (aksi !== "setuju" && !catatan.trim()) {
      alert("Catatan wajib diisi untuk kembalikan/tolak.");
      return;
    }
    try {
      await api.post(`/sekretaris/approval/${id}/putuskan`, { aksi, catatan });
      setPutuskanModal(null); setCatatan("");
      fetch(activeTab);
    } catch (e) {
      alert(e?.response?.data?.message || "Gagal memproses.");
    }
  }

  return (
    <Card>
      <SectionHeader title="Approval Queue" sub="Dokumen menunggu keputusan Sekretaris" />
      <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: activeTab === t.key ? T.primary : "#EEF0F5",
            color: activeTab === t.key ? "#fff" : T.textSec,
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          }}>
            {t.icon} {t.label}
            {badges[t.key] > 0 && <Badge n={badges[t.key]} />}
          </button>
        ))}
      </div>
      {loading ? <EmptyState msg="Memuat..." /> : list.length === 0 ? <EmptyState msg="Tidak ada dokumen menunggu" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((item) => (
            <div key={item.id} style={{
              border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px",
              background: item.is_revisi ? "#FFF8E1" : "#FAFAFA",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {item.judul}
                    {item.is_revisi && <span style={{ color: T.warning, fontSize: 11, marginLeft: 6 }}>(Revisi ke-{item.revisi_ke})</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                    {item.nomor_dokumen} · {item.asal_unit?.replace(/_/g, " ")}
                    · {new Date(item.created_at).toLocaleDateString("id-ID")}
                  </div>
                </div>
                <StatusChip status={item.status} />
              </div>
              {item.status === "menunggu_persetujuan_sekretaris" && (
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <Btn onClick={() => { setPutuskanModal({ id: item.id, aksi: "setuju" }); }} color={T.success}>Setuju</Btn>
                  <Btn onClick={() => { setPutuskanModal({ id: item.id, aksi: "kembalikan" }); }} color={T.warning}>Kembalikan</Btn>
                  <Btn onClick={() => { setPutuskanModal({ id: item.id, aksi: "tolak" }); }} color={T.danger}>Tolak</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {putuskanModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 420, maxWidth: "95vw" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
              {putuskanModal.aksi === "setuju" ? "Konfirmasi Persetujuan"
                : putuskanModal.aksi === "kembalikan" ? "Kembalikan Dokumen"
                : "Tolak Dokumen"}
            </div>
            {putuskanModal.aksi !== "setuju" && (
              <>
                <label style={{ fontSize: 12, color: T.textSec }}>Catatan perbaikan (wajib):</label>
                <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  rows={3} placeholder="Jelaskan alasan dengan spesifik..."
                  style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, marginTop: 4, marginBottom: 14, fontSize: 13, boxSizing: "border-box" }} />
              </>
            )}
            {putuskanModal.aksi === "setuju" && (
              <p style={{ color: T.textSec, fontSize: 13, marginBottom: 14 }}>Dokumen akan disetujui dan dapat dieksekusi.</p>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn onClick={() => { setPutuskanModal(null); setCatatan(""); }} color="#546E7A">Batal</Btn>
              <Btn
                onClick={() => handlePutuskan(putuskanModal.id, putuskanModal.aksi)}
                color={putuskanModal.aksi === "setuju" ? T.success : putuskanModal.aksi === "kembalikan" ? T.warning : T.danger}
              >
                {putuskanModal.aksi === "setuju" ? "Ya, Setujui"
                  : putuskanModal.aksi === "kembalikan" ? "Kembalikan"
                  : "Tolak Dokumen"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function MonitorPerintahPanel() {
  const [perintah, setPerintah] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");
  const [showBuat, setShowBuat] = useState(false);
  const [formKe, setFormKe] = useState(BAWAHAN[0].role);
  const [formIsi, setFormIsi] = useState("");
  const [formPrioritas, setFormPrioritas] = useState("normal");
  const [formDeadline, setFormDeadline] = useState("");

  const fetch = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/sekretaris/perintah").catch(() => ({ data: { data: [] } })),
      api.get("/sekretaris/monitor/overdue").catch(() => ({ data: { data: [] } })),
    ]).then(([p, o]) => {
      setPerintah(Array.isArray(p.data?.data) ? p.data.data : []);
      setOverdue(Array.isArray(o.data?.data) ? o.data.data : []);
    }).finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const displayed = filterRole === "all" ? perintah : perintah.filter((p) => p.ke_role === filterRole);

  const STATUS_DOT = {
    diterbitkan: T.primary, diproses: T.accent, selesai: T.success,
    ditolak: T.danger, dibaca: "#558B2F",
  };

  async function handleBuat(e) {
    e.preventDefault();
    if (!formIsi.trim()) return;
    try {
      await api.post("/sekretaris/perintah", { ke_role: formKe, isi: formIsi, prioritas: formPrioritas, deadline: formDeadline || undefined });
      setFormIsi(""); setFormDeadline(""); setShowBuat(false);
      fetch();
    } catch { /**/ }
  }

  async function handleIngatkan(id) {
    try { await api.post(`/sekretaris/perintah/${id}/ingatkan`); alert("Pengingat terkirim."); } catch { /**/ }
  }
  async function handleEskalasi(id) {
    if (!window.confirm("Ubah prioritas ke MENDESAK?")) return;
    try { await api.post(`/sekretaris/perintah/${id}/eskalasi`); fetch(); } catch { /**/ }
  }

  return (
    <Card>
      <SectionHeader
        title="Monitor Perintah ke Bawahan"
        sub={overdue.length > 0 ? `${overdue.length} tugas terlambat` : "Semua tepat waktu"}
        action={<Btn onClick={() => setShowBuat(!showBuat)} color={T.accent}>+ Buat Perintah</Btn>}
      />
      {showBuat && (
        <form onSubmit={handleBuat} style={{
          background: "#F3F4F6", borderRadius: 8, padding: 14, marginBottom: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: T.textSec }}>Ke:</label>
            <select value={formKe} onChange={(e) => setFormKe(e.target.value)}
              style={{ display: "block", width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 3 }}>
              {BAWAHAN.map((b) => <option key={b.role} value={b.role}>{b.icon} {b.label}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: T.textSec }}>Isi Perintah:</label>
            <textarea value={formIsi} onChange={(e) => setFormIsi(e.target.value)} rows={2} required
              style={{ display: "block", width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 3, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: T.textSec }}>Prioritas:</label>
            <select value={formPrioritas} onChange={(e) => setFormPrioritas(e.target.value)}
              style={{ display: "block", width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 3 }}>
              {["normal", "tinggi", "kritis"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: T.textSec }}>Deadline:</label>
            <input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)}
              style={{ display: "block", width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, marginTop: 3 }} />
          </div>
          <div style={{ gridColumn: "1/-1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn onClick={() => setShowBuat(false)} color="#546E7A">Batal</Btn>
            <Btn color={T.primary} style={{ cursor: "pointer" }}>Kirim Perintah</Btn>
          </div>
        </form>
      )}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => setFilterRole("all")} style={{
          padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
          background: filterRole === "all" ? T.primary : "#EEF0F5", color: filterRole === "all" ? "#fff" : T.textSec,
          border: "none", cursor: "pointer",
        }}>Semua</button>
        {BAWAHAN.map((b) => (
          <button key={b.role} onClick={() => setFilterRole(b.role)} style={{
            padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: filterRole === b.role ? T.primary : "#EEF0F5", color: filterRole === b.role ? "#fff" : T.textSec,
            border: "none", cursor: "pointer",
          }}>{b.icon} {b.label}</button>
        ))}
      </div>
      {loading ? <EmptyState msg="Memuat..." /> : displayed.length === 0 ? <EmptyState msg="Tidak ada perintah" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {displayed.map((p) => (
            <div key={p.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px",
              border: `1px solid ${p.is_overdue ? T.danger : T.border}`, borderRadius: 8,
              background: p.is_overdue ? "#FFF3E0" : "#FAFAFA",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_DOT[p.status] || "#aaa", marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.isi}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>
                  {BAWAHAN.find((b) => b.role === p.ke_role)?.label || p.ke_role}
                  {p.deadline && ` · ${new Date(p.deadline).toLocaleDateString("id-ID")}`}
                  {p.is_overdue && <span style={{ color: T.danger, fontWeight: 700 }}> · TERLAMBAT</span>}
                </div>
              </div>
              <StatusChip status={p.status} />
              <div style={{ display: "flex", gap: 4 }}>
                <Btn onClick={() => handleIngatkan(p.id)} color="#1565C0" size="sm">Ingatkan</Btn>
                {!["selesai", "ditolak"].includes(p.status) && (
                  <Btn onClick={() => handleEskalasi(p.id)} color={T.danger} size="sm">Eskalasi</Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ScorecardBawahanPanel() {
  const [scorecard, setScorecard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skpModal, setSkpModal] = useState(null);
  const [skpForm, setSkpForm] = useState({});

  useEffect(() => {
    api.get("/sekretaris/kinerja/bawahan")
      .then((r) => setScorecard(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setScorecard(BAWAHAN.map((b) => ({ ...b, skor_total: null, kategori: null, execution_rate: null }))))
      .finally(() => setLoading(false));
  }, []);

  const KATEGORI_COLOR = {
    sangat_baik: T.success, baik: "#558B2F", cukup: T.accent,
    kurang: T.warning, sangat_kurang: T.danger,
  };

  async function handleSimpanSkp(e) {
    e.preventDefault();
    if (!skpModal) return;
    try {
      const now = new Date();
      await api.post(`/sekretaris/skp/${skpModal.userId}`, {
        periode_bulan: now.getMonth() + 1,
        periode_tahun: now.getFullYear(),
        jabatan_dinilai: skpModal.jabatan,
        ...skpForm,
      });
      alert("SKP disimpan.");
      setSkpModal(null); setSkpForm({});
    } catch { alert("Gagal menyimpan SKP."); }
  }

  return (
    <Card>
      <SectionHeader title="Scorecard Kinerja Bawahan" sub="Penilaian kinerja langsung bulan ini" />
      {loading ? <EmptyState msg="Memuat..." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {(scorecard.length > 0 ? scorecard : BAWAHAN.map((b) => ({ ...b, skor_total: null, kategori: null, execution_rate: null }))).map((b, i) => (
            <div key={b.role || i} style={{
              border: `1px solid ${T.border}`, borderRadius: 10, padding: 14,
              background: T.card, textAlign: "center",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{b.icon || "👤"}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textPri, marginBottom: 4 }}>{b.label}</div>
              {b.skor_total != null ? (
                <>
                  <div style={{ fontSize: 26, fontWeight: 800, color: KATEGORI_COLOR[b.kategori] || T.primary }}>
                    {b.skor_total}
                  </div>
                  <div style={{ fontSize: 11, color: KATEGORI_COLOR[b.kategori] || "#888", marginBottom: 6 }}>
                    {b.kategori?.replace(/_/g, " ") || "—"}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#90A4AE", marginBottom: 10 }}>Belum Dinilai</div>
              )}
              {b.execution_rate != null && (
                <div style={{ fontSize: 11, color: T.textSec, marginBottom: 8 }}>
                  Eksekusi: <strong>{b.execution_rate}%</strong>
                </div>
              )}
              <Btn
                onClick={() => setSkpModal({ userId: null, jabatan: b.jabatan, label: b.label })}
                color={T.secondary} size="sm"
              >Isi SKP</Btn>
            </div>
          ))}
        </div>
      )}
      {skpModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onSubmit={handleSimpanSkp} style={{ background: "#fff", borderRadius: 12, padding: 24, width: 480, maxWidth: "95vw", maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Isi SKP — {skpModal.label}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { key: "skor_skp", label: "Skor SKP (0-100)" },
                { key: "skor_perilaku", label: "Skor Perilaku (0-100)" },
                { key: "skor_output", label: "Skor Output (0-100)" },
                { key: "skor_disiplin", label: "Skor Disiplin (0-100)" },
                { key: "skor_eksekusi_tugas", label: "Eksekusi Tugas (%)" },
                { key: "skor_kualitas_dokumen", label: "Kualitas Dokumen (%)" },
                { key: "skor_kepatuhan_alur", label: "Kepatuhan Alur (%)" },
                { key: "skor_ketepatan_laporan", label: "Ketepatan Laporan (%)" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, color: T.textSec }}>{f.label}</label>
                  <input type="number" min={0} max={100} value={skpForm[f.key] || ""} onChange={(e) => setSkpForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    style={{ display: "block", width: "100%", padding: "5px 8px", borderRadius: 5, border: `1px solid ${T.border}`, fontSize: 13, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 11, color: T.textSec }}>Catatan Kualitatif</label>
                <textarea rows={2} value={skpForm.catatan_kualitatif || ""} onChange={(e) => setSkpForm((s) => ({ ...s, catatan_kualitatif: e.target.value }))}
                  style={{ display: "block", width: "100%", padding: "5px 8px", borderRadius: 5, border: `1px solid ${T.border}`, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
              <Btn onClick={() => { setSkpModal(null); setSkpForm({}); }} color="#546E7A">Batal</Btn>
              <Btn color={T.primary} style={{ cursor: "pointer" }}>Simpan SKP</Btn>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}

function Monitor50KpiPanel() {
  const [kpiList, setKpiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKat, setFilterKat] = useState("semua");
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api.get("/sekretaris/kpi/semua").then((r) => {
      setKpiList(Array.isArray(r.data?.data) ? r.data.data : []);
      setSummary(r.data?.summary || {});
    }).catch(() => setKpiList([])).finally(() => setLoading(false));
  }, []);

  const filtered = filterKat === "semua" ? kpiList : kpiList.filter((k) => k.kategori === filterKat);

  const STATUS_ICON = { on_target: "✅", warning: "⚠️", below_target: "❌", no_data: "—" };

  return (
    <Card>
      <SectionHeader
        title="Monitor 50 KPI Sistem"
        sub={`On-target: ${summary.on_target || 0} | Warning: ${summary.warning || 0} | Below: ${summary.below_target || 0}`}
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {["semua", ...KPI_KATEGORI].map((k) => (
          <button key={k} onClick={() => setFilterKat(k)} style={{
            padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: filterKat === k ? T.primary : "#EEF0F5", color: filterKat === k ? "#fff" : T.textSec,
            border: "none", cursor: "pointer", textTransform: "capitalize",
          }}>{k}</button>
        ))}
      </div>
      {loading ? <EmptyState msg="Memuat..." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#F0F2F5" }}>
                <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600 }}>Indikator</th>
                <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 600 }}>Target</th>
                <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 600 }}>Nilai</th>
                <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => (
                <tr key={k.id} style={{ borderBottom: `1px solid ${T.border}`, background: k.status === "below_target" ? "#FFF3E0" : "transparent" }}>
                  <td style={{ padding: "5px 8px", color: T.textSec }}>{k.id}</td>
                  <td style={{ padding: "5px 8px" }}>{k.label}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: T.textSec }}>{k.target ?? "—"} {k.satuan}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", fontWeight: 600, color: STATUS_COLOR[k.status] || T.textPri }}>
                    {k.nilai != null ? `${k.nilai} ${k.satuan}` : "—"}
                  </td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>
                    <span style={{ color: STATUS_COLOR[k.status] }}>{STATUS_ICON[k.status] || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function BypassAlertPanel({ onBadgeChange }) {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    api.get("/sekretaris/bypass/list").then((r) => {
      setList(Array.isArray(r.data?.data) ? r.data.data : []);
      setStats(r.data?.stats || {});
      onBadgeChange?.("bypass_bulan_ini", r.data?.stats?.bulan_ini || 0);
    }).catch(() => setList([])).finally(() => setLoading(false));
  }, [onBadgeChange]);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleTeguran(id) {
    const catatan = window.prompt("Isi teguran digital:");
    if (!catatan) return;
    try { await api.post(`/sekretaris/bypass/${id}/teguran`, { catatan }); alert("Teguran terkirim."); fetch(); } catch { /**/ }
  }

  return (
    <Card>
      <SectionHeader
        title="Bypass Alert Center"
        sub={`Bulan ini: ${stats.bulan_ini || 0} | Bulan lalu: ${stats.bulan_lalu || 0}`}
        action={<Btn onClick={fetch} color={T.secondary} size="sm">Refresh</Btn>}
      />
      {stats.bulan_ini > 0 && (
        <div style={{ background: "#FFEBEE", border: `1px solid ${T.danger}`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: T.danger, fontWeight: 600 }}>
          Terdeteksi {stats.bulan_ini} pelanggaran alur koordinasi bulan ini!
        </div>
      )}
      {loading ? <EmptyState msg="Memuat..." /> : list.length === 0 ? (
        <div style={{ textAlign: "center", padding: 24, color: T.success }}>
          <div style={{ fontSize: 32 }}>✅</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Tidak ada pelanggaran alur terdeteksi</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((b) => (
            <div key={b.id} style={{
              border: `1px solid ${T.danger}`, borderRadius: 8, padding: "10px 12px",
              background: "#FFF3E0",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: T.danger }}>Bypass Terdeteksi</div>
                  <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                    {b.detected_at ? new Date(b.detected_at).toLocaleString("id-ID") : "—"}
                    {b.description && ` · ${b.description}`}
                  </div>
                </div>
                <Btn onClick={() => handleTeguran(b.id)} color={T.danger} size="sm">Kirim Teguran</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function KonsolidasiPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    api.get("/sekretaris/konsolidasi").then((r) => setData(r.data?.data || null))
      .catch(() => setData(null)).finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const UNIT_INFO = [
    { key: "ketersediaan", label: "Bidang Ketersediaan", icon: "🌾" },
    { key: "distribusi", label: "Bidang Distribusi", icon: "🚛" },
    { key: "konsumsi", label: "Bidang Konsumsi", icon: "🍽️" },
    { key: "uptd", label: "UPTD Balai Pengawasan", icon: "🔬" },
  ];

  async function handleGenerate() {
    if (!data?.all_submitted) { alert("Belum semua unit submit laporan."); return; }
    try {
      await api.post("/sekretaris/konsolidasi/generate", { bulan: data.periode_bulan, tahun: data.periode_tahun });
      fetch();
    } catch (e) { alert(e?.response?.data?.message || "Gagal memulai konsolidasi."); }
  }

  async function handleTeruskan() {
    if (!data?.id) { alert("Belum ada data konsolidasi."); return; }
    if (!window.confirm("Teruskan laporan konsolidasi ke Kepala Dinas?")) return;
    try { await api.post(`/sekretaris/konsolidasi/${data.id}/teruskan-kadin`); fetch(); } catch { /**/ }
  }

  return (
    <Card>
      <SectionHeader
        title="Konsolidasi Laporan Bidang + UPTD"
        sub={data ? `Periode ${data.periode_bulan}/${data.periode_tahun}` : ""}
        action={<Btn onClick={fetch} color={T.secondary} size="sm">Refresh</Btn>}
      />
      {loading ? <EmptyState msg="Memuat..." /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
            {UNIT_INFO.map((u) => {
              const submitted = data?.[`${u.key}_submitted`];
              const at = data?.[`${u.key}_submitted_at`];
              return (
                <div key={u.key} style={{
                  border: `1px solid ${submitted ? T.success : T.danger}`,
                  borderRadius: 8, padding: "12px 14px", textAlign: "center",
                  background: submitted ? "#F1F8E9" : "#FFF3E0",
                }}>
                  <div style={{ fontSize: 22 }}>{u.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{u.label}</div>
                  <div style={{ fontSize: 20, marginTop: 4 }}>{submitted ? "✅" : "❌"}</div>
                  {at && <div style={{ fontSize: 10, color: T.textSec, marginTop: 2 }}>{new Date(at).toLocaleDateString("id-ID")}</div>}
                </div>
              );
            })}
          </div>
          {data && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <StatusChip status={data.status} size={12} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={handleGenerate}
                  color={data.all_submitted ? T.primary : "#ccc"}
                  disabled={!data.all_submitted || ["sedang_dikonsolidasi", "diteruskan_ke_kadin"].includes(data.status)}
                >
                  Konsolidasi
                </Btn>
                <Btn
                  onClick={handleTeruskan}
                  color={["selesai_konsolidasi", "siap_dikonsolidasi"].includes(data.status) ? T.success : "#ccc"}
                  disabled={!["selesai_konsolidasi", "siap_dikonsolidasi"].includes(data.status)}
                >
                  Teruskan ke KaDin
                </Btn>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function SppgTpidPanel() {
  const [sppg, setSppg] = useState(null);
  const [tpid, setTpid] = useState(null);

  useEffect(() => {
    api.get("/sekretaris/sppg/status").then((r) => setSppg(r.data?.data || null)).catch(() => {});
    api.get("/sekretaris/tpid/data").then((r) => setTpid(r.data?.data || null)).catch(() => {});
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Card>
        <SectionHeader title="SPPG — Makan Bergizi Gratis" sub="Status input data per kab/kota" />
        {sppg ? (
          <>
            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.primary }}>{sppg.sudah_input}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>Sudah Input</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: sppg.belum_input > 0 ? T.danger : T.success }}>{sppg.belum_input}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>Belum Input</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.accent }}>{sppg.pct_coverage}%</div>
                <div style={{ fontSize: 11, color: T.textSec }}>Coverage</div>
              </div>
            </div>
            {sppg.alert && (
              <div style={{ background: "#FFEBEE", color: T.danger, borderRadius: 6, padding: "6px 10px", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                {sppg.alert}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflow: "auto" }}>
              {(sppg.detail || []).map((kab) => (
                <div key={kab.kabupaten} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span>{kab.kabupaten}</span>
                  <span style={{ color: kab.sudah_input ? T.success : T.danger, fontWeight: 600 }}>
                    {kab.sudah_input ? `${kab.data_valid}/${kab.total_data}` : "Belum"}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : <EmptyState msg="Data SPPG tidak tersedia" />}
      </Card>
      <Card>
        <SectionHeader title="Koordinasi TPID" sub="Tim Pengendalian Inflasi Daerah" />
        {tpid ? (
          <>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: T.textSec }}>Kesiapan Data</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: tpid.kesiapan_data === "siap" ? T.success : T.warning, marginTop: 2 }}>
                {tpid.kesiapan_data === "siap" ? "Data Siap" : "Perlu Update"}
              </div>
            </div>
            {tpid.jadwal_berikutnya && (
              <div style={{ background: "#E3F2FD", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 10 }}>
                <strong>Jadwal Rapat Berikutnya:</strong><br />
                {tpid.jadwal_berikutnya.keterangan}
              </div>
            )}
            <div style={{ fontSize: 12, color: T.textSec, marginBottom: 4 }}>Komoditas Harga Terkini:</div>
            {tpid.harga_komoditas?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 150, overflow: "auto" }}>
                {tpid.harga_komoditas.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span>Komoditas #{h.komoditas_id}</span>
                    <span style={{ fontWeight: 600 }}>Rp {Number(h.avg_harga || 0).toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState msg="Belum ada data harga" />}
          </>
        ) : <EmptyState msg="Data TPID tidak tersedia" />}
      </Card>
    </div>
  );
}

function NotifikasiPanel({ onBadgeChange }) {
  const [list, setList] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetch = useCallback(() => {
    api.get("/sekretaris/notifikasi?limit=20").then((r) => {
      setList(Array.isArray(r.data?.data) ? r.data.data : []);
      setUnread(r.data?.unread || 0);
      onBadgeChange?.("notif_unread", r.data?.unread || 0);
    }).catch(() => {});
  }, [onBadgeChange]);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleBacaSemua() {
    try { await api.put("/sekretaris/notifikasi/baca-semua"); fetch(); } catch { /**/ }
  }

  const JENIS_ICON = {
    perintah_kadin_baru: "📥", bypass_terdeteksi: "🚨", kgb_jatuh_tempo: "⚠️",
    keputusan_kadin: "📋", sppg_belum_input: "🌾", skp_deadline: "🎯",
  };

  return (
    <Card>
      <SectionHeader
        title={`Notifikasi ${unread > 0 ? `(${unread} baru)` : ""}`}
        action={unread > 0 ? <Btn onClick={handleBacaSemua} color={T.secondary} size="sm">Baca Semua</Btn> : null}
      />
      {list.length === 0 ? <EmptyState msg="Tidak ada notifikasi" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflow: "auto" }}>
          {list.map((n) => (
            <div key={n.id} style={{
              padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: n.sudah_dibaca ? "#FAFAFA" : "#E8EAF6",
              borderLeft: `3px solid ${n.sudah_dibaca ? T.border : T.primary}`,
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>{JENIS_ICON[n.jenis] || "🔔"}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: n.sudah_dibaca ? 400 : 700 }}>{n.judul}</div>
                  {n.isi && <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{n.isi}</div>}
                  <div style={{ fontSize: 10, color: "#90A4AE", marginTop: 2 }}>
                    {new Date(n.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── OVERVIEW (HOME) ─────────────────────────────────────────────────────────
function OverviewPanel({ heroKpi, kpi, keuangan, kepegawaian, badges }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero KPI Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        <KpiTile
          label="Inbox Kepala Dinas" icon="📥"
          value={heroKpi?.inbox_kadin ?? kpi?.perintah_aktif ?? "—"}
          color={heroKpi?.inbox_kadin > 0 ? T.danger : T.success}
          sub={heroKpi?.inbox_kadin > 0 ? "Perlu ditindaklanjuti" : "Semua tertangani"}
        />
        <KpiTile
          label="Approval Pending" icon="✅"
          value={heroKpi?.approval_pending ?? kpi?.approval_pending ?? "—"}
          color={(heroKpi?.approval_pending ?? kpi?.approval_pending) > 5 ? T.warning : T.success}
        />
        <KpiTile
          label="Bypass Alert" icon="🚨"
          value={heroKpi?.bypass_bulan_ini ?? "—"}
          color={(heroKpi?.bypass_bulan_ini ?? 0) > 0 ? T.danger : T.success}
          sub="Pelanggaran alur bulan ini"
        />
        <KpiTile
          label="KGB Alert" icon="⚠️"
          value={heroKpi?.kgb_alert ?? kepegawaian?.kgb_pending ?? "—"}
          color={(heroKpi?.kgb_alert ?? 0) > 0 ? T.warning : T.success}
          sub="Jatuh tempo < 30 hari"
        />
        <KpiTile
          label="Penyerapan Anggaran" icon="💹"
          value={keuangan?.persen_serapan != null ? `${keuangan.persen_serapan}%` : "—"}
          color={keuangan?.persen_serapan >= 90 ? T.success : keuangan?.persen_serapan >= 75 ? T.accent : T.danger}
          sub={keuangan?.persen_serapan ? `${keuangan.persen_serapan}% DPA` : "Data belum tersedia"}
        />
        <KpiTile
          label="Surat Belum Disposisi" icon="✉️"
          value={kpi?.surat_belum_disposisi ?? "—"}
          color={(kpi?.surat_belum_disposisi ?? 0) > 0 ? T.warning : T.success}
        />
      </div>
      {/* Quick Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionHeader title="Ringkasan Keuangan" />
          {keuangan ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Total Anggaran", val: keuangan.total_anggaran ? `Rp ${Number(keuangan.total_anggaran).toLocaleString("id-ID")}` : "—" },
                { label: "Realisasi", val: keuangan.realisasi ? `Rp ${Number(keuangan.realisasi).toLocaleString("id-ID")}` : "—" },
                { label: "SPP Pending", val: keuangan.spp_pending, alert: keuangan.spp_pending > 0 },
                { label: "SPM Pending", val: keuangan.spm_pending, alert: keuangan.spm_pending > 0 },
                { label: "LPJ Pending", val: keuangan.lpj_pending, alert: keuangan.lpj_pending > 0 },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ color: T.textSec }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: r.alert ? T.warning : T.textPri }}>{r.val}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState />}
        </Card>
        <Card>
          <SectionHeader title="Ringkasan Kepegawaian" />
          {kepegawaian ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Total ASN", val: kepegawaian.total },
                { label: "Aktif", val: kepegawaian.aktif },
                { label: "Cuti", val: kepegawaian.cuti },
                { label: "KGB Pending", val: kepegawaian.kgb_pending, alert: kepegawaian.kgb_pending > 0 },
                { label: "SKP Belum Dinilai", val: kepegawaian.skp_belum, alert: kepegawaian.skp_belum > 0 },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ color: T.textSec }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: r.alert ? T.warning : T.textPri }}>{r.val ?? "—"}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState />}
        </Card>
      </div>
      {/* 12 Modul Sekretariat */}
      <Card>
        <SectionHeader title="12 Modul Layanan Sekretariat" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
          {MODUL_SEK.map((m) => (
            <a key={m.kode} href={`/modul/${m.kode.toLowerCase()}`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 8px",
                border: `1px solid ${T.border}`, borderRadius: 8, textDecoration: "none", color: T.textPri,
                background: "#FAFAFA", fontSize: 12, fontWeight: 600, textAlign: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FAFAFA")}
            >
              <span style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</span>
              <span style={{ fontSize: 10, color: T.textSec }}>{m.kode}</span>
              <span>{m.label}</span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function DashboardSekretariat() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || getUser();
  const roleName = (user?.roleName || user?.role || "").toLowerCase();

  const [activePanel, setActivePanel] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [badges, setBadges] = useState({});

  // Data state
  const [kpi, setKpi] = useState(null);
  const [heroKpi, setHeroKpi] = useState(null);
  const [keuangan, setKeuangan] = useState(null);
  const [kepegawaian, setKepegawaian] = useState(null);

  const handleBadgeChange = useCallback((key, val) => {
    setBadges((prev) => ({ ...prev, [key]: val }));
  }, []);

  useEffect(() => {
    if (!ALLOWED.includes(roleName)) return;
    api.get("/dashboard/sekretaris/kpi").then((r) => setKpi(r.data?.data || r.data)).catch(() => {});
    api.get("/dashboard/sekretaris/hero-kpi").then((r) => setHeroKpi(r.data?.data || null)).catch(() => {});
    api.get("/dashboard/sekretaris/keuangan").then((r) => setKeuangan(r.data?.data ?? r.data)).catch(() => {});
    api.get("/dashboard/sekretaris/kepegawaian").then((r) => setKepegawaian(r.data?.data ?? r.data)).catch(() => {});
  }, [roleName]);

  if (!ALLOWED.includes(roleName)) return <Navigate to="/" replace />;

  const PANEL_COMPONENTS = {
    overview: <OverviewPanel heroKpi={heroKpi} kpi={kpi} keuangan={keuangan} kepegawaian={kepegawaian} badges={badges} />,
    inbox_kadin: <InboxKadinPanel badges={badges} onBadgeChange={handleBadgeChange} />,
    approval: <ApprovalQueuePanel onBadgeChange={handleBadgeChange} />,
    monitor_perintah: <MonitorPerintahPanel />,
    scorecard: <ScorecardBawahanPanel />,
    kpi: <Monitor50KpiPanel />,
    bypass: <BypassAlertPanel onBadgeChange={handleBadgeChange} />,
    konsolidasi: <KonsolidasiPanel />,
    sppg: <SppgTpidPanel />,
    notifikasi: <NotifikasiPanel onBadgeChange={handleBadgeChange} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{
        width: sidebarOpen ? 260 : 60, background: T.sidebarBg, color: T.sidebarText,
        display: "flex", flexDirection: "column", transition: "width 0.25s", flexShrink: 0,
        boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "16px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
          {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 800 }}>🏛️ SIGAP Malut</span>}
          <button onClick={() => setSidebarOpen((v) => !v)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {/* User Info */}
        {sidebarOpen && (
          <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name || user?.username || "Sekretaris"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Sekretaris Dinas Pangan</div>
          </div>
        )}
        {/* Nav Items */}
        <nav style={{ flex: 1, paddingTop: 8, overflow: "auto" }}>
          {SIDEBAR_ITEMS.map((item) => (
            <button key={item.key} onClick={() => setActivePanel(item.key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", background: activePanel === item.key ? T.sidebarActive : "none",
              border: "none", color: activePanel === item.key ? "#fff" : T.sidebarText,
              cursor: "pointer", fontSize: 13, fontWeight: activePanel === item.key ? 700 : 400,
              textAlign: "left", transition: "background 0.15s",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && badges[item.badge] > 0 && <Badge n={badges[item.badge]} />}
                </>
              )}
            </button>
          ))}
        </nav>
        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{
          background: T.card, borderBottom: `1px solid ${T.border}`, padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.textPri }}>
              {SIDEBAR_ITEMS.find((s) => s.key === activePanel)?.icon} {SIDEBAR_ITEMS.find((s) => s.key === activePanel)?.label || "Dashboard Sekretaris"}
            </div>
            <div style={{ fontSize: 11, color: T.textSec }}>Dinas Pangan Provinsi Maluku Utara</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {badges.notif_unread > 0 && (
              <button onClick={() => setActivePanel("notifikasi")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, position: "relative" }}>
                🔔<sup style={{ color: T.danger, fontWeight: 800, fontSize: 10 }}>{badges.notif_unread}</sup>
              </button>
            )}
            <div style={{ width: 32, height: 32, background: T.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
              {(user?.name || user?.username || "S")[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Panel Content */}
        <div style={{ flex: 1, padding: 20 }}>
          {PANEL_COMPONENTS[activePanel] || <OverviewPanel heroKpi={heroKpi} kpi={kpi} keuangan={keuangan} kepegawaian={kepegawaian} badges={badges} />}
        </div>
      </div>
    </div>
  );
}
