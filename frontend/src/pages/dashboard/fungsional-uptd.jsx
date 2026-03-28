// frontend/src/pages/dashboard/fungsional-uptd.jsx
// Role: PEJABAT_FUNGSIONAL | UPTD Balai Pengawasan Mutu Pangan — Umum
// Akses: Read ✅ | Update (milik sendiri) ✅ | Verify ✅ | Create ❌ | Delete ❌ | Finalize ❌
// Template: 05-template-standar-dashboard.md | Role Matrix: 14-matriks-kebutuhan-layanan-per-role.md
// Modul: UPT-ADM, UPT-AST, UPT-INS, UPT-KEP, UPT-KEU, UPT-MTU, UPT-TKN (41 layanan UPTD umum)

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  BellIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  primary: "#1B4F8A",
  secondary: "#2E7D32",
  accent: "#F57C00",
  danger: "#C62828",
  info: "#0277BD",
  bg: "#F4F6F9",
  card: "#FFFFFF",
  border: "#DDE3ED",
  textPri: "#1A2B3C",
  textSec: "#546E7A",
};

// ─── Static Fallback Data ───────────────────────────────────────────────────────
const KPI_DATA = [
  { id: "k1", label: "SLA Compliance", value: 89, unit: "%", trend: 2.1, sub: "kegiatan selesai tepat waktu", good: true },
  { id: "k2", label: "Inspeksi Selesai", value: 14, unit: "kegiatan", trend: 3, sub: "30 hari terakhir", good: true },
  { id: "k3", label: "Laporan Pending", value: 3, unit: "dok.", trend: 0, sub: "menunggu verifikasi Kasi", good: null },
  { id: "k4", label: "Sertifikat Diterbitkan", value: 8, unit: "sertif.", trend: 1, sub: "bulan ini", good: true },
  { id: "k5", label: "Sampling Aktif", value: 6, unit: "sampel", trend: 0, sub: "dalam proses analisis", good: null },
  { id: "k6", label: "Temuan Open", value: 2, unit: "temuan", trend: -1, sub: "belum closing", good: false },
];

const KEGIATAN_TREN = [
  { bln: "Okt", inspeksi: 10, sampling: 5, sertifikasi: 3 },
  { bln: "Nov", inspeksi: 12, sampling: 6, sertifikasi: 4 },
  { bln: "Des", inspeksi: 9, sampling: 4, sertifikasi: 3 },
  { bln: "Jan", inspeksi: 13, sampling: 7, sertifikasi: 5 },
  { bln: "Feb", inspeksi: 11, sampling: 5, sertifikasi: 4 },
  { bln: "Mar", inspeksi: 14, sampling: 6, sertifikasi: 8 },
];

const STATUS_PIE = [
  { name: "Selesai", value: 14, color: "#2E7D32" },
  { name: "Dalam Proses", value: 6, color: "#1565C0" },
  { name: "Pending Verifikasi", value: 3, color: "#F57C00" },
  { name: "Ditolak", value: 1, color: "#C62828" },
];

const TUGAS = [
  { id: "U001", judul: "Inspeksi mutu beras Gudang Ternate", tenggat: "28 Mar 2026", prioritas: "Tinggi", status: "Dalam Proses", lifecycle: "Diverifikasi" },
  { id: "U002", judul: "Pengambilan sampel minyak goreng pasar Sofifi", tenggat: "30 Mar 2026", prioritas: "Sedang", status: "Belum Dimulai", lifecycle: "Draft" },
  { id: "U003", judul: "Upload laporan inspeksi Maret 2026", tenggat: "27 Mar 2026", prioritas: "Tinggi", status: "Menunggu Validasi", lifecycle: "Diajukan" },
  { id: "U004", judul: "Verifikasi dokumen sertifikasi BPOM", tenggat: "02 Apr 2026", prioritas: "Kritis", status: "Dalam Proses", lifecycle: "Diverifikasi" },
  { id: "U005", judul: "Input data hasil analisis laboratorium Q1", tenggat: "05 Apr 2026", prioritas: "Sedang", status: "Belum Dimulai", lifecycle: "Draft" },
];

const LAPORAN = [
  { judul: "Laporan Inspeksi Feb 2026", status: "Selesai", tgl: "05 Mar 2026", lifecycle: "Selesai" },
  { judul: "Laporan Inspeksi Mar 2026", status: "Menunggu Validasi", tgl: "27 Mar 2026", lifecycle: "Diajukan" },
  { judul: "Laporan Sampling Q1 2026", status: "Dalam Proses", tgl: "25 Mar 2026", lifecycle: "Diverifikasi" },
  { judul: "Berita Acara Sertifikasi Feb 2026", status: "Selesai", tgl: "01 Mar 2026", lifecycle: "Selesai" },
];

const AUDIT_LOG = [
  { aksi: "Upload laporan inspeksi Ternate", waktu: "27 Mar 2026, 09:14", user: "Ahmad F." },
  { aksi: "Submit sampling minyak goreng Sofifi", waktu: "27 Mar 2026, 08:55", user: "Ahmad F." },
  { aksi: "Verifikasi sertifikasi produk lokal", waktu: "26 Mar 2026, 15:30", user: "Ahmad F." },
  { aksi: "Export laporan CSV inspeksi Feb 2026", waktu: "26 Mar 2026, 11:02", user: "Ahmad F." },
];

const NOTIFIKASI = [
  { id: 1, tipe: "kritis", pesan: "Temuan mutu beras Halmahera Timur belum closing – 5 hari lewat deadline", waktu: "10 mnt lalu" },
  { id: 2, tipe: "peringatan", pesan: "Laporan sampling Q1 menunggu validasi Kasi Mutu", waktu: "1 jam lalu" },
  { id: 3, tipe: "info", pesan: "Sertifikasi 8 produk berhasil diterbitkan bulan ini", waktu: "3 jam lalu" },
  { id: 4, tipe: "tugas", pesan: "Tugas inspeksi gudang Sofifi jatuh tempo 2 hari lagi", waktu: "5 jam lalu" },
];

const PRIORITAS_MAP = {
  Kritis: { bg: "#FFEBEE", color: "#C62828" },
  Tinggi: { bg: "#FFF3E0", color: "#E65100" },
  Sedang: { bg: "#E8F5E9", color: "#2E7D32" },
  Rendah: { bg: "#ECEFF1", color: "#546E7A" },
};
const STATUS_MAP = {
  "Dalam Proses": { bg: "#E3F2FD", color: "#1565C0" },
  "Belum Dimulai": { bg: "#ECEFF1", color: "#455A64" },
  "Menunggu Validasi": { bg: "#FFF3E0", color: "#E65100" },
  Selesai: { bg: "#E8F5E9", color: "#1B5E20" },
};
const LIFECYCLE_MAP = {
  Draft: { bg: "#F5F5F5", color: "#757575" },
  Diajukan: { bg: "#E3F2FD", color: "#0277BD" },
  Diverifikasi: { bg: "#FFF3E0", color: "#F57C00" },
  Disetujui: { bg: "#E8F5E9", color: "#2E7D32" },
  Selesai: { bg: "#E8F5E9", color: "#1B5E20" },
  Arsip: { bg: "#ECEFF1", color: "#546E7A" },
};
const NOTIF_COLOR = { kritis: "#C62828", peringatan: "#F57C00", info: "#0277BD", tugas: "#6A1B9A" };

// ─── Sub-komponen ───────────────────────────────────────────────────────────────
function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 20, background: T.primary, borderRadius: 2 }} />
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.textPri }}>{title}</h3>
      </div>
      {sub && <p style={{ margin: "3px 0 0 12px", fontSize: 12, color: T.textSec }}>{sub}</p>}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );
}

function KpiTile({ label, value, unit, trend, sub, good }) {
  const up = trend > 0;
  const showTrend = trend !== 0;
  const trendColor = good === null ? T.info : good === up ? T.secondary : T.danger;
  const trendBg = good === null ? "#E3F2FD" : good === up ? "#E8F5E9" : "#FFEBEE";
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <span style={{ fontSize: 11, color: T.textSec, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: T.textPri }}>{value}</span>
        <span style={{ fontSize: 12, color: T.textSec }}>{unit}</span>
      </div>
      {showTrend && (
        <span style={{ fontSize: 11, fontWeight: 600, background: trendBg, color: trendColor, padding: "2px 8px", borderRadius: 10, alignSelf: "flex-start" }}>
          {up ? "▲" : "▼"} {Math.abs(trend)}{typeof trend === "number" && unit === "%" ? "%" : ""}
        </span>
      )}
      {sub && <span style={{ fontSize: 11, color: T.textSec }}>{sub}</span>}
    </div>
  );
}

// ─── Tab: Ringkasan ────────────────────────────────────────────────────────────
function TabRingkasan({ kpiData, notifItems, onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 12 }}>
        {kpiData.map((k) => <KpiTile key={k.id} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <SectionTitle title="Tren Kegiatan UPTD (6 Bulan)" sub="Inspeksi, Sampling, Sertifikasi" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={KEGIATAN_TREN}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="bln" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="inspeksi" stroke={T.primary} strokeWidth={2} dot={false} name="Inspeksi" />
              <Line type="monotone" dataKey="sampling" stroke={T.secondary} strokeWidth={2} dot={false} name="Sampling" />
              <Line type="monotone" dataKey="sertifikasi" stroke={T.accent} strokeWidth={2} dot={false} name="Sertifikasi" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="Status Kegiatan" sub="Distribusi status saat ini" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={STATUS_PIE} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} fontSize={10}>
                {STATUS_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SectionTitle title="Aksi Cepat" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { id: "upload", label: "Upload Laporan", icon: <DocumentArrowDownIcon style={{ width: 18, height: 18 }} /> },
              { id: "sampling", label: "Input Sampling", icon: <BeakerIcon style={{ width: 18, height: 18 }} /> },
              { id: "tugas", label: "Lihat Tugas", icon: <ClipboardDocumentListIcon style={{ width: 18, height: 18 }} /> },
              { id: "sertifikasi", label: "Sertifikasi", icon: <CheckCircleIcon style={{ width: 18, height: 18 }} /> },
            ].map((a) => (
              <button key={a.id} onClick={() => onAction(a.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#EEF2FF", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontSize: 13, color: T.primary, fontWeight: 600 }}>
                {a.icon}{a.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Notifikasi" sub="Terbaru" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifItems.slice(0, 4).map((n) => (
              <div key={n.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", background: "#F8F9FA", borderRadius: 6, borderLeft: `3px solid ${NOTIF_COLOR[n.tipe]}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: NOTIF_COLOR[n.tipe], textTransform: "uppercase", minWidth: 60 }}>{n.tipe}</span>
                <span style={{ fontSize: 12, color: T.textPri, flex: 1 }}>{n.pesan}</span>
                <span style={{ fontSize: 10, color: T.textSec, whiteSpace: "nowrap" }}>{n.waktu}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Tugas ────────────────────────────────────────────────────────────────
function TabTugas({ filterPrioritas, setFilterPrioritas, tasks }) {
  const PRIORITAS_OPTS = ["Semua", "Kritis", "Tinggi", "Sedang", "Rendah"];
  const filtered = filterPrioritas === "Semua" ? tasks : tasks.filter((t) => t.prioritas === filterPrioritas);
  return (
    <Card>
      <SectionTitle title="Daftar Tugas" sub="Tugas aktif dan pending verifikasi" />
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {PRIORITAS_OPTS.map((p) => (
          <button key={p} onClick={() => setFilterPrioritas(p)} style={{ background: filterPrioritas === p ? T.primary : "#EEF2FF", color: filterPrioritas === p ? "#fff" : T.primary, border: "none", borderRadius: 20, padding: "4px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            {p}
          </button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F4F6F9" }}>
            {["ID", "Judul Tugas", "Tenggat", "Prioritas", "Status", "Lifecycle"].map((h) => (
              <th key={h} scope="col" style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: T.textSec, fontSize: 11, borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "8px 10px", color: T.textSec, fontFamily: "monospace" }}>{t.id}</td>
              <td style={{ padding: "8px 10px", color: T.textPri, fontWeight: 500 }}>{t.judul}</td>
              <td style={{ padding: "8px 10px", color: T.textSec }}>{t.tenggat}</td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{ ...PRIORITAS_MAP[t.prioritas], padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t.prioritas}</span>
              </td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{ ...(STATUS_MAP[t.status] || {}), padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t.status}</span>
              </td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{ ...(LIFECYCLE_MAP[t.lifecycle] || {}), padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t.lifecycle}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── Tab: Laporan ──────────────────────────────────────────────────────────────
function TabLaporan({ laporan }) {
  return (
    <Card>
      <SectionTitle title="Laporan & Dokumen" sub="Riwayat laporan kegiatan UPTD" />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F4F6F9" }}>
            {["Judul Laporan", "Tanggal", "Status", "Lifecycle"].map((h) => (
              <th key={h} scope="col" style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: T.textSec, fontSize: 11, borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {laporan.map((l, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "8px 10px", color: T.textPri }}>{l.judul}</td>
              <td style={{ padding: "8px 10px", color: T.textSec }}>{l.tgl}</td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{ ...(STATUS_MAP[l.status] || {}), padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{l.status}</span>
              </td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{ ...(LIFECYCLE_MAP[l.lifecycle] || {}), padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{l.lifecycle}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── Tab: Audit ────────────────────────────────────────────────────────────────
function TabAudit({ auditLog }) {
  return (
    <Card>
      <SectionTitle title="Audit Trail" sub="Riwayat aktivitas pengguna" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {auditLog.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", background: "#F8F9FA", borderRadius: 6, borderLeft: `3px solid ${T.primary}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.textPri, fontWeight: 500 }}>{a.aksi}</div>
              <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{a.user} · {a.waktu}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function FungsionalUPTDDashboard() {
  const [tab, setTab] = useState("ringkasan");
  const [filterP, setFilterP] = useState("Semua");
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [kpiSummary, setKpiSummary] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [tasks, setTasks] = useState(TUGAS);
  const [laporan, setLaporan] = useState(LAPORAN);
  const [notifications, setNotifications] = useState(NOTIFIKASI);

  // Ambil user dari auth store
  let user = null;
  try {
    const storeRaw = sessionStorage.getItem("auth-store") || localStorage.getItem("auth-store");
    if (storeRaw) { const parsed = JSON.parse(storeRaw); user = parsed?.state?.user || null; }
    if (!user) user = JSON.parse(localStorage.getItem("user") || "null");
  } catch { user = null; }

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch KPI summary dari backend (endpoint umum fungsional bidang)
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { setKpiLoading(false); return; }
    fetch("/api/dashboard/fungsional-bidang/summary?bidang=uptd", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.success && data?.data) setKpiSummary(data.data); })
      .catch(() => {})
      .finally(() => setKpiLoading(false));
  }, []);

  // Fetch tugas dari backend
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    fetch("/api/tasks?limit=10&unit=uptd", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const rows = data?.data ?? data ?? null;
        if (Array.isArray(rows) && rows.length > 0) {
          setTasks(rows.map((t) => ({
            id: t.id || "—",
            judul: t.judul || t.nama || "—",
            tenggat: t.tanggal_batas || t.created_at?.slice(0, 10) || "—",
            prioritas: t.prioritas || "Sedang",
            status: t.status || "Dalam Proses",
            lifecycle: t.workflow_status || "Diajukan",
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch laporan dari workflow_instances (modul UPT)
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    fetch("/api/workflowinstance?modul=UPT&limit=5", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const rows = data?.data ?? data ?? null;
        if (Array.isArray(rows) && rows.length > 0) {
          setLaporan(rows.map((l) => ({
            judul: l.judul || l.modul_id || "Laporan",
            status: l.status === "approved" ? "Selesai" : l.status === "submitted" ? "Menunggu Validasi" : "Dalam Proses",
            tgl: l.updated_at?.slice(0, 10) || l.created_at?.slice(0, 10) || "—",
            lifecycle: l.status === "approved" ? "Selesai" : l.status === "reviewed" ? "Diverifikasi" : "Diajukan",
          })));
        }
      })
      .catch(() => {});
  }, []);

  const liveKpiData = kpiSummary ? [
    { ...KPI_DATA[0], value: kpiSummary.complianceRate ?? KPI_DATA[0].value },
    { ...KPI_DATA[1], value: kpiSummary.tugasDireview ?? KPI_DATA[1].value },
    { ...KPI_DATA[2], value: kpiSummary.approvalPending ?? KPI_DATA[2].value },
    ...KPI_DATA.slice(3),
  ] : KPI_DATA;

  const userName = user?.nama || user?.name || user?.username || "Ahmad F.";
  const userJabatan = user?.jabatan || user?.position || "Pejabat Fungsional UPTD";

  const handleAction = (id) => {
    const msg = {
      upload: "Membuka form upload laporan inspeksi...",
      sampling: "Membuka form input data sampling...",
      tugas: "Menampilkan daftar tugas aktif...",
      sertifikasi: "Membuka modul sertifikasi...",
    };
    setToast(msg[id] || "Memproses...");
    setTimeout(() => setToast(null), 2600);
  };

  const fmtDate = (d) => d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "tugas", label: "Tugas" },
    { id: "laporan", label: "Laporan" },
    { id: "audit", label: "Audit" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: T.bg, minHeight: "100vh", color: T.textPri }}>
      {/* Skip to content — WCAG 2.1 AA */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-white text-teal-800 px-4 py-2 rounded shadow z-50 font-semibold">
        Lewati navigasi
      </a>

      {/* Toast notification */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: T.primary, color: "#fff", padding: "11px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }} role="status" aria-live="polite">
          {toast}
        </div>
      )}

      {/* Header */}
      <header role="banner" style={{ background: `linear-gradient(135deg, ${T.primary} 0%, #1565C0 100%)`, color: "#fff", padding: "0 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0 9px" }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: "1px", textTransform: "uppercase" }}>
                SIGAP MALUT · UPTD · {fmtDate(now)}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.3px" }}>
                Dashboard Fungsional UPTD
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                {userName.toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{userName}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{userJabatan}</div>
              </div>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#FFF3E0", color: "#E65100", padding: "3px 10px", borderRadius: 10 }}>
                  {tasks.filter((t) => t.status !== "Selesai").length} Tugas Aktif
                </span>
                <BellIcon style={{ width: 18, height: 18, opacity: 0.8, marginLeft: 6, cursor: "pointer" }} />
              </div>
            </div>
          </div>
          {/* Tab nav */}
          <div style={{ display: "flex", gap: 3, paddingTop: 5 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? "#fff" : "transparent", color: tab === t.id ? T.primary : "rgba(255,255,255,0.78)", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: "5px 5px 0 0", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, transition: "all 0.12s" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Konten */}
      <main id="main-content" style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px 48px" }}>
        {tab === "ringkasan" && <TabRingkasan onAction={handleAction} kpiData={liveKpiData} notifItems={notifications} />}
        {tab === "tugas" && <TabTugas filterPrioritas={filterP} setFilterPrioritas={setFilterP} tasks={tasks} />}
        {tab === "laporan" && <TabLaporan laporan={laporan} />}
        {tab === "audit" && <TabAudit auditLog={AUDIT_LOG} />}
      </main>

      {/* Footer */}
      <footer style={{ background: "#152335", color: "rgba(255,255,255,0.45)", textAlign: "center", padding: "11px 24px", fontSize: 11, letterSpacing: "0.3px" }}>
        SIGAP-MALUT © 2026 · Dinas Pangan Provinsi Maluku Utara · UPTD Balai Pengawasan Mutu Pangan · v1.0.0
      </footer>
    </div>
  );
}
