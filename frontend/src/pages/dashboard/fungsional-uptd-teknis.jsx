// frontend/src/pages/dashboard/fungsional-uptd-teknis.jsx
// Role: PEJABAT_FUNGSIONAL | UPTD Balai Pengawasan Mutu Pangan — Jalur Teknis/Operasional
// Akses: Read ✅ | Update (milik sendiri) ✅ | Verify ✅ | Create ❌ | Delete ❌ | Finalize ❌
// Template: 05-template-standar-dashboard.md | Role Matrix: 14-matriks-kebutuhan-layanan-per-role.md
// Modul: UPT-INS (inspeksi, sampling, audit, monitoring perbaikan) — Jalur B Dual-Track UPTD
// Ref: 14-alur-kerja-sekretariat-bidang-uptd.md §6 Struktur Dual-Track UPTD

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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  BellIcon,
  DocumentArrowDownIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";

const T = {
  primary: "#1B4F8A",
  secondary: "#2E7D32",
  accent: "#F57C00",
  danger: "#C62828",
  info: "#0277BD",
  indigo: "#283593",   // warna khas UPTD Teknis — beda dari teal UPTD Mutu
  bg: "#F4F6F9",
  card: "#FFFFFF",
  border: "#DDE3ED",
  textPri: "#1A2B3C",
  textSec: "#546E7A",
};

// ─── Data UPTD Teknis ────────────────────────────────────────────────────────

const KPI_DATA = [
  {
    id: "k1",
    label: "Inspeksi Terjadwal",
    value: 9,
    unit: "kegiatan",
    trend: 2.0,
    sub: "bulan berjalan",
    good: true,
  },
  {
    id: "k2",
    label: "Temuan Aktif",
    value: 5,
    unit: "temuan",
    trend: 1.0,
    sub: "dalam pemantauan perbaikan",
    good: null,
  },
  {
    id: "k3",
    label: "Audit Sertifikasi",
    value: 4,
    unit: "proses",
    trend: 0.5,
    sub: "on-going bulan ini",
    good: true,
  },
  {
    id: "k4",
    label: "Sampel Diambil",
    value: 28,
    unit: "sampel",
    trend: 3.0,
    sub: "dari 7 kabupaten/kota",
    good: true,
  },
  {
    id: "k5",
    label: "Perbaikan Selesai",
    value: 11,
    unit: "kasus",
    trend: 2.0,
    sub: "pembinaan tuntas",
    good: true,
  },
  {
    id: "k6",
    label: "SLA Inspeksi",
    value: 89,
    unit: "%",
    trend: -1.2,
    sub: "ketepatan jadwal lapangan",
    good: false,
  },
];

const JADWAL_INSPEKSI = [
  {
    id: "INS-2026-031",
    lokasi: "UD Barakati — Ternate Selatan",
    komoditas: "Minyak Goreng",
    jenis: "Inspeksi Lapangan",
    jadwal: "28 Mar 2026",
    tim: "Tim A",
    status: "Terjadwal",
    prioritas: "Tinggi",
  },
  {
    id: "INS-2026-032",
    lokasi: "CV Sumber Hidup — Halmahera Utara",
    komoditas: "Beras Premium",
    jenis: "Audit Sertifikasi",
    jadwal: "29 Mar 2026",
    tim: "Tim B",
    status: "Dalam Proses",
    prioritas: "Kritis",
  },
  {
    id: "INS-2026-033",
    lokasi: "Pasar Barito — Tidore Kepulauan",
    komoditas: "Telur & Daging",
    jenis: "Pengambilan Sampel",
    jadwal: "30 Mar 2026",
    tim: "Tim A",
    status: "Terjadwal",
    prioritas: "Sedang",
  },
  {
    id: "INS-2026-034",
    lokasi: "PT Malut Pangan — Sofifi",
    komoditas: "Tepung Terigu",
    jenis: "Audit Ulang",
    jadwal: "01 Apr 2026",
    tim: "Tim B",
    status: "Terjadwal",
    prioritas: "Tinggi",
  },
  {
    id: "INS-2026-035",
    lokasi: "Koperasi Usaha Tani — Bacan",
    komoditas: "Gula Pasir",
    jenis: "Monitoring Perbaikan",
    jadwal: "03 Apr 2026",
    tim: "Tim A",
    status: "Belum Dimulai",
    prioritas: "Sedang",
  },
];

const TEMUAN_AKTIF = [
  {
    id: "TMN-2026-011",
    pelaku: "UD Barakati",
    jenis: "Label Tidak Sesuai",
    tanggal: "15 Mar 2026",
    batas_perbaikan: "28 Mar 2026",
    sisa_hari: 1,
    status: "Belum Diperbaiki",
    tingkat: "Kritis",
  },
  {
    id: "TMN-2026-012",
    pelaku: "CV Sumber Hidup",
    jenis: "Fasilitas Sanitasi Tidak Memadai",
    tanggal: "18 Mar 2026",
    batas_perbaikan: "10 Apr 2026",
    sisa_hari: 14,
    status: "Dalam Perbaikan",
    tingkat: "Tinggi",
  },
  {
    id: "TMN-2026-013",
    pelaku: "Koperasi Usaha Tani Bacan",
    jenis: "Dokumen GMP Kedaluwarsa",
    tanggal: "20 Mar 2026",
    batas_perbaikan: "15 Apr 2026",
    sisa_hari: 19,
    status: "Dalam Perbaikan",
    tingkat: "Tinggi",
  },
  {
    id: "TMN-2026-014",
    pelaku: "Pasar Barito Tidore",
    jenis: "Penyimpanan Produk Tidak Sesuai Suhu",
    tanggal: "22 Mar 2026",
    batas_perbaikan: "30 Apr 2026",
    sisa_hari: 34,
    status: "Menunggu Verifikasi",
    tingkat: "Sedang",
  },
  {
    id: "TMN-2026-015",
    pelaku: "PT Malut Pangan Sofifi",
    jenis: "Alur Produksi Tidak Terdokumentasi",
    tanggal: "24 Mar 2026",
    batas_perbaikan: "24 Apr 2026",
    sisa_hari: 28,
    status: "Belum Diperbaiki",
    tingkat: "Sedang",
  },
];

const PROGRES_SAMPLING = [
  { kabkota: "Ternate", target: 8, realisasi: 8, sisa: 0 },
  { kabkota: "Tidore", target: 6, realisasi: 5, sisa: 1 },
  { kabkota: "Halmahera Utara", target: 5, realisasi: 4, sisa: 1 },
  { kabkota: "Halmahera Barat", target: 4, realisasi: 3, sisa: 1 },
  { kabkota: "Halmahera Selatan", target: 4, realisasi: 3, sisa: 1 },
  { kabkota: "Kepulauan Sula", target: 3, realisasi: 2, sisa: 1 },
  { kabkota: "Morotai", target: 3, realisasi: 3, sisa: 0 },
];

const TREN_INSPEKSI = [
  { bln: "Jan", dilaksanakan: 6, temuan: 3, perbaikan: 2 },
  { bln: "Feb", dilaksanakan: 7, temuan: 4, perbaikan: 3 },
  { bln: "Mar", dilaksanakan: 9, temuan: 5, perbaikan: 4 },
  { bln: "Apr", dilaksanakan: 8, temuan: 3, perbaikan: 3 },
  { bln: "Mei", dilaksanakan: 10, temuan: 6, perbaikan: 5 },
  { bln: "Jun", dilaksanakan: 11, temuan: 4, perbaikan: 4 },
];

const PIE_STATUS_INSPEKSI = [
  { name: "Selesai", value: 11, color: "#2E7D32" },
  { name: "Dalam Proses", value: 4, color: "#1565C0" },
  { name: "Terjadwal", value: 9, color: "#F57C00" },
  { name: "Belum Dimulai", value: 3, color: "#9E9E9E" },
];

const RADAR_WILAYAH = [
  { subject: "Ternate", A: 100, fullMark: 100 },
  { subject: "Tidore", A: 83, fullMark: 100 },
  { subject: "Halut", A: 80, fullMark: 100 },
  { subject: "Halbar", A: 75, fullMark: 100 },
  { subject: "Halsel", A: 75, fullMark: 100 },
  { subject: "Kep. Sula", A: 67, fullMark: 100 },
  { subject: "Morotai", A: 100, fullMark: 100 },
];

const TUGAS = [
  {
    id: "T001",
    judul: "Verifikasi perbaikan UD Barakati — label tidak sesuai",
    tenggat: "28 Mar 2026",
    prioritas: "Kritis",
    status: "Menunggu Verifikasi",
    lifecycle: "Diverifikasi",
  },
  {
    id: "T002",
    judul: "Pelaksanaan audit sertifikasi CV Sumber Hidup Halmahera Utara",
    tenggat: "29 Mar 2026",
    prioritas: "Kritis",
    status: "Dalam Proses",
    lifecycle: "Diajukan",
  },
  {
    id: "T003",
    judul: "Pengambilan sampel pangan Pasar Barito Tidore Kepulauan",
    tenggat: "30 Mar 2026",
    prioritas: "Tinggi",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
  {
    id: "T004",
    judul: "Input hasil pemantauan perbaikan sanitasi CV Sumber Hidup",
    tenggat: "02 Apr 2026",
    prioritas: "Tinggi",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
  {
    id: "T005",
    judul: "Koordinasi OPD — Dinas Kesehatan terkait temuan produk kadaluwarsa",
    tenggat: "05 Apr 2026",
    prioritas: "Sedang",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
  {
    id: "T006",
    judul: "Penyusunan laporan kegiatan teknis UPTD Maret 2026",
    tenggat: "07 Apr 2026",
    prioritas: "Sedang",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
];

const LAPORAN = [
  {
    judul: "Berita Acara Inspeksi Lapangan UD Barakati",
    status: "Menunggu Validasi",
    tgl: "27 Mar 2026",
    lifecycle: "Diajukan",
  },
  {
    judul: "Laporan Pengambilan Sampel Pangan Maret (Batch 2)",
    status: "Dalam Proses",
    tgl: "26 Mar 2026",
    lifecycle: "Diverifikasi",
  },
  {
    judul: "Rekap Temuan & Status Perbaikan Q1 2026",
    status: "Selesai",
    tgl: "20 Mar 2026",
    lifecycle: "Selesai",
  },
  {
    judul: "Laporan Koordinasi OPD Terkait — Feb 2026",
    status: "Selesai",
    tgl: "28 Feb 2026",
    lifecycle: "Arsip",
  },
];

const AUDIT_LOG = [
  {
    aksi: "Update status temuan TMN-2026-011 (UD Barakati) — batas perbaikan besok",
    waktu: "27 Mar 2026, 11:05",
    user: "Rizal M.",
  },
  {
    aksi: "Upload berita acara inspeksi INS-2026-031",
    waktu: "27 Mar 2026, 09:40",
    user: "Rizal M.",
  },
  {
    aksi: "Konfirmasi pengambilan sampel Morotai (3 sampel) — selesai",
    waktu: "26 Mar 2026, 15:22",
    user: "Rizal M.",
  },
  {
    aksi: "Input data chain of custody sampel Tidore Kepulauan",
    waktu: "26 Mar 2026, 13:10",
    user: "Rizal M.",
  },
  {
    aksi: "Penugasan audit ulang PT Malut Pangan Sofifi — jadwal 1 Apr 2026",
    waktu: "25 Mar 2026, 10:55",
    user: "Rizal M.",
  },
];

const NOTIFIKASI = [
  {
    id: 1,
    tipe: "kritis",
    pesan:
      "Batas perbaikan temuan UD Barakati (label tidak sesuai) jatuh BESOK 28 Mar 2026. Lakukan verifikasi lapangan segera!",
    waktu: "45 mnt lalu",
  },
  {
    id: 2,
    tipe: "kritis",
    pesan:
      "Audit sertifikasi CV Sumber Hidup Halmahera Utara sedang berlangsung — pastikan tim B melaporkan progress sebelum pukul 16.00.",
    waktu: "1 jam lalu",
  },
  {
    id: 3,
    tipe: "peringatan",
    pesan:
      "Realisasi sampling Kepulauan Sula baru 67% dari target. 1 sampel belum diambil.",
    waktu: "2 jam lalu",
  },
  {
    id: 4,
    tipe: "info",
    pesan:
      "Berita Acara Inspeksi INS-2026-031 siap divalidasi Kepala Seksi Teknis.",
    waktu: "4 jam lalu",
  },
  {
    id: 5,
    tipe: "tugas",
    pesan:
      "Koordinasi OPD Dinas Kesehatan dijadwalkan 5 April 2026 — persiapkan data temuan produk kadaluwarsa.",
    waktu: "6 jam lalu",
  },
];

const PRIORITAS_MAP = {
  Kritis: { bg: "#FFEBEE", color: "#C62828" },
  Tinggi: { bg: "#FFF3E0", color: "#E65100" },
  Sedang: { bg: "#E8F5E9", color: "#2E7D32" },
  Rendah: { bg: "#ECEFF1", color: "#546E7A" },
};

const STATUS_MAP = {
  "Dalam Proses":         { bg: "#E3F2FD", color: "#1565C0" },
  "Belum Dimulai":        { bg: "#ECEFF1", color: "#455A64" },
  "Menunggu Validasi":    { bg: "#FFF3E0", color: "#E65100" },
  "Menunggu Verifikasi":  { bg: "#FFF3E0", color: "#E65100" },
  "Terjadwal":            { bg: "#EDE7F6", color: "#4527A0" },
  "Dalam Perbaikan":      { bg: "#E3F2FD", color: "#1565C0" },
  "Belum Diperbaiki":     { bg: "#FFEBEE", color: "#C62828" },
  Selesai:                { bg: "#E8F5E9", color: "#1B5E20" },
  Draft:                  { bg: "#F5F5F5", color: "#757575" },
  Diajukan:               { bg: "#E3F2FD", color: "#0277BD" },
  Diverifikasi:           { bg: "#FFF3E0", color: "#F57C00" },
};

const LIFECYCLE_MAP = {
  Draft:       { bg: "#F5F5F5", color: "#757575" },
  Diajukan:    { bg: "#E3F2FD", color: "#0277BD" },
  Diverifikasi:{ bg: "#FFF3E0", color: "#F57C00" },
  Disetujui:   { bg: "#E8F5E9", color: "#2E7D32" },
  Selesai:     { bg: "#E8F5E9", color: "#1B5E20" },
  Arsip:       { bg: "#ECEFF1", color: "#546E7A" },
};

const JENIS_MAP = {
  "Inspeksi Lapangan":    { bg: "#E8EAF6", color: "#283593" },
  "Audit Sertifikasi":    { bg: "#E0F2F1", color: "#00695C" },
  "Audit Ulang":          { bg: "#FFF3E0", color: "#E65100" },
  "Pengambilan Sampel":   { bg: "#E3F2FD", color: "#0277BD" },
  "Monitoring Perbaikan": { bg: "#F3E5F5", color: "#6A1B9A" },
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
            background: T.indigo,
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
      id: "jadwal_inspeksi",
      label: "Jadwal Inspeksi",
      icon: <CalendarDaysIcon style={{ width: 15, height: 15 }} />,
      color: T.indigo,
    },
    {
      id: "input_sampel",
      label: "Input Sampling",
      icon: <MapPinIcon style={{ width: 15, height: 15 }} />,
      color: T.secondary,
    },
    {
      id: "catat_temuan",
      label: "Catat Temuan",
      icon: <ExclamationTriangleIcon style={{ width: 15, height: 15 }} />,
      color: T.danger,
    },
    {
      id: "verifikasi_perbaikan",
      label: "Verifikasi Perbaikan",
      icon: <CheckCircleIcon style={{ width: 15, height: 15 }} />,
      color: T.accent,
    },
    {
      id: "export_laporan",
      label: "Export Laporan",
      icon: <DocumentArrowDownIcon style={{ width: 15, height: 15 }} />,
      color: T.info,
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
    kritis:     T.danger,
    peringatan: T.accent,
    info:       T.info,
    tugas:      T.secondary,
  };
  const bgMap = {
    kritis:     "#FFEBEE",
    peringatan: "#FFF8E1",
    info:       "#E3F2FD",
    tugas:      "#E8F5E9",
  };
  const emojiMap = {
    kritis: "🔴", peringatan: "🟡", info: "🔵", tugas: "✅",
  };
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
                background: T.indigo,
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

// ─── Tab Ringkasan ─────────────────────────────────────────────────────────────
function TabRingkasan({ onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Banner Kritis */}
      <div
        style={{
          background: "#FFEBEE",
          border: "1px solid #FFCDD2",
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
            TEMUAN KRITIS — BATAS PERBAIKAN BESOK
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#B71C1C",
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            Temuan TMN-2026-011 pada UD Barakati (label tidak sesuai) wajib
            diverifikasi perbaikannya sebelum 28 Mar 2026. Koordinasi tim
            lapangan dan siapkan berita acara verifikasi.
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

      {/* Alert + Pie */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <Card>
          <SectionTitle
            title="Alert & Notifikasi"
            sub="Status inspeksi & temuan lapangan real-time"
          />
          <AlertList items={NOTIFIKASI} />
        </Card>
        <Card>
          <SectionTitle
            title="Status Inspeksi Bulan Ini"
            sub="Distribusi kegiatan berdasarkan status"
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
                  data={PIE_STATUS_INSPEKSI}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PIE_STATUS_INSPEKSI.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} kegiatan`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PIE_STATUS_INSPEKSI.map((p) => (
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
                  <span style={{ fontSize: 12, color: T.textPri }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>
                    {p.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Jadwal Inspeksi Aktif */}
      <Card>
        <SectionTitle
          title="Jadwal Inspeksi & Sampling Aktif"
          sub="Kegiatan lapangan terjadwal, dalam proses, dan menunggu tim"
        />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: T.indigo, color: "#fff" }}>
                {[
                  "ID",
                  "Lokasi / Pelaku Usaha",
                  "Komoditas",
                  "Jenis Kegiatan",
                  "Jadwal",
                  "Tim",
                  "Status",
                  "Prioritas",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
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
              {JADWAL_INSPEKSI.map((r, i) => (
                <tr
                  key={r.id}
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
                    {r.id}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{r.lokasi}</td>
                  <td style={{ padding: "10px 12px", color: T.textSec }}>
                    {r.komoditas}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge label={r.jenis} map={JENIS_MAP} />
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: T.textSec,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.jadwal}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          r.tim === "Tim A" ? "#EDE7F6" : "#E0F2F1",
                        color:
                          r.tim === "Tim A" ? "#4527A0" : "#00695C",
                        padding: "2px 9px",
                        borderRadius: 10,
                      }}
                    >
                      {r.tim}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge label={r.status} map={STATUS_MAP} />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge label={r.prioritas} map={PRIORITAS_MAP} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Temuan Aktif */}
      <Card>
        <SectionTitle
          title="Monitoring Temuan & Status Perbaikan"
          sub="Pemantauan tindak lanjut perbaikan pasca inspeksi"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TEMUAN_AKTIF.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 14px",
                background: c.tingkat === "Kritis" ? "#FFF5F5" : "#FAFBFD",
                border: `1px solid ${
                  c.tingkat === "Kritis" ? "#FFCDD2" : T.border
                }`,
                borderLeft: `4px solid ${
                  PRIORITAS_MAP[c.tingkat]?.color || T.primary
                }`,
                borderRadius: 6,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.textPri,
                  }}
                >
                  {c.pelaku}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: T.textSec,
                      marginLeft: 8,
                    }}
                  >
                    ({c.id})
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>
                  {c.jenis} · Batas perbaikan:{" "}
                  <strong style={{ color: c.sisa_hari <= 3 ? T.danger : T.textPri }}>
                    {c.batas_perbaikan}
                  </strong>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: c.sisa_hari <= 5 ? T.danger : T.textSec,
                  }}
                >
                  {c.sisa_hari} hari lagi
                </span>
                <Badge label={c.tingkat} map={PRIORITAS_MAP} />
                <Badge label={c.status} map={STATUS_MAP} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Trail */}
      <Card>
        <SectionTitle
          title="Riwayat Aktivitas (Audit Trail)"
          sub="Log aksi lapangan terakhir — dapat difilter dan diekspor"
        />
        <ActivityFeed items={AUDIT_LOG} />
      </Card>
    </div>
  );
}

// ─── Tab Inspeksi & Lapangan ─────────────────────────────────────────────────
function TabInspeksi() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Tren Inspeksi 6 Bulan */}
      <Card>
        <SectionTitle
          title="Tren Kegiatan Inspeksi (6 Bulan)"
          sub="Inspeksi dilaksanakan, temuan ditemukan, dan perbaikan selesai"
        />
        <ResponsiveContainer width="100%" height={270}>
          <LineChart
            data={TREN_INSPEKSI}
            margin={{ top: 8, right: 14, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
            <XAxis dataKey="bln" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="dilaksanakan"
              name="Inspeksi Dilaksanakan"
              stroke={T.indigo}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="temuan"
              name="Temuan"
              stroke={T.danger}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="perbaikan"
              name="Perbaikan Selesai"
              stroke={T.secondary}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Progres Sampling + Radar */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}
      >
        <Card>
          <SectionTitle
            title="Realisasi Pengambilan Sampel per Kab/Kota"
            sub="Target vs realisasi sampling bulan berjalan"
          />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={PROGRES_SAMPLING}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis
                dataKey="kabkota"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={42}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="target"
                name="Target"
                fill={T.border}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="realisasi"
                name="Realisasi"
                fill={T.indigo}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle
            title="Cakupan Wilayah Sampling (%)"
            sub="Persentase realisasi dari target per kabupaten/kota"
          />
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius={80}
              data={RADAR_WILAYAH}
            >
              <PolarGrid stroke="#DDE3ED" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: T.textSec }}
              />
              <Radar
                name="Cakupan"
                dataKey="A"
                stroke={T.indigo}
                fill={T.indigo}
                fillOpacity={0.25}
              />
              <Tooltip formatter={(v) => [`${v}%`, "Cakupan"]} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Field Utama Modul Inspeksi */}
      <Card>
        <SectionTitle
          title="Field Utama Modul Inspeksi & Sampling"
          sub="Pastikan terisi lengkap pada setiap entri kegiatan lapangan"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
            gap: 10,
          }}
        >
          {[
            "id_inspeksi",
            "lokasi_pelaku_usaha",
            "komoditas",
            "jenis_kegiatan",
            "jadwal_tanggal",
            "tim_pelaksana",
            "nomor_surat_tugas",
            "temuan",
            "tingkat_temuan",
            "batas_perbaikan",
            "status_perbaikan",
            "bukti_dokumen",
            "koordinasi_opd",
            "rekomendasi_tindak_lanjut",
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
    </div>
  );
}

// ─── Tab Tugas & Laporan ───────────────────────────────────────────────────────
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
          sub="Fokus verifikasi perbaikan, audit sertifikasi, pengambilan sampel, dan koordinasi OPD"
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
                background: filterPrioritas === f ? T.indigo : "#EEF0F5",
                color: filterPrioritas === f ? "#fff" : T.textPri,
                border: `1px solid ${
                  filterPrioritas === f ? T.indigo : T.border
                }`,
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
                border: `1px solid ${
                  t.prioritas === "Kritis" ? "#FFCDD2" : T.border
                }`,
                borderLeft: `4px solid ${
                  PRIORITAS_MAP[t.prioritas]?.color || T.indigo
                }`,
                borderRadius: 6,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.textPri,
                  }}
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
                    background: T.indigo,
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
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.textPri,
                    }}
                  >
                    {l.judul}
                  </div>
                  <div
                    style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}
                  >
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

// ─── Komponen Utama ────────────────────────────────────────────────────────────
export default function FungsionalUPTDTeknisDashboard() {
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
    fetch("/api/dashboard/fungsional-uptd-teknis/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.success && data?.data) setKpiSummary(data.data); })
      .catch(() => {});
  }, []);

  const userName =
    user?.nama || user?.name || user?.username || "Rizal M.";
  const userJabatan =
    user?.jabatan ||
    user?.position ||
    (user?.roleName === "fungsional_uptd_teknis"
      ? "Pejabat Fungsional · UPTD Teknis — Inspeksi & Pengawasan"
      : user?.roleName ||
        "Pejabat Fungsional · UPTD Teknis — Inspeksi & Pengawasan");

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
      jadwal_inspeksi:      "Membuka form penjadwalan inspeksi lapangan…",
      input_sampel:         "Membuka form input data pengambilan sampel…",
      catat_temuan:         "Membuka form pencatatan temuan baru…",
      verifikasi_perbaikan: "Membuka antarmuka verifikasi tindak lanjut perbaikan…",
      export_laporan:       "Mengekspor laporan kegiatan teknis…",
    };
    setToast(msg[id] || "Memproses…");
    setTimeout(() => setToast(null), 2800);
  };

  const TABS = [
    { id: "ringkasan",  label: "Ringkasan" },
    { id: "inspeksi",   label: "Inspeksi & Lapangan" },
    { id: "tugas",      label: "Tugas & Laporan" },
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
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 9999,
            background: T.indigo,
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
          background: `linear-gradient(135deg, ${T.indigo} 0%, #1A237E 100%)`,
          color: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>

          {/* Baris judul */}
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
                🔍
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
                  Dashboard Fungsional UPTD Teknis — Inspeksi & Pengawasan
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

          {/* Baris user info */}
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
                {TEMUAN_AKTIF.length} Temuan Aktif
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#EDE7F6",
                  color: "#4527A0",
                  padding: "3px 10px",
                  borderRadius: 10,
                }}
              >
                {JADWAL_INSPEKSI.length} Inspeksi Terjadwal
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

          {/* Tab navigasi */}
          <div style={{ display: "flex", gap: 3, paddingTop: 5 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "#fff" : "transparent",
                  color:
                    tab === t.id ? T.indigo : "rgba(255,255,255,0.78)",
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
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "20px 24px 48px",
        }}
      >
        {tab === "ringkasan" && <TabRingkasan onAction={handleAction} />}
        {tab === "inspeksi"  && <TabInspeksi />}
        {tab === "tugas"     && (
          <TabTugas
            filterPrioritas={filterP}
            setFilterPrioritas={setFilterP}
          />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          background: "#0D1333",
          color: "rgba(255,255,255,0.45)",
          textAlign: "center",
          padding: "11px 24px",
          fontSize: 11,
          letterSpacing: "0.3px",
        }}
      >
        SIGAP-MALUT © 2026 · Dinas Pangan Provinsi Maluku Utara · UPTD
        Teknis — Inspeksi & Pengawasan · v1.0.0
      </div>
    </div>
  );
}