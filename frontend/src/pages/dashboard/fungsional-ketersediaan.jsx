// frontend/src/pages/dashboard/fungsional-ketersediaan.jsx
// Role: PEJABAT_FUNGSIONAL | Bidang Ketersediaan & Kerawanan Pangan
// Akses: Read ✅ | Update (milik sendiri) ✅ | Verify ✅ | Create ❌ | Delete ❌ | Finalize ❌
// Template: 05-template-standar-dashboard.md | Role Matrix: 09-matriks-role-akses-modul.md

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  BellIcon,
  DocumentArrowDownIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// ─── Design Tokens (sesuai 05-template-standar-dashboard.md) ─────────────────
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
  sidebarW: 240,
};

// ─── Master Data (referensi 06-Master-Data-Layanan.md & 11-KPI-Definition-Sheet.md) ─
const KPI_DATA = [
  {
    id: "k1",
    label: "SLA Compliance",
    value: 87,
    unit: "%",
    trend: 3.2,
    sub: "laporan selesai tepat waktu",
    good: true,
  },
  {
    id: "k2",
    label: "Komoditas Defisit",
    value: 3,
    unit: "jenis",
    trend: 0,
    sub: "dari 6 komoditas dipantau",
    good: null,
  },
  {
    id: "k3",
    label: "Kab. Rawan Pangan",
    value: 3,
    unit: "kab.",
    trend: 0,
    sub: "dari 10 kabupaten",
    good: null,
  },
  {
    id: "k4",
    label: "Harga Beras (rata2)",
    value: "14.900",
    unit: "Rp/kg",
    trend: 5.2,
    sub: "naik vs bulan lalu",
    good: false,
  },
  {
    id: "k5",
    label: "Cakupan Data Stok",
    value: 87,
    unit: "%",
    trend: 3.1,
    sub: "kab. terlaporkan",
    good: true,
  },
  {
    id: "k6",
    label: "Laporan Menunggu",
    value: 2,
    unit: "dok.",
    trend: 0,
    sub: "validasi Kepala Bidang",
    good: null,
  },
];

const KOMODITAS = [
  { name: "Beras", stok: 4820, butuh: 5200, status: "defisit", delta: -380 },
  { name: "Jagung", stok: 2150, butuh: 1900, status: "surplus", delta: 250 },
  { name: "Ubi Kayu", stok: 3400, butuh: 2800, status: "surplus", delta: 600 },
  { name: "Kedelai", stok: 310, butuh: 420, status: "defisit", delta: -110 },
  { name: "Gula", stok: 580, butuh: 640, status: "defisit", delta: -60 },
  {
    name: "Minyak Goreng",
    stok: 890,
    butuh: 750,
    status: "surplus",
    delta: 140,
  },
];

const STOK_TREN = [
  { bln: "Jan", beras: 5100, jagung: 2200, ubi: 3100 },
  { bln: "Feb", beras: 4950, jagung: 2050, ubi: 3250 },
  { bln: "Mar", beras: 4820, jagung: 2150, ubi: 3400 },
  { bln: "Apr", beras: 4700, jagung: 2300, ubi: 3200 },
  { bln: "Mei", beras: 4550, jagung: 2400, ubi: 3050 },
  { bln: "Jun", beras: 4400, jagung: 2250, ubi: 2900 },
];

const HARGA_TREN = [
  { bln: "Jan", beras: 13500, jagung: 6200, kedelai: 9800 },
  { bln: "Feb", beras: 13700, jagung: 6350, kedelai: 10100 },
  { bln: "Mar", beras: 14200, jagung: 6100, kedelai: 10400 },
  { bln: "Apr", beras: 14800, jagung: 5900, kedelai: 10200 },
  { bln: "Mei", beras: 15100, jagung: 6050, kedelai: 10600 },
  { bln: "Jun", beras: 14900, jagung: 6300, kedelai: 10800 },
];

const IKP_KAB = [
  { kab: "Pulau Taliabu", skor: 4.9, kat: "Kritis" },
  { kab: "Kepulauan Sula", skor: 4.5, kat: "Rentan" },
  { kab: "Halmahera Timur", skor: 4.1, kat: "Rentan" },
  { kab: "Halmahera Sel.", skor: 3.8, kat: "Waspada" },
  { kab: "Halmahera Brt.", skor: 3.6, kat: "Waspada" },
  { kab: "Morotai", skor: 3.5, kat: "Waspada" },
  { kab: "Halmahera Utara", skor: 3.2, kat: "Waspada" },
  { kab: "Halmahera Tengah", skor: 2.9, kat: "Tahan" },
  { kab: "Tidore Kep.", skor: 2.8, kat: "Tahan" },
  { kab: "Ternate", skor: 2.1, kat: "Tahan" },
];

const PIE_IKP = [
  { name: "Tahan", value: 3, color: "#2E7D32" },
  { name: "Waspada", value: 4, color: "#F57C00" },
  { name: "Rentan", value: 2, color: "#EF6C00" },
  { name: "Kritis", value: 1, color: "#C62828" },
];

const HET = [
  { nama: "Beras Medium", het: 12500, pasar: 14900 },
  { nama: "Jagung", het: 5000, pasar: 6300 },
  { nama: "Kedelai", het: 9500, pasar: 10800 },
  { nama: "Gula Pasir", het: 14500, pasar: 14800 },
  { nama: "Minyak Goreng", het: 15500, pasar: 15000 },
];

// Lifecycle: Draft → Diajukan → Diverifikasi → Disetujui → Selesai → Arsip
const TUGAS = [
  {
    id: "T001",
    judul: "Verifikasi data stok beras Halmahera Timur",
    tenggat: "28 Mar 2026",
    prioritas: "Tinggi",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
  {
    id: "T002",
    judul: "Survei harga pasar Ternate – Maret 2026",
    tenggat: "30 Mar 2026",
    prioritas: "Sedang",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
  {
    id: "T003",
    judul: "Update laporan ketersediaan mingguan",
    tenggat: "27 Mar 2026",
    prioritas: "Tinggi",
    status: "Menunggu Validasi",
    lifecycle: "Diajukan",
  },
  {
    id: "T004",
    judul: "Koordinasi distribusi ke Pulau Taliabu",
    tenggat: "02 Apr 2026",
    prioritas: "Kritis",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
  {
    id: "T005",
    judul: "Input data produksi komoditas Q1 2026",
    tenggat: "05 Apr 2026",
    prioritas: "Sedang",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
];

const LAPORAN = [
  {
    judul: "Laporan Ketersediaan Pangan Feb 2026",
    status: "Selesai",
    tgl: "05 Mar 2026",
    lifecycle: "Selesai",
  },
  {
    judul: "Laporan Ketersediaan Pangan Mar 2026",
    status: "Menunggu Validasi",
    tgl: "27 Mar 2026",
    lifecycle: "Diajukan",
  },
  {
    judul: "Laporan FSVA Triwulan I 2026",
    status: "Dalam Proses",
    tgl: "25 Mar 2026",
    lifecycle: "Diverifikasi",
  },
  {
    judul: "Berita Acara Survei Harga Pasar Feb 2026",
    status: "Selesai",
    tgl: "01 Mar 2026",
    lifecycle: "Selesai",
  },
];

// Audit trail (ActivityFeed) sesuai template standar
const AUDIT_LOG = [
  {
    aksi: "Upload data stok beras Halmahera Timur",
    waktu: "27 Mar 2026, 09:14",
    user: "Fahmi A.",
  },
  {
    aksi: "Submit laporan ketersediaan Maret 2026",
    waktu: "27 Mar 2026, 08:55",
    user: "Fahmi A.",
  },
  {
    aksi: "Verifikasi IKP Kepulauan Sula",
    waktu: "26 Mar 2026, 15:30",
    user: "Fahmi A.",
  },
  {
    aksi: "Export laporan CSV ketersediaan Feb 2026",
    waktu: "26 Mar 2026, 11:02",
    user: "Fahmi A.",
  },
  {
    aksi: "Input data harga pasar Ternate",
    waktu: "25 Mar 2026, 10:20",
    user: "Fahmi A.",
  },
];

const NOTIFIKASI = [
  {
    id: 1,
    tipe: "kritis",
    pesan: "Stok beras Pulau Taliabu ≤7 hari – tindakan segera diperlukan",
    waktu: "10 mnt lalu",
  },
  {
    id: 2,
    tipe: "peringatan",
    pesan: "Harga beras naik 5.2% dalam 3 minggu terakhir di Ternate",
    waktu: "1 jam lalu",
  },
  {
    id: 3,
    tipe: "info",
    pesan: "Laporan Ketersediaan Februari 2026 telah divalidasi Kabid",
    waktu: "3 jam lalu",
  },
  {
    id: 4,
    tipe: "tugas",
    pesan: "Tugas survei pasar Tidore Kepulauan jatuh tempo 2 hari lagi",
    waktu: "5 jam lalu",
  },
];

const IKP_COLOR = {
  Tahan: "#2E7D32",
  Waspada: "#F57C00",
  Rentan: "#EF6C00",
  Kritis: "#C62828",
};
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

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 4,
            height: 20,
            background: T.primary,
            borderRadius: 2,
          }}
        />
        <h3
          style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.textPri }}
        >
          {title}
        </h3>
      </div>
      {sub && (
        <p style={{ margin: "3px 0 0 12px", fontSize: 12, color: T.textSec }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "18px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function KpiTile({ label, value, unit, trend, sub, good }) {
  const up = trend > 0;
  const showTrend = trend !== 0;
  const trendColor =
    good === null ? T.info : good === up ? T.secondary : T.danger;
  const trendBg =
    good === null ? "#E3F2FD" : good === up ? "#E8F5E9" : "#FFEBEE";
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "16px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: T.textSec,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.6px",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: T.textPri }}>
          {value}
        </span>
        <span style={{ fontSize: 12, color: T.textSec }}>{unit}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {showTrend && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: trendBg,
              color: trendColor,
              padding: "2px 7px",
              borderRadius: 10,
            }}
          >
            {up ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
        <span style={{ fontSize: 11, color: T.textSec }}>{sub}</span>
      </div>
    </div>
  );
}

function Badge({ label, map }) {
  const s = map[label] || { bg: "#F5F5F5", color: "#666" };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        padding: "2px 9px",
        borderRadius: 10,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// QuickActionBar — wajib per template standar (upload, export, generate report)
function QuickActionBar({ onAction }) {
  const actions = [
    {
      id: "upload",
      label: "Upload Data",
      icon: <ArrowUpTrayIcon style={{ width: 15, height: 15 }} />,
      color: T.primary,
    },
    {
      id: "export",
      label: "Export Laporan",
      icon: <DocumentArrowDownIcon style={{ width: 15, height: 15 }} />,
      color: T.secondary,
    },
    {
      id: "generate",
      label: "Generate Report",
      icon: <DocumentChartBarIcon style={{ width: 15, height: 15 }} />,
      color: T.info,
    },
    {
      id: "verify",
      label: "Verifikasi Data",
      icon: <CheckCircleIcon style={{ width: 15, height: 15 }} />,
      color: T.accent,
    },
  ];
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: T.textSec,
          alignSelf: "center",
          marginRight: 4,
        }}
      >
        Aksi Cepat:
      </span>
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => onAction(a.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            background: a.color,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "7px 14px",
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {a.icon} {a.label}
        </button>
      ))}
    </div>
  );
}

// AlertList — sesuai template standar
function AlertList({ items }) {
  const colorMap = {
    kritis: T.danger,
    peringatan: T.accent,
    info: T.info,
    tugas: T.secondary,
  };
  const bgMap = {
    kritis: "#FFEBEE",
    peringatan: "#FFF8E1",
    info: "#E3F2FD",
    tugas: "#E8F5E9",
  };
  const emojiMap = { kritis: "🔴", peringatan: "🟡", info: "🔵", tugas: "✅" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {items.map((n) => (
        <div
          key={n.id}
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            padding: "11px 14px",
            background: bgMap[n.tipe],
            borderLeft: `4px solid ${colorMap[n.tipe]}`,
            borderRadius:
              n.id === items[0].id
                ? "6px 6px 0 0"
                : n.id === items[items.length - 1].id
                  ? "0 0 6px 6px"
                  : 0,
          }}
        >
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
            {emojiMap[n.tipe]}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: T.textPri, lineHeight: 1.4 }}>
              {n.pesan}
            </div>
            <div style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>
              {n.waktu}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ActivityFeed (Audit Trail) — wajib per template standar
function ActivityFeed({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((a, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 12,
            paddingBottom: 12,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: T.primary,
                marginTop: 4,
              }}
            />
            {i < items.length - 1 && (
              <div
                style={{
                  width: 1,
                  flex: 1,
                  background: T.border,
                  marginTop: 4,
                }}
              />
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontSize: 13, color: T.textPri }}>{a.aksi}</div>
            <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
              {a.waktu} · {a.user}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Komponen Tab ─────────────────────────────────────────────────────────────
function TabRingkasan({ onAction, kpiData = KPI_DATA, notifItems = NOTIFIKASI }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Alert kritis */}
      <div
        style={{
          background: "#FFEBEE",
          border: `1px solid #FFCDD2`,
          borderLeft: `5px solid ${T.danger}`,
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 700, color: T.danger, fontSize: 13 }}>
            PERINGATAN KRITIS — TINDAKAN SEGERA
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#B71C1C",
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            Stok beras Pulau Taliabu berada pada level kritis (≤7 hari
            kebutuhan). Koordinasi distribusi darurat sedang berjalan bersama
            Kabid dan Dinas Kabupaten.
          </div>
        </div>
      </div>

      {/* QuickActionBar */}
      <QuickActionBar onAction={onAction} />

      {/* KPI Tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
          gap: 12,
        }}
      >
        {kpiData.map((k) => (
          <KpiTile key={k.id} {...k} />
        ))}
      </div>

      {/* Notifikasi + Chart */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 16 }}
      >
        <Card>
          <SectionTitle
            title="Alert & Notifikasi"
            sub="Pembaruan sistem real-time"
          />
          <AlertList items={notifItems} />
        </Card>
        <Card>
          <SectionTitle
            title="Stok vs Kebutuhan – Maret 2026"
            sub="6 komoditas pangan strategis"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={KOMODITAS}
              margin={{ top: 4, right: 8, left: -14, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit=" t" />
              <Tooltip
                formatter={(v, n) => [
                  `${v.toLocaleString("id-ID")} ton`,
                  n === "stok" ? "Stok" : "Kebutuhan",
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="stok"
                name="Stok"
                fill={T.primary}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="butuh"
                name="Kebutuhan"
                fill={T.accent}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Status IKP per Kabupaten */}
      <Card>
        <SectionTitle
          title="Status Kerawanan Pangan per Kabupaten/Kota"
          sub="Indeks Kerawanan Pangan (IKP) Composite – Maret 2026"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 8,
          }}
        >
          {IKP_KAB.map((k) => (
            <div
              key={k.kab}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 13px",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderLeft: `4px solid ${IKP_COLOR[k.kat]}`,
                borderRadius: 6,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}
                >
                  {k.kab}
                </div>
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 1 }}>
                  IKP: {k.skor}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: IKP_COLOR[k.kat],
                  background: IKP_COLOR[k.kat] + "22",
                  padding: "2px 9px",
                  borderRadius: 10,
                }}
              >
                {k.kat}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Trail */}
      <Card>
        <SectionTitle
          title="Riwayat Aktivitas (Audit Trail)"
          sub="Log aksi terakhir – dapat difilter dan diekspor"
        />
        <ActivityFeed items={AUDIT_LOG} />
      </Card>
    </div>
  );
}

function TabKetersediaan() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <SectionTitle
          title="Data Ketersediaan Komoditas Pangan Strategis"
          sub="Stok aktual vs kebutuhan bulanan – Maluku Utara, Maret 2026"
        />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: T.primary, color: "#fff" }}>
                {[
                  "No",
                  "Komoditas",
                  "Stok (ton)",
                  "Kebutuhan (ton)",
                  "Selisih",
                  "Kecukupan",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 13px",
                      textAlign: h === "No" ? "center" : "left",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KOMODITAS.map((k, i) => {
                const pct = ((k.stok / k.butuh) * 100).toFixed(1);
                const surp = k.status === "surplus";
                return (
                  <tr
                    key={k.name}
                    style={{
                      background: i % 2 === 0 ? "#FAFBFD" : "#fff",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <td
                      style={{
                        padding: "11px 13px",
                        textAlign: "center",
                        color: T.textSec,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ padding: "11px 13px", fontWeight: 600 }}>
                      {k.name}
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      {k.stok.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      {k.butuh.toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "11px 13px",
                        fontWeight: 700,
                        color: surp ? T.secondary : T.danger,
                      }}
                    >
                      {surp ? "+" : ""}
                      {k.delta.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 7,
                            background: "#EEF0F5",
                            borderRadius: 4,
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(+pct, 100)}%`,
                              height: "100%",
                              background: surp ? T.secondary : T.danger,
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: T.textSec,
                            minWidth: 40,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          background: surp ? "#E8F5E9" : "#FFEBEE",
                          color: surp ? T.secondary : T.danger,
                          padding: "3px 10px",
                          borderRadius: 10,
                        }}
                      >
                        {surp ? "SURPLUS" : "DEFISIT"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Tren Stok 3 Komoditas Utama (Jan–Jun 2026)"
          sub="Pemantauan stok bulanan dalam ton"
        />
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={STOK_TREN}
            margin={{ top: 8, right: 14, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.primary} stopOpacity={0.22} />
                <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.secondary} stopOpacity={0.22} />
                <stop offset="95%" stopColor={T.secondary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.accent} stopOpacity={0.22} />
                <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
            <XAxis dataKey="bln" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit=" t" />
            <Tooltip formatter={(v) => [`${v.toLocaleString("id-ID")} ton`]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="beras"
              name="Beras"
              stroke={T.primary}
              fill="url(#gb)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="jagung"
              name="Jagung"
              stroke={T.secondary}
              fill="url(#gj)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="ubi"
              name="Ubi Kayu"
              stroke={T.accent}
              fill="url(#gu)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Info metodologi */}
      <div
        style={{
          background: "#E3F2FD",
          border: "1px solid #BBDEFB",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 13,
          color: "#0D47A1",
        }}
      >
        <strong>ℹ️ Sumber data:</strong> Data stok berasal dari laporan mingguan
        Dinas Kabupaten/Kota yang diinput melalui modul Ketersediaan
        SIGAP-MALUT. Kebutuhan dihitung berdasarkan data konsumsi per kapita BPS
        Maluku Utara × proyeksi penduduk 2026.
      </div>
    </div>
  );
}

function TabKerawanan() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <SectionTitle
            title="Indeks Kerawanan Pangan (IKP) per Kabupaten/Kota"
            sub="Skala 1–5 · FSVA Composite · Maret 2026"
          />
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            {Object.entries(IKP_COLOR).map(([k, c]) => (
              <span
                key={k}
                style={{
                  fontSize: 11,
                  background: c + "22",
                  color: c,
                  border: `1px solid ${c}44`,
                  padding: "2px 10px",
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                ● {k}
              </span>
            ))}
          </div>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: T.primary, color: "#fff" }}>
                {["No", "Kabupaten/Kota", "Skor IKP", "Kategori"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 13px",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {IKP_KAB.map((k, i) => (
                <tr
                  key={k.kab}
                  style={{
                    background: i % 2 === 0 ? "#FAFBFD" : "#fff",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <td style={{ padding: "10px 13px", color: T.textSec }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: "10px 13px", fontWeight: 600 }}>
                    {k.kab}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 7,
                          background: "#EEF0F5",
                          borderRadius: 4,
                        }}
                      >
                        <div
                          style={{
                            width: `${(k.skor / 5) * 100}%`,
                            height: "100%",
                            background: IKP_COLOR[k.kat],
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 12, minWidth: 26 }}>
                        {k.skor}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: IKP_COLOR[k.kat],
                        background: IKP_COLOR[k.kat] + "22",
                        padding: "2px 9px",
                        borderRadius: 10,
                      }}
                    >
                      {k.kat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <SectionTitle title="Distribusi Kategori" sub="10 Kabupaten/Kota" />
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={PIE_IKP}
                  cx="50%"
                  cy="50%"
                  outerRadius={72}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                  labelLine={{ strokeWidth: 1 }}
                  fontSize={12}
                >
                  {PIE_IKP.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} kabupaten`, n]} />
              </PieChart>
            </ResponsiveContainer>
            {PIE_IKP.map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: `1px solid ${T.border}`,
                  fontSize: 12,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 2,
                      background: d.color,
                      display: "inline-block",
                    }}
                  />
                  {d.name}
                </span>
                <span style={{ fontWeight: 700 }}>{d.value} kab.</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div
        style={{
          background: "#E3F2FD",
          border: "1px solid #BBDEFB",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 13,
          color: "#0D47A1",
        }}
      >
        <strong>ℹ️ Metodologi IKP:</strong> Composite Index berdasarkan 3
        dimensi FSVA: (1) Ketersediaan, (2) Akses, dan (3) Pemanfaatan Pangan.
        Skor 1–2 = Tahan | 3 = Waspada | 4 = Rentan | 5 = Kritis. Ref: WFP-BKP
        Pedoman FSVA Nasional 2022.
      </div>
    </div>
  );
}

function TabHarga() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <SectionTitle
          title="Tren Harga Komoditas Pangan Strategis"
          sub="Rata-rata harga pasar tradisional Maluku Utara (Rp/kg) – Jan–Jun 2026"
        />
        <ResponsiveContainer width="100%" height={290}>
          <LineChart
            data={HARGA_TREN}
            margin={{ top: 8, right: 14, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
            <XAxis dataKey="bln" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v) => [`Rp ${v.toLocaleString("id-ID")}/kg`]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="beras"
              name="Beras"
              stroke={T.primary}
              strokeWidth={2.5}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="jagung"
              name="Jagung"
              stroke={T.secondary}
              strokeWidth={2.5}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="kedelai"
              name="Kedelai"
              stroke={T.accent}
              strokeWidth={2.5}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <SectionTitle
          title="Perbandingan Harga Pasar vs HET"
          sub="Harga Eceran Tertinggi – Permendag & pembaruan terkini"
        />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: T.primary, color: "#fff" }}>
                {[
                  "Komoditas",
                  "HET (Rp/kg)",
                  "Harga Pasar Mar '26",
                  "Selisih",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 13px",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HET.map((r, i) => {
                const sel = r.pasar - r.het;
                const over = sel > 0;
                return (
                  <tr
                    key={r.nama}
                    style={{
                      background: i % 2 === 0 ? "#FAFBFD" : "#fff",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <td style={{ padding: "10px 13px", fontWeight: 600 }}>
                      {r.nama}
                    </td>
                    <td style={{ padding: "10px 13px" }}>
                      Rp {r.het.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "10px 13px" }}>
                      Rp {r.pasar.toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "10px 13px",
                        fontWeight: 700,
                        color: over ? T.danger : T.secondary,
                      }}
                    >
                      {over ? "+" : ""}
                      {sel.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "10px 13px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          background: over ? "#FFEBEE" : "#E8F5E9",
                          color: over ? T.danger : T.secondary,
                          padding: "3px 10px",
                          borderRadius: 10,
                        }}
                      >
                        {over ? "Di Atas HET" : "Di Bawah HET"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TabTugas({ filterPrioritas, setFilterPrioritas }) {
  const filtered =
    filterPrioritas === "Semua"
      ? TUGAS
      : TUGAS.filter((t) => t.prioritas === filterPrioritas);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <SectionTitle
          title="Daftar Tugas Aktif"
          sub={`Role: PEJABAT_FUNGSIONAL · Akses: Read, Update (milik sendiri), Verify`}
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <FunnelIcon style={{ width: 15, height: 15, color: T.textSec }} />
          {["Semua", "Kritis", "Tinggi", "Sedang"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterPrioritas(f)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                background: filterPrioritas === f ? T.primary : "#EEF0F5",
                color: filterPrioritas === f ? "#fff" : T.textPri,
                border: `1px solid ${filterPrioritas === f ? T.primary : T.border}`,
                borderRadius: 6,
                padding: "4px 13px",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {filtered.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                padding: "13px 15px",
                background: t.prioritas === "Kritis" ? "#FFF5F5" : T.bg,
                border: `1px solid ${t.prioritas === "Kritis" ? "#FFCDD2" : T.border}`,
                borderLeft: `4px solid ${PRIORITAS_MAP[t.prioritas]?.color || T.primary}`,
                borderRadius: 6,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}
                >
                  {t.judul}
                </div>
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>
                  ID: <code style={{ fontSize: 11 }}>{t.id}</code> &nbsp;·&nbsp;
                  Tenggat: <strong>{t.tenggat}</strong>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <Badge label={t.prioritas} map={PRIORITAS_MAP} />
                <Badge label={t.lifecycle} map={LIFECYCLE_MAP} />
                <Badge label={t.status} map={STATUS_MAP} />
                <button
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: T.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "5px 12px",
                    cursor: "pointer",
                  }}
                >
                  Buka
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Laporan */}
      <Card>
        <SectionTitle
          title="Dokumen Laporan"
          sub="Lifecycle: Draft → Diajukan → Diverifikasi → Disetujui → Selesai → Arsip"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LAPORAN.map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 14px",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📄</span>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}
                  >
                    {l.judul}
                  </div>
                  <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                    {l.tgl}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge label={l.lifecycle} map={LIFECYCLE_MAP} />
                <Badge label={l.status} map={STATUS_MAP} />
                <button
                  style={{
                    fontSize: 11,
                    background: "transparent",
                    color: T.info,
                    border: `1px solid ${T.info}`,
                    borderRadius: 6,
                    padding: "4px 11px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Unduh
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function FungsionalKetersediaanDashboard() {
  const [tab, setTab] = useState("ringkasan");
  const [filterP, setFilterP] = useState("Semua");
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [kpiSummary, setKpiSummary] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [tasks, setTasks] = useState(TUGAS);
  const [laporan, setLaporan] = useState(LAPORAN);
  const [notifications, setNotifications] = useState(NOTIFIKASI);

  // Ambil user login dari authStore (Zustand) atau localStorage fallback
  let user = null;
  try {
    // Try Zustand store first, then localStorage fallback
    const storeRaw = sessionStorage.getItem("auth-store") || localStorage.getItem("auth-store");
    if (storeRaw) {
      const parsed = JSON.parse(storeRaw);
      user = parsed?.state?.user || null;
    }
    if (!user) user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }

  // Fetch KPI summary dari backend
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { setKpiLoading(false); return; }

    fetch("/api/dashboard/fungsional-ketersediaan/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.success && data?.data) setKpiSummary(data.data);
      })
      .catch(() => {/* silently fallback to static data */})
      .finally(() => setKpiLoading(false));
  }, []);

  // Fetch tasks dari backend (bkt-pgd)
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    fetch("/api/bkt-pgd?limit=10&status=submitted", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const rows = data?.data ?? data ?? null;
        if (Array.isArray(rows) && rows.length > 0) {
          setTasks(rows.map((t) => ({
            id: t.id || t.no_urut || "—",
            judul: t.judul || t.nama || t.keterangan || "—",
            tenggat: t.tanggal_batas || t.created_at?.slice(0, 10) || "—",
            prioritas: t.prioritas || "Sedang",
            status: t.status || "Dalam Proses",
            lifecycle: t.workflow_status || "Diajukan",
          })));
        }
      })
      .catch(() => {/* keep static fallback */});
  }, []);

  // Fetch laporan dari workflow_instances (modul BKT)
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    fetch("/api/workflowinstance?modul=BKT&limit=5", {
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
      .catch(() => {/* keep static fallback */});
  }, []);

  // Merge live KPI over static KPI_DATA tiles
  const liveKpiData = kpiSummary ? [
    { id: "k1", label: "SLA Compliance", value: kpiSummary.complianceRate ?? KPI_DATA[0].value, unit: "%", trend: 0, sub: "laporan selesai tepat waktu", good: true },
    { id: "k2", label: "Komoditas Defisit", value: kpiSummary.komoditasDefisit ?? KPI_DATA[1].value, unit: "jenis", trend: 0, sub: "dari total komoditas dipantau", good: null },
    { id: "k3", label: "Laporan Menunggu", value: kpiSummary.laporanMenungguVerifikasi ?? KPI_DATA[5].value, unit: "dok.", trend: 0, sub: "validasi Kepala Bidang", good: null },
    { id: "k4", label: "Stok Volume", value: kpiSummary.stokVolumeBulanIni != null ? `${Number(kpiSummary.stokVolumeBulanIni).toLocaleString("id-ID")}` : KPI_DATA[3].value, unit: "ton", trend: 0, sub: "total stok bulan ini", good: true },
    KPI_DATA[2],
    KPI_DATA[4],
  ] : KPI_DATA;
  // Fallback jika tidak ada user login
  const userName =
    user?.nama || user?.name || user?.username || "Fahmi Alhabsi";
  const userJabatan =
    user?.jabatan ||
    user?.position ||
    (user?.roleName === "fungsional_ketersediaan"
      ? "Pejabat Fungsional Analis Ketahanan Pangan · Bidang Ketersediaan & Kerawanan Pangan"
      : user?.roleName ||
        "Pejabat Fungsional Analis Ketahanan Pangan · Bidang Ketersediaan & Kerawanan Pangan");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const fmtDate = (d) =>
    d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleAction = (id) => {
    const msg = {
      upload: "Membuka form upload data stok…",
      export: "Mengekspor laporan ke CSV/Excel…",
      generate: "Membuat laporan otomatis…",
      verify: "Membuka antarmuka verifikasi data…",
    };
    setToast(msg[id] || "Memproses…");
    setTimeout(() => setToast(null), 2800);
  };

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "ketersediaan", label: "Ketersediaan Pangan" },
    { id: "kerawanan", label: "Kerawanan Pangan" },
    { id: "harga", label: "Harga & Distribusi" },
    { id: "tugas", label: "Tugas & Laporan" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: T.bg,
        minHeight: "100vh",
        color: T.textPri,
      }}
    >
      {/* ── Toast notifikasi ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 9999,
            background: T.primary,
            color: "#fff",
            padding: "11px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.primary} 0%, #1565C0 100%)`,
          color: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Top row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 0 9px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🌾
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.75,
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                  }}
                >
                  SIGAP-MALUT · Dinas Pangan Provinsi Maluku Utara
                </div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  Sistem Informasi Geospasial Ketahanan Pangan
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{fmtDate(now)}</div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 1 }}>
                Data per: Maret 2026
              </div>
            </div>
          </div>

          {/* User strip */}
          <div
            style={{
              background: "rgba(255,255,255,0.09)",
              borderRadius: "6px 6px 0 0",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{userName}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{userJabatan}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#FFF3E0",
                  color: "#E65100",
                  padding: "3px 10px",
                  borderRadius: 10,
                }}
              >
                5 Tugas Aktif
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#FFEBEE",
                  color: T.danger,
                  padding: "3px 10px",
                  borderRadius: 10,
                }}
              >
                1 Kritis
              </span>
              <BellIcon
                style={{
                  width: 18,
                  height: 18,
                  opacity: 0.8,
                  marginLeft: 6,
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          {/* Tab nav */}
          <div style={{ display: "flex", gap: 3, paddingTop: 5 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "#fff" : "transparent",
                  color: tab === t.id ? T.primary : "rgba(255,255,255,0.78)",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "5px 5px 0 0",
                  fontSize: 13,
                  fontWeight: tab === t.id ? 700 : 500,
                  transition: "all 0.12s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Konten ── */}
      <div
        style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px 48px" }}
      >
        {tab === "ringkasan" && <TabRingkasan onAction={handleAction} kpiData={liveKpiData} notifItems={notifications} />}
        {tab === "ketersediaan" && <TabKetersediaan />}
        {tab === "kerawanan" && <TabKerawanan />}
        {tab === "harga" && <TabHarga />}
        {tab === "tugas" && (
          <TabTugas filterPrioritas={filterP} setFilterPrioritas={setFilterP} />
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          background: "#152335",
          color: "rgba(255,255,255,0.45)",
          textAlign: "center",
          padding: "11px 24px",
          fontSize: 11,
          letterSpacing: "0.3px",
        }}
      >
        SIGAP-MALUT © 2026 · Dinas Pangan Provinsi Maluku Utara · Bidang
        Ketersediaan & Kerawanan Pangan · v1.0.0
      </div>
    </div>
  );
}
