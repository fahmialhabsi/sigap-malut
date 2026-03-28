// frontend/src/pages/dashboard/fungsional-uptd-mutu.jsx
// Role: PEJABAT_FUNGSIONAL | UPTD Balai Pengawasan Mutu Pangan
// Akses: Read ✅ | Update (milik sendiri) ✅ | Verify ✅ | Create ❌ | Delete ❌ | Finalize ❌
// Template: 05-template-standar-dashboard.md | Role Matrix: 14-matriks-kebutuhan-layanan-per-role.md
// Modul: UPT-TKN, UPT-MTU, UPT-INS (41 layanan, 7 modul UPTD)

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  FunnelIcon,
  CheckCircleIcon,
  BeakerIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const T = {
  primary: "#1B4F8A",
  secondary: "#2E7D32",
  accent: "#F57C00",
  danger: "#C62828",
  info: "#0277BD",
  teal: "#00695C",
  bg: "#F4F6F9",
  card: "#FFFFFF",
  border: "#DDE3ED",
  textPri: "#1A2B3C",
  textSec: "#546E7A",
};

// ─── Data UPTD Mutu ──────────────────────────────────────────────────────────
const KPI_DATA = [
  {
    id: "k1",
    label: "Sampel Antrian Uji",
    value: 14,
    unit: "sampel",
    trend: 2.0,
    sub: "menunggu penugasan teknisi",
    good: null,
  },
  {
    id: "k2",
    label: "Tingkat Kelulusan Uji",
    value: 87,
    unit: "%",
    trend: 1.5,
    sub: "dari total uji bulan ini",
    good: true,
  },
  {
    id: "k3",
    label: "Sertifikat Aktif",
    value: 42,
    unit: "sertif.",
    trend: 3.0,
    sub: "GMP/GHP/NKV diterbitkan",
    good: true,
  },
  {
    id: "k4",
    label: "Turnaround Time",
    value: 4.2,
    unit: "hari",
    trend: -0.3,
    sub: "rata-rata waktu uji selesai",
    good: false,
  },
  {
    id: "k5",
    label: "Peralatan Kalibrasi",
    value: 3,
    unit: "alat",
    trend: 0,
    sub: "jadwal kalibrasi mendekati",
    good: null,
  },
  {
    id: "k6",
    label: "Audit Pass Rate",
    value: 91,
    unit: "%",
    trend: 0.8,
    sub: "kepatuhan prosedur mutu",
    good: true,
  },
];

const SAMPEL_PER_KOMODITAS = [
  { name: "Beras", masuk: 22, lulus: 19, gagal: 3 },
  { name: "Minyak Goreng", masuk: 18, lulus: 16, gagal: 2 },
  { name: "Gula Pasir", masuk: 14, lulus: 12, gagal: 2 },
  { name: "Tepung", masuk: 11, lulus: 10, gagal: 1 },
  { name: "Telur", masuk: 9, lulus: 7, gagal: 2 },
];

const ANTRIAN_SAMPEL = [
  {
    id: "SMP-2026-041",
    komoditas: "Beras Premium",
    asal: "Ternate",
    tanggalMasuk: "27 Mar 2026",
    status: "Menunggu Penugasan",
    prioritas: "Tinggi",
  },
  {
    id: "SMP-2026-042",
    komoditas: "Minyak Goreng",
    asal: "Halmahera Utara",
    tanggalMasuk: "27 Mar 2026",
    status: "Dalam Pengujian",
    prioritas: "Sedang",
  },
  {
    id: "SMP-2026-043",
    komoditas: "Gula Pasir",
    asal: "Tidore Kepulauan",
    tanggalMasuk: "26 Mar 2026",
    status: "Dalam Pengujian",
    prioritas: "Sedang",
  },
  {
    id: "SMP-2026-044",
    komoditas: "Tepung Terigu",
    asal: "Morotai",
    tanggalMasuk: "26 Mar 2026",
    status: "Menunggu Verifikasi",
    prioritas: "Kritis",
  },
];

const SERTIFIKAT_EXPIRY = [
  {
    id: "CERT-GMP-2024-011",
    nama: "UD Pangan Sejahtera",
    tipe: "GMP",
    expiry: "15 Apr 2026",
    sisaHari: 19,
    status: "Hampir Expired",
  },
  {
    id: "CERT-GHP-2024-025",
    nama: "CV Harapan Bersama",
    tipe: "GHP",
    expiry: "02 Mei 2026",
    sisaHari: 36,
    status: "Aktif",
  },
  {
    id: "CERT-NKV-2024-007",
    nama: "PT Malut Pangan Mandiri",
    tipe: "NKV",
    expiry: "20 Jun 2026",
    sisaHari: 85,
    status: "Aktif",
  },
  {
    id: "CERT-GMP-2024-033",
    nama: "Koperasi Usaha Tani Bacan",
    tipe: "GMP",
    expiry: "10 Apr 2026",
    sisaHari: 14,
    status: "Hampir Expired",
  },
];

const TREN_UJI = [
  { bln: "Jan", masuk: 38, lulus: 32, gagal: 6 },
  { bln: "Feb", masuk: 42, lulus: 37, gagal: 5 },
  { bln: "Mar", masuk: 45, lulus: 39, gagal: 6 },
  { bln: "Apr", masuk: 40, lulus: 35, gagal: 5 },
  { bln: "Mei", masuk: 48, lulus: 43, gagal: 5 },
  { bln: "Jun", masuk: 52, lulus: 45, gagal: 7 },
];

const PIE_HASIL_UJI = [
  { name: "Lulus", value: 87, color: "#2E7D32" },
  { name: "Gagal / TMS", value: 10, color: "#C62828" },
  { name: "Pending Verifikasi", value: 3, color: "#F57C00" },
];

const PERALATAN_LAB = [
  {
    id: "LAB-AAS-01",
    nama: "Atomic Absorption Spectrophotometer",
    kondisi: "Siap",
    kalibrasi: "15 Apr 2026",
    status: "Terjadwal",
  },
  {
    id: "LAB-HPLC-02",
    nama: "High Performance Liquid Chromatography",
    kondisi: "Siap",
    kalibrasi: "28 Mar 2026",
    status: "Kalibrasi Segera",
  },
  {
    id: "LAB-INC-03",
    nama: "Inkubator Mikrobiologi",
    kondisi: "Maintenance",
    kalibrasi: "10 Apr 2026",
    status: "Maintenance",
  },
  {
    id: "LAB-SPEC-04",
    nama: "UV-Vis Spectrophotometer",
    kondisi: "Siap",
    kalibrasi: "20 Mei 2026",
    status: "Normal",
  },
];

const TUGAS = [
  {
    id: "T001",
    judul: "Verifikasi hasil uji beras premium batch Maret 2026",
    tenggat: "28 Mar 2026",
    prioritas: "Kritis",
    status: "Menunggu Verifikasi",
    lifecycle: "Diverifikasi",
  },
  {
    id: "T002",
    judul: "Input data chain of custody sampel minyak goreng SMP-042",
    tenggat: "29 Mar 2026",
    prioritas: "Tinggi",
    status: "Dalam Proses",
    lifecycle: "Diajukan",
  },
  {
    id: "T003",
    judul: "Perpanjangan sertifikat GMP UD Pangan Sejahtera",
    tenggat: "10 Apr 2026",
    prioritas: "Tinggi",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
  {
    id: "T004",
    judul: "Review & pemutakhiran SOP uji residu pestisida",
    tenggat: "05 Apr 2026",
    prioritas: "Sedang",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
  {
    id: "T005",
    judul: "Penjadwalan inspeksi lapangan komoditas Kepulauan Sula",
    tenggat: "12 Apr 2026",
    prioritas: "Sedang",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
];

const LAPORAN = [
  {
    judul: "Laporan Hasil Uji Pangan Maret 2026 (Batch 1)",
    status: "Menunggu Validasi",
    tgl: "27 Mar 2026",
    lifecycle: "Diajukan",
  },
  {
    judul: "Rekap Sertifikasi GMP/GHP/NKV Q1 2026",
    status: "Selesai",
    tgl: "25 Mar 2026",
    lifecycle: "Selesai",
  },
  {
    judul: "Laporan Kegiatan Teknis UPTD Bulan Maret",
    status: "Dalam Proses",
    tgl: "24 Mar 2026",
    lifecycle: "Diverifikasi",
  },
  {
    judul: "Hasil Audit Mutu Internal Triwulan I 2026",
    status: "Selesai",
    tgl: "20 Mar 2026",
    lifecycle: "Arsip",
  },
];

const AUDIT_LOG = [
  {
    aksi: "Verifikasi hasil uji SMP-2026-044 (tepung terigu) — TMS ditemukan",
    waktu: "27 Mar 2026, 10:22",
    user: "Dewi A.",
  },
  {
    aksi: "Upload laporan hasil uji batch Maret 2026",
    waktu: "27 Mar 2026, 09:05",
    user: "Dewi A.",
  },
  {
    aksi: "Update status kalibrasi HPLC-02 — kalibrasi segera",
    waktu: "26 Mar 2026, 15:40",
    user: "Dewi A.",
  },
  {
    aksi: "Input data pengujian beras premium SMP-2026-041",
    waktu: "26 Mar 2026, 11:18",
    user: "Dewi A.",
  },
  {
    aksi: "Penerbitan sertifikat GHP CV Harapan Bersama (CERT-GHP-2024-025)",
    waktu: "25 Mar 2026, 14:55",
    user: "Dewi A.",
  },
];

const NOTIFIKASI = [
  {
    id: 1,
    tipe: "kritis",
    pesan:
      "Sampel SMP-2026-044 (Tepung Terigu, Morotai) menunggu verifikasi hasil uji — berindikasi TMS. Tindak segera!",
    waktu: "30 mnt lalu",
  },
  {
    id: 2,
    tipe: "peringatan",
    pesan:
      "Sertifikat GMP Koperasi Usaha Tani Bacan akan expired 14 hari lagi. Koordinasi perpanjangan.",
    waktu: "2 jam lalu",
  },
  {
    id: 3,
    tipe: "peringatan",
    pesan:
      "Jadwal kalibrasi HPLC-02 jatuh pada 28 Mar 2026. Siapkan teknisi & dokumen kalibrasi.",
    waktu: "3 jam lalu",
  },
  {
    id: 4,
    tipe: "info",
    pesan: "Laporan Hasil Uji Batch Maret 2026 siap divalidasi Kepala UPTD.",
    waktu: "5 jam lalu",
  },
  {
    id: 5,
    tipe: "tugas",
    pesan: "Review pemutakhiran SOP uji residu pestisida tenggat 5 April 2026.",
    waktu: "8 jam lalu",
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
  "Menunggu Verifikasi": { bg: "#FFF3E0", color: "#E65100" },
  "Menunggu Penugasan": { bg: "#F3E5F5", color: "#6A1B9A" },
  "Dalam Pengujian": { bg: "#E3F2FD", color: "#1565C0" },
  Selesai: { bg: "#E8F5E9", color: "#1B5E20" },
  Draft: { bg: "#F5F5F5", color: "#757575" },
  Diajukan: { bg: "#E3F2FD", color: "#0277BD" },
  Diverifikasi: { bg: "#FFF3E0", color: "#F57C00" },
};

const LIFECYCLE_MAP = {
  Draft: { bg: "#F5F5F5", color: "#757575" },
  Diajukan: { bg: "#E3F2FD", color: "#0277BD" },
  Diverifikasi: { bg: "#FFF3E0", color: "#F57C00" },
  Disetujui: { bg: "#E8F5E9", color: "#2E7D32" },
  Selesai: { bg: "#E8F5E9", color: "#1B5E20" },
  Arsip: { bg: "#ECEFF1", color: "#546E7A" },
};

// ─── Sub-komponen ────────────────────────────────────────────────────────────
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
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              background: trendBg,
              color: trendColor,
              padding: "2px 7px",
              borderRadius: 10,
            }}
          >
            {up ? (
              <ArrowUpIcon style={{ width: 12, height: 12 }} />
            ) : (
              <ArrowDownIcon style={{ width: 12, height: 12 }} />
            )}
            {Math.abs(trend)}%
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

function QuickActionBar({ onAction }) {
  const actions = [
    {
      id: "input_sampel",
      label: "Input Sampel",
      icon: <BeakerIcon style={{ width: 15, height: 15 }} />,
      color: T.primary,
    },
    {
      id: "upload_hasil",
      label: "Upload Hasil Uji",
      icon: <ArrowUpTrayIcon style={{ width: 15, height: 15 }} />,
      color: T.secondary,
    },
    {
      id: "verifikasi",
      label: "Verifikasi Hasil",
      icon: <CheckCircleIcon style={{ width: 15, height: 15 }} />,
      color: T.teal,
    },
    {
      id: "export_laporan",
      label: "Export Laporan",
      icon: <DocumentArrowDownIcon style={{ width: 15, height: 15 }} />,
      color: T.info,
    },
    {
      id: "inspeksi",
      label: "Form Inspeksi",
      icon: <MagnifyingGlassIcon style={{ width: 15, height: 15 }} />,
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
          }}
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
                background: T.teal,
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

// ─── Tab Ringkasan ────────────────────────────────────────────────────────────
function TabRingkasan({ onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Banner Peringatan Kritis */}
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
            TEMUAN TMS — TINDAKAN SEGERA
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#B71C1C",
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            Sampel SMP-2026-044 (Tepung Terigu, Morotai) berindikasi Tidak
            Memenuhi Syarat (TMS). Prioritaskan verifikasi, koordinasi dengan
            Kepala UPTD sebelum penerbitan hasil.
          </div>
        </div>
      </div>

      <QuickActionBar onAction={onAction} />

      {/* KPI Grid */}
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

      {/* Alert + Pie Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SectionTitle
            title="Alert & Notifikasi"
            sub="Status laboratorium & sertifikasi real-time"
          />
          <AlertList items={NOTIFIKASI} />
        </Card>
        <Card>
          <SectionTitle
            title="Distribusi Hasil Uji"
            sub="Persentase kelulusan bulan berjalan"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 8,
            }}
          >
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={PIE_HASIL_UJI}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PIE_HASIL_UJI.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PIE_HASIL_UJI.map((p) => (
                <div
                  key={p.name}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: p.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, color: T.textPri }}>
                    {p.name}
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}
                  >
                    {p.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Antrian Sampel */}
      <Card>
        <SectionTitle
          title="Antrian Sampel Uji"
          sub="Sampel aktif — intake, pengujian, menunggu verifikasi"
        />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: T.primary, color: "#fff" }}>
                {[
                  "ID Sampel",
                  "Komoditas",
                  "Asal",
                  "Tgl Masuk",
                  "Status",
                  "Prioritas",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
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
              {ANTRIAN_SAMPEL.map((s, i) => (
                <tr
                  key={s.id}
                  style={{
                    background: i % 2 === 0 ? "#FAFBFD" : "#fff",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {s.id}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{s.komoditas}</td>
                  <td style={{ padding: "10px 12px", color: T.textSec }}>
                    {s.asal}
                  </td>
                  <td style={{ padding: "10px 12px", color: T.textSec }}>
                    {s.tanggalMasuk}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge label={s.status} map={STATUS_MAP} />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge label={s.prioritas} map={PRIORITAS_MAP} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sertifikat Mendekati Expiry */}
      <Card>
        <SectionTitle
          title="Monitoring Sertifikat (GMP / GHP / NKV)"
          sub="Alert expiry — koordinasi perpanjangan sebelum jatuh tempo"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SERTIFIKAT_EXPIRY.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 14px",
                background: c.sisaHari <= 20 ? "#FFF5F5" : "#FAFBFD",
                border: `1px solid ${c.sisaHari <= 20 ? "#FFCDD2" : T.border}`,
                borderLeft: `4px solid ${c.sisaHari <= 20 ? T.danger : T.secondary}`,
                borderRadius: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.nama}</div>
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                  {c.id} · Tipe: {c.tipe} · Expiry: {c.expiry}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: c.sisaHari <= 20 ? T.danger : T.secondary,
                  }}
                >
                  {c.sisaHari} hari lagi
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background:
                      c.status === "Hampir Expired" ? "#FFEBEE" : "#E8F5E9",
                    color:
                      c.status === "Hampir Expired" ? T.danger : T.secondary,
                    padding: "3px 10px",
                    borderRadius: 10,
                  }}
                >
                  {c.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Trail */}
      <Card>
        <SectionTitle
          title="Riwayat Aktivitas (Audit Trail)"
          sub="Log aksi laboratorium terakhir – dapat difilter dan diekspor"
        />
        <ActivityFeed items={AUDIT_LOG} />
      </Card>
    </div>
  );
}

// ─── Tab Pengujian & Lab ──────────────────────────────────────────────────────
function TabPengujian() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Tren Pengujian */}
      <Card>
        <SectionTitle
          title="Tren Hasil Uji Pangan (6 Bulan)"
          sub="Volume sampel masuk, lulus, dan gagal per bulan"
        />
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={TREN_UJI}
            margin={{ top: 8, right: 14, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
            <XAxis dataKey="bln" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="masuk"
              name="Sampel Masuk"
              stroke={T.primary}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="lulus"
              name="Lulus (MS)"
              stroke={T.secondary}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="gagal"
              name="Gagal (TMS)"
              stroke={T.danger}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar Chart per Komoditas */}
      <Card>
        <SectionTitle
          title="Hasil Uji per Komoditas"
          sub="Perbandingan sampel masuk, lulus MS, dan TMS"
        />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={SAMPEL_PER_KOMODITAS}
            margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar
              dataKey="masuk"
              name="Masuk"
              fill={T.primary}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="lulus"
              name="Lulus (MS)"
              fill={T.secondary}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="gagal"
              name="Gagal (TMS)"
              fill={T.danger}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Field Pengujian */}
      <Card>
        <SectionTitle
          title="Field Utama Modul Pengujian"
          sub="Pastikan terisi lengkap pada setiap entri hasil uji"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
          }}
        >
          {[
            "id_sampel",
            "komoditas",
            "asal_sampel",
            "tanggal_masuk",
            "metode_uji",
            "parameter_uji",
            "hasil_numerik",
            "batas_standar",
            "status_ms_tms",
            "teknisi_pelaksana",
            "tanggal_selesai",
            "dokumen_bukti",
          ].map((f) => (
            <div
              key={f}
              style={{
                padding: "9px 11px",
                borderRadius: 8,
                background: "#FAFBFD",
                border: `1px solid ${T.border}`,
                fontSize: 12,
                color: T.textPri,
              }}
            >
              {f.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      </Card>

      {/* Status Peralatan Lab */}
      <Card>
        <SectionTitle
          title="Status Peralatan Laboratorium"
          sub="Kesiapan & jadwal kalibrasi"
        />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: T.teal, color: "#fff" }}>
                {[
                  "ID Alat",
                  "Nama Peralatan",
                  "Kondisi",
                  "Kalibrasi Berikutnya",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
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
              {PERALATAN_LAB.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    background: i % 2 === 0 ? "#FAFBFD" : "#fff",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {p.id}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{p.nama}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          p.kondisi === "Maintenance" ? "#FFF3E0" : "#E8F5E9",
                        color:
                          p.kondisi === "Maintenance" ? T.accent : T.secondary,
                        padding: "2px 9px",
                        borderRadius: 10,
                      }}
                    >
                      {p.kondisi}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: T.textSec }}>
                    {p.kalibrasi}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          p.status === "Kalibrasi Segera"
                            ? "#FFEBEE"
                            : p.status === "Maintenance"
                              ? "#FFF3E0"
                              : "#E8F5E9",
                        color:
                          p.status === "Kalibrasi Segera"
                            ? T.danger
                            : p.status === "Maintenance"
                              ? T.accent
                              : T.secondary,
                        padding: "2px 9px",
                        borderRadius: 10,
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab Tugas & Laporan ──────────────────────────────────────────────────────
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
          sub="Fokus verifikasi hasil uji, sertifikasi, pemutakhiran SOP, dan inspeksi lapangan"
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
                  ID: <code style={{ fontSize: 11 }}>{t.id}</code> · Tenggat:{" "}
                  <strong>{t.tenggat}</strong>
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
export default function FungsionalUPTDMutuDashboard() {
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
    fetch("/api/dashboard/fungsional-uptd-mutu/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.success && data?.data) setKpiSummary(data.data); })
      .catch(() => {});
  }, []);

  const userName = user?.nama || user?.name || user?.username || "Dewi A.";
  const userJabatan =
    user?.jabatan ||
    user?.position ||
    (user?.roleName === "fungsional_uptd_mutu"
      ? "Pejabat Fungsional · UPTD Balai Pengawasan Mutu Pangan"
      : user?.roleName ||
        "Pejabat Fungsional · UPTD Balai Pengawasan Mutu Pangan");

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
      input_sampel: "Membuka form input penerimaan sampel…",
      upload_hasil: "Mengunggah dokumen hasil uji laboratorium…",
      verifikasi: "Membuka antarmuka verifikasi hasil uji…",
      export_laporan: "Mengekspor laporan hasil uji…",
      inspeksi: "Membuka form penjadwalan inspeksi lapangan…",
    };
    setToast(msg[id] || "Memproses…");
    setTimeout(() => setToast(null), 2800);
  };

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "pengujian", label: "Pengujian & Lab" },
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
            background: T.teal,
            color: "#fff",
            padding: "11px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.teal} 0%, #004D40 100%)`,
          color: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Judul & Tanggal */}
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
                🔬
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
                  Dashboard Fungsional UPTD Balai Pengawasan Mutu Pangan
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

          {/* User Info & Badge */}
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
                {TUGAS.length} Tugas Aktif
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
                1 TMS Kritis
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#E8F5E9",
                  color: T.secondary,
                  padding: "3px 10px",
                  borderRadius: 10,
                }}
              >
                42 Sertifikat Aktif
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

          {/* Tab Navigasi */}
          <div style={{ display: "flex", gap: 3, paddingTop: 5 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "#fff" : "transparent",
                  color: tab === t.id ? T.teal : "rgba(255,255,255,0.78)",
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

      {/* Konten Tab */}
      <div
        style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px 48px" }}
      >
        {tab === "ringkasan" && <TabRingkasan onAction={handleAction} />}
        {tab === "pengujian" && <TabPengujian />}
        {tab === "tugas" && (
          <TabTugas filterPrioritas={filterP} setFilterPrioritas={setFilterP} />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          background: "#0D2B23",
          color: "rgba(255,255,255,0.45)",
          textAlign: "center",
          padding: "11px 24px",
          fontSize: 11,
          letterSpacing: "0.3px",
        }}
      >
        SIGAP-MALUT © 2026 · Dinas Pangan Provinsi Maluku Utara · UPTD Balai
        Pengawasan Mutu Pangan · v1.0.0
      </div>
    </div>
  );
}
