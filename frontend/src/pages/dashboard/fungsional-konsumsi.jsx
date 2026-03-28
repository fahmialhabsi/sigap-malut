// frontend/src/pages/dashboard/fungsional-konsumsi.jsx
// Role: PEJABAT_FUNGSIONAL | Bidang Konsumsi & Keamanan Pangan
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
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  BellIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// ─── Design Tokens ───────────────────────────────────────────────────────────
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

// ─── Master Data Konsumsi & Keamanan Pangan ─────────────────────────────────
const KPI_DATA = [
  {
    id: "k1",
    label: "Skor PPH Provinsi",
    value: 82.3,
    unit: "/100",
    trend: 1.2,
    sub: "Pola Pangan Harapan rumah tangga",
    good: true,
  },
  {
    id: "k2",
    label: "Prevalensi Stunting",
    value: 19.2,
    unit: "%",
    trend: -0.8,
    sub: "Riskesdas 2025 vs 2024",
    good: true,
  },
  {
    id: "k3",
    label: "Uji Sampel Aman",
    value: 94,
    unit: "%",
    trend: 2.0,
    sub: "hasil lab pangan segar",
    good: true,
  },
  {
    id: "k4",
    label: "Demo B2SA Aktif",
    value: 12,
    unit: "kegiatan",
    trend: 3,
    sub: "Kab/Kota menjalankan pekan ini",
    good: true,
  },
  {
    id: "k5",
    label: "Alert Boraks",
    value: 2,
    unit: "kasus",
    trend: 1,
    sub: "butuh penindakan cepat",
    good: false,
  },
  {
    id: "k6",
    label: "Laporan Pending",
    value: 1,
    unit: "dok.",
    trend: 0,
    sub: "menunggu validasi Kabid",
    good: null,
  },
];

const PPH_KAB = [
  { kab: "Pulau Taliabu", pph: 78.5, kat: "Perlu Intervensi" },
  { kab: "Kepulauan Sula", pph: 79.4, kat: "Perlu Intervensi" },
  { kab: "Halmahera Timur", pph: 81.1, kat: "Cukup" },
  { kab: "Halmahera Sel.", pph: 83.6, kat: "Cukup" },
  { kab: "Halmahera Brt.", pph: 84.9, kat: "Cukup" },
  { kab: "Morotai", pph: 86.2, kat: "Baik" },
  { kab: "Halmahera Utara", pph: 85.7, kat: "Baik" },
  { kab: "Halmahera Tengah", pph: 88.1, kat: "Baik" },
  { kab: "Tidore Kep.", pph: 87.4, kat: "Baik" },
  { kab: "Ternate", pph: 90.3, kat: "Baik" },
];

const PPH_COLOR = {
  "Perlu Intervensi": "#C62828",
  Cukup: "#F57C00",
  Baik: "#2E7D32",
};

const TREN_PPH = [
  { bln: "Jan", pph: 80.2, aman: 91, intervensi: 6 },
  { bln: "Feb", pph: 81.0, aman: 92, intervensi: 7 },
  { bln: "Mar", pph: 82.3, aman: 93, intervensi: 9 },
  { bln: "Apr", pph: 82.9, aman: 94, intervensi: 10 },
  { bln: "Mei", pph: 83.4, aman: 94.5, intervensi: 11 },
  { bln: "Jun", pph: 84.1, aman: 95, intervensi: 12 },
];

const PIE_STATUS = [
  { name: "Aman", value: 94, color: "#2E7D32" },
  { name: "Temuan BTP", value: 3, color: "#F57C00" },
  { name: "Kontaminasi Mikroba", value: 2, color: "#C62828" },
  { name: "Label Tidak Jelas", value: 1, color: "#0277BD" },
];

const KOMPOSISI_MENU = [
  { name: "Karbohidrat", value: 45, color: "#1B4F8A" },
  { name: "Protein", value: 22, color: "#2E7D32" },
  { name: "Sayur", value: 18, color: "#F57C00" },
  { name: "Buah", value: 10, color: "#0277BD" },
  { name: "Lainnya", value: 5, color: "#546E7A" },
];

const SAMPEL = [
  {
    komoditas: "Mie basah",
    kategori: "Olahan pangan segar",
    hasil: "Boraks (+)",
    lokasi: "Ternate - Pasar Gamalama",
    tgl: "26 Mar 2026",
    metode: "Rapid Test BTP",
    pph: 78,
    b2sa: "Edukasi ulang",
    nakes: "Dinkes Kota",
  },
  {
    komoditas: "Tahu",
    kategori: "Pangan segar",
    hasil: "Aman",
    lokasi: "Tidore - Pasar Sarimalaha",
    tgl: "25 Mar 2026",
    metode: "Laboratorium",
    pph: 85,
    b2sa: "Demo menu",
    nakes: "RSUD Tidore",
  },
  {
    komoditas: "Ikan cakalang",
    kategori: "Pangan hewani",
    hasil: "Histamin normal",
    lokasi: "Morotai - Pelabuhan",
    tgl: "24 Mar 2026",
    metode: "Spektrofotometri",
    pph: 86,
    b2sa: "Safari gizi",
    nakes: "Puskesmas Daruba",
  },
  {
    komoditas: "Sayur mayur campur",
    kategori: "Pangan segar",
    hasil: "Residu pestisida rendah",
    lokasi: "Halmahera Tengah - Pasar Weda",
    tgl: "23 Mar 2026",
    metode: "Laboratorium",
    pph: 88,
    b2sa: "Kelas B2SA",
    nakes: "PKK Weda",
  },
  {
    komoditas: "Ayam potong",
    kategori: "Pangan hewani",
    hasil: "Salmonella (-)",
    lokasi: "Halmahera Barat - Jailolo",
    tgl: "22 Mar 2026",
    metode: "Laboratorium",
    pph: 84,
    b2sa: "Demo masak",
    nakes: "Dinkes Halbar",
  },
  {
    komoditas: "Susu UHT",
    kategori: "Olahan pangan",
    hasil: "Label sesuai",
    lokasi: "Halmahera Timur - Maba",
    tgl: "21 Mar 2026",
    metode: "Uji label",
    pph: 81,
    b2sa: "Edukasi sekolah",
    nakes: "Gizi Maba",
  },
  {
    komoditas: "Beras fortifikasi",
    kategori: "Pangan pokok",
    hasil: "Fe sesuai standar",
    lokasi: "Pulau Taliabu - Bobong",
    tgl: "20 Mar 2026",
    metode: "Laboratorium",
    pph: 79,
    b2sa: "Distribusi PMT",
    nakes: "Puskesmas Bobong",
  },
  {
    komoditas: "Ikan asap",
    kategori: "Olahan pangan",
    hasil: "PAH < batas",
    lokasi: "Kepulauan Sula - Sanana",
    tgl: "19 Mar 2026",
    metode: "Laboratorium",
    pph: 80,
    b2sa: "Demo higienitas",
    nakes: "Dinkes Sula",
  },
];

const TUGAS = [
  {
    id: "TK001",
    judul: "Validasi uji cepat boraks mie basah",
    tenggat: "29 Mar 2026",
    prioritas: "Kritis",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
  {
    id: "TK002",
    judul: "Monitoring PPH & B2SA Pulau Taliabu",
    tenggat: "02 Apr 2026",
    prioritas: "Tinggi",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
  {
    id: "TK003",
    judul: "Pelaporan stunting triwulan I",
    tenggat: "31 Mar 2026",
    prioritas: "Tinggi",
    status: "Menunggu Validasi",
    lifecycle: "Diajukan",
  },
  {
    id: "TK004",
    judul: "Edukasi B2SA 4 Kab/Kota",
    tenggat: "07 Apr 2026",
    prioritas: "Sedang",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
  {
    id: "TK005",
    judul: "Update dashboard keamanan pangan",
    tenggat: "05 Apr 2026",
    prioritas: "Sedang",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
];

const LAPORAN = [
  {
    judul: "Laporan Keamanan Pangan Feb 2026",
    status: "Selesai",
    tgl: "08 Mar 2026",
    lifecycle: "Selesai",
  },
  {
    judul: "Laporan PPH & B2SA Mar 2026",
    status: "Menunggu Validasi",
    tgl: "26 Mar 2026",
    lifecycle: "Diajukan",
  },
  {
    judul: "Ringkasan Temuan Boraks Q1 2026",
    status: "Dalam Proses",
    tgl: "25 Mar 2026",
    lifecycle: "Diverifikasi",
  },
];

const AUDIT_LOG = [
  {
    aksi: "Upload hasil lab boraks mie basah",
    waktu: "26 Mar 2026, 10:32",
    user: "Nadia L.",
  },
  {
    aksi: "Submit laporan PPH kabupaten",
    waktu: "26 Mar 2026, 09:18",
    user: "Nadia L.",
  },
  {
    aksi: "Validasi rapid test pestisida Weda",
    waktu: "25 Mar 2026, 16:05",
    user: "Nadia L.",
  },
  {
    aksi: "Export CSV uji sampel mingguan",
    waktu: "25 Mar 2026, 11:40",
    user: "Nadia L.",
  },
];

const NOTIFIKASI = [
  {
    id: 1,
    tipe: "kritis",
    pesan: "Temuan boraks pada mie basah – tindak lanjut ke PPID & Satgas",
    waktu: "12 mnt lalu",
  },
  {
    id: 2,
    tipe: "peringatan",
    pesan: "Stunting turun 0.8% vs tahun lalu – verifikasi data Puskesmas",
    waktu: "1 jam lalu",
  },
  {
    id: 3,
    tipe: "info",
    pesan: "12 kegiatan demo B2SA dijadwalkan pekan ini",
    waktu: "3 jam lalu",
  },
  {
    id: 4,
    tipe: "tugas",
    pesan: "Tugas validasi laporan PPH Mar 2026 jatuh tempo 3 hari lagi",
    waktu: "5 jam lalu",
  },
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
            {up ? "▲" : "▼"} {Math.abs(trend)}
            {typeof trend === "number" && Math.abs(trend) < 15 ? "%" : ""}
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

// QuickActionBar — wajib per template standar
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

// ─── Tab Ringkasan ───────────────────────────────────────────────────────────
function TabRingkasan({ onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
            PERINGATAN BORAKS
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#B71C1C",
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            Temuan boraks pada mie basah di Pasar Gamalama. Tindak lanjut
            koordinasi dengan Satgas Pangan & Dinkes kota, lakukan re-sampling
            dan penarikan produk.
          </div>
        </div>
      </div>

      <QuickActionBar onAction={onAction} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
          gap: 12,
        }}
      >
        {KPI_DATA.map((k) => (
          <KpiTile key={k.id} {...k} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SectionTitle
            title="Alert & Notifikasi"
            sub="Pembaruan sistem real-time"
          />
          <AlertList items={NOTIFIKASI} />
        </Card>
        <Card>
          <SectionTitle
            title="Komposisi Menu B2SA"
            sub="Proporsi rata-rata demo masak"
          />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={KOMPOSISI_MENU}
                cx="50%"
                cy="50%"
                outerRadius={72}
                dataKey="value"
                fontSize={12}
              >
                {KOMPOSISI_MENU.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          {KOMPOSISI_MENU.map((d) => (
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
              <span style={{ fontWeight: 700 }}>{d.value}%</span>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <SectionTitle
          title="Status PPH per Kabupaten/Kota"
          sub="Skor Pola Pangan Harapan – Maret 2026"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 8,
          }}
        >
          {PPH_KAB.map((k) => (
            <div
              key={k.kab}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 13px",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderLeft: `4px solid ${PPH_COLOR[k.kat]}`,
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
                  PPH: {k.pph}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: PPH_COLOR[k.kat],
                  background: PPH_COLOR[k.kat] + "22",
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

      <Card>
        <SectionTitle
          title="Riwayat Aktivitas (Audit Trail)"
          sub="Log aksi terakhir – dapat diekspor"
        />
        <ActivityFeed items={AUDIT_LOG} />
      </Card>
    </div>
  );
}

function TabKonsumsi() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <SectionTitle
          title="Tren PPH & Keamanan Pangan"
          sub="Pola Pangan Harapan, sampel aman, dan intervensi B2SA – Jan–Jun 2026"
        />
        <ResponsiveContainer width="100%" height={290}>
          <LineChart
            data={TREN_PPH}
            margin={{ top: 8, right: 14, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
            <XAxis dataKey="bln" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[75, 95]} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              domain={[80, 100]}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pph"
              name="PPH"
              stroke={T.primary}
              strokeWidth={2.5}
              dot
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="aman"
              name="Sampel Aman (%)"
              stroke={T.secondary}
              strokeWidth={2.2}
              dot
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="intervensi"
              name="Intervensi B2SA"
              stroke={T.accent}
              strokeWidth={2.2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <SectionTitle
          title="Hasil Uji Sampel & Intervensi"
          sub="Pengawasan keamanan pangan segar dan olahan"
        />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: T.primary, color: "#fff" }}>
                {[
                  "Komoditas",
                  "Kategori",
                  "Hasil Uji",
                  "Lokasi Sampel",
                  "Tanggal Uji",
                  "Metode",
                  "Skor PPH",
                  "Intervensi B2SA",
                  "Pendamping",
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
              {SAMPEL.map((s, i) => (
                <tr
                  key={s.komoditas + s.tgl}
                  style={{
                    background: i % 2 === 0 ? "#FAFBFD" : "#fff",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <td style={{ padding: "10px 13px", fontWeight: 600 }}>
                    {s.komoditas}
                  </td>
                  <td style={{ padding: "10px 13px" }}>{s.kategori}</td>
                  <td
                    style={{
                      padding: "10px 13px",
                      fontWeight: 700,
                      color: s.hasil.includes("+") ? T.danger : T.secondary,
                    }}
                  >
                    {s.hasil}
                  </td>
                  <td style={{ padding: "10px 13px" }}>{s.lokasi}</td>
                  <td style={{ padding: "10px 13px" }}>{s.tgl}</td>
                  <td style={{ padding: "10px 13px" }}>{s.metode}</td>
                  <td style={{ padding: "10px 13px" }}>{s.pph}</td>
                  <td style={{ padding: "10px 13px" }}>{s.b2sa}</td>
                  <td style={{ padding: "10px 13px" }}>{s.nakes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Distribusi Status Keamanan Sampel"
          sub="Proporsi hasil pengawasan"
        />
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={PIE_STATUS}
              cx="50%"
              cy="50%"
              outerRadius={70}
              dataKey="value"
              fontSize={12}
            >
              {PIE_STATUS.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v}%`, n]} />
          </PieChart>
        </ResponsiveContainer>
        {PIE_STATUS.map((d) => (
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
            <span style={{ fontWeight: 700 }}>{d.value}%</span>
          </div>
        ))}
      </Card>

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
        <strong>ℹ️ Catatan:</strong> PPH dihitung memakai formula Bahan Makanan
        Pokok (FAO) dengan 12 komponen pangan; intervensi B2SA mengacu pada
        Permendagri 51/2020; pengawasan keamanan pangan mengacu pada PerBPOM
        11/2022 tentang Kajian Risiko.
      </div>
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
          sub="Role: PEJABAT_FUNGSIONAL · Akses: Read, Update (milik sendiri), Verify"
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
export default function FungsionalKonsumsiDashboard() {
  const [tab, setTab] = useState("ringkasan");
  const [filterP, setFilterP] = useState("Semua");
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [kpiSummary, setKpiSummary] = useState(null);

  let user = null;
  try {
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
    if (!token) return;
    fetch("/api/dashboard/fungsional-konsumsi/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.success && data?.data) setKpiSummary(data.data); })
      .catch(() => {});
  }, []);

  const userName =
    user?.nama || user?.name || user?.username || "Nadia Lestari";
  const userJabatan =
    user?.jabatan ||
    user?.position ||
    (user?.roleName === "fungsional_konsumsi"
      ? "Pejabat Fungsional Analis Pangan · Bidang Konsumsi & Keamanan Pangan"
      : user?.roleName ||
        "Pejabat Fungsional Analis Pangan · Bidang Konsumsi & Keamanan Pangan");

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
      upload: "Membuka form upload hasil uji…",
      export: "Mengekspor laporan konsumsi/keamanan…",
      generate: "Membuat ringkasan otomatis…",
      verify: "Membuka antarmuka verifikasi data…",
    };
    setToast(msg[id] || "Memproses…");
    setTimeout(() => setToast(null), 2800);
  };

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "konsumsi", label: "Konsumsi & Keamanan" },
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
                🥗
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
                  Dashboard Konsumsi & Keamanan Pangan
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

      <div
        style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px 48px" }}
      >
        {tab === "ringkasan" && <TabRingkasan onAction={handleAction} />}
        {tab === "konsumsi" && <TabKonsumsi />}
        {tab === "tugas" && (
          <TabTugas filterPrioritas={filterP} setFilterPrioritas={setFilterP} />
        )}
      </div>

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
        Konsumsi & Keamanan Pangan · v1.0.0
      </div>
    </div>
  );
}
