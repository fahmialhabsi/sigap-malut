// frontend/src/pages/dashboard/fungsional-distribusi.jsx
// Role: PEJABAT_FUNGSIONAL | Bidang Distribusi Pangan
// Akses: Read ✅ | Update (milik sendiri) ✅ | Verify ✅ | Create ❌ | Delete ❌ | Finalize ❌
// Template: 05-template-standar-dashboard.md | Role Matrix: 09-matriks-role-akses-modul.md

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
  TruckIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

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

// ─── Data Distribusi ────────────────────────────────────────────────────────
const KPI_DATA = [
  {
    id: "k1",
    label: "Lead Time Distribusi",
    value: 2.4,
    unit: "hari",
    trend: -0.3,
    sub: "rata-rata SLA Ternate → kab/kota",
    good: true,
  },
  {
    id: "k2",
    label: "Pengiriman Terealisasi",
    value: 18,
    unit: "rit",
    trend: 1.0,
    sub: "dari 20 rit minggu ini",
    good: true,
  },
  {
    id: "k3",
    label: "Rute Terkendala",
    value: 2,
    unit: "rute",
    trend: 0,
    sub: "cuaca & docking kapal",
    good: null,
  },
  {
    id: "k4",
    label: "Ketersediaan Armada",
    value: 92,
    unit: "%",
    trend: -1.1,
    sub: "armada siap operasi",
    good: true,
  },
  {
    id: "k5",
    label: "BAPB Valid",
    value: 15,
    unit: "dok",
    trend: 3.0,
    sub: "terunggah diverifikasi",
    good: true,
  },
  {
    id: "k6",
    label: "Isu Aktif",
    value: 3,
    unit: "isu",
    trend: 0,
    sub: "penundaan/kerusakan",
    good: null,
  },
];

const KOMODITAS_DISTRIBUSI = [
  { name: "Beras", volume: 180, tujuan: 6, risiko: "Sedang" },
  { name: "Jagung", volume: 120, tujuan: 5, risiko: "Rendah" },
  { name: "Gula Pasir", volume: 95, tujuan: 4, risiko: "Sedang" },
  { name: "Minyak Goreng", volume: 110, tujuan: 5, risiko: "Rendah" },
  { name: "Telur", volume: 70, tujuan: 3, risiko: "Tinggi" },
];

const RUTE_KRITIS = [
  {
    rute: "Ternate → Pulau Taliabu",
    status: "Tertunda",
    alasan: "Cuaca",
    estimasi: "48 jam",
  },
  {
    rute: "Ternate → Kepulauan Sula",
    status: "Tertunda",
    alasan: "Kapal docking",
    estimasi: "36 jam",
  },
  {
    rute: "Ternate → Morotai",
    status: "On Track",
    alasan: "-",
    estimasi: "On schedule",
  },
];

const TREN_PENGIRIMAN = [
  { bln: "Jan", rit: 14, tepatWaktu: 12, terlambat: 2 },
  { bln: "Feb", rit: 16, tepatWaktu: 14, terlambat: 2 },
  { bln: "Mar", rit: 18, tepatWaktu: 16, terlambat: 2 },
  { bln: "Apr", rit: 19, tepatWaktu: 17, terlambat: 2 },
  { bln: "Mei", rit: 17, tepatWaktu: 15, terlambat: 2 },
  { bln: "Jun", rit: 20, tepatWaktu: 18, terlambat: 2 },
];

const PIE_STATUS = [
  { name: "On Track", value: 18, color: "#2E7D32" },
  { name: "Tertunda", value: 3, color: "#F57C00" },
  { name: "Dialihkan", value: 1, color: "#0277BD" },
];

const ARMADA = [
  {
    id: "TRK-01",
    jenis: "Truk Box",
    kondisi: "Siap",
    lokasi: "Ternate",
    kapasitas: "8 ton",
  },
  {
    id: "TRK-02",
    jenis: "Truk Wingbox",
    kondisi: "Maintenance",
    lokasi: "Ternate",
    kapasitas: "12 ton",
  },
  {
    id: "KS-03",
    jenis: "Kapal Kayu",
    kondisi: "Siap",
    lokasi: "Bastiong",
    kapasitas: "25 ton",
  },
  {
    id: "KS-04",
    jenis: "Kapal Kayu",
    kondisi: "Siap",
    lokasi: "Bastiong",
    kapasitas: "18 ton",
  },
];

const TUGAS = [
  {
    id: "T001",
    judul: "Koordinasi muat beras ke Pulau Taliabu",
    tenggat: "28 Mar 2026",
    prioritas: "Kritis",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
  {
    id: "T002",
    judul: "Validasi BAPB gula ke Halmahera Utara",
    tenggat: "30 Mar 2026",
    prioritas: "Tinggi",
    status: "Menunggu Validasi",
    lifecycle: "Diajukan",
  },
  {
    id: "T003",
    judul: "Update stok transit gudang Ternate",
    tenggat: "27 Mar 2026",
    prioritas: "Sedang",
    status: "Belum Dimulai",
    lifecycle: "Draft",
  },
  {
    id: "T004",
    judul: "Re-route telur ke Morotai via Ternate",
    tenggat: "02 Apr 2026",
    prioritas: "Sedang",
    status: "Dalam Proses",
    lifecycle: "Diverifikasi",
  },
];

const LAPORAN = [
  {
    judul: "BAPB Beras Pulau Taliabu",
    status: "Menunggu Validasi",
    tgl: "27 Mar 2026",
    lifecycle: "Diajukan",
  },
  {
    judul: "Logbook Ritase Minggu IV Maret",
    status: "Selesai",
    tgl: "26 Mar 2026",
    lifecycle: "Selesai",
  },
  {
    judul: "Rekap Rute Tertunda Q1 2026",
    status: "Dalam Proses",
    tgl: "25 Mar 2026",
    lifecycle: "Diverifikasi",
  },
];

const AUDIT_LOG = [
  {
    aksi: "Update status rute Ternate → Taliabu (tertunda)",
    waktu: "27 Mar 2026, 09:14",
    user: "Rudi P.",
  },
  {
    aksi: "Upload BAPB gula ke Halmahera Utara",
    waktu: "27 Mar 2026, 08:50",
    user: "Rudi P.",
  },
  {
    aksi: "Validasi ritase telur ke Morotai",
    waktu: "26 Mar 2026, 16:05",
    user: "Rudi P.",
  },
  {
    aksi: "Export logbook ritase mingguan",
    waktu: "26 Mar 2026, 11:18",
    user: "Rudi P.",
  },
];

const NOTIFIKASI = [
  {
    id: 1,
    tipe: "kritis",
    pesan:
      "Rute Ternate → Taliabu tertunda 48 jam akibat cuaca. Koordinasi ulang jadwal!",
    waktu: "10 mnt lalu",
  },
  {
    id: 2,
    tipe: "peringatan",
    pesan: "Armada TRK-02 masih maintenance, sesuaikan alokasi ritase.",
    waktu: "1 jam lalu",
  },
  {
    id: 3,
    tipe: "info",
    pesan: "BAPB gula ke Halmahera Utara siap divalidasi Kabid.",
    waktu: "3 jam lalu",
  },
  {
    id: 4,
    tipe: "tugas",
    pesan: "Reroute telur ke Morotai perlu konfirmasi penyedia kapal.",
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

// ─── Sub-komponen ───────────────────────────────────────────────────────────
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
      id: "upload",
      label: "Upload BAPB",
      icon: <ArrowUpTrayIcon style={{ width: 15, height: 15 }} />,
      color: T.primary,
    },
    {
      id: "reroute",
      label: "Reroute",
      icon: <MapPinIcon style={{ width: 15, height: 15 }} />,
      color: T.secondary,
    },
    {
      id: "export",
      label: "Export Logbook",
      icon: <DocumentArrowDownIcon style={{ width: 15, height: 15 }} />,
      color: T.info,
    },
    {
      id: "verify",
      label: "Verifikasi BAPB",
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

// ─── Tab Ringkasan ──────────────────────────────────────────────────────────
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
            RUTE KRITIS — TINDAKAN SEGERA
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#B71C1C",
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            Rute Ternate → Pulau Taliabu tertunda karena cuaca. Prioritaskan
            beras & gula, koordinasi ulang jadwal kapal dan siapkan opsi reroute
            jika perlu.
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

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 16 }}
      >
        <Card>
          <SectionTitle
            title="Alert & Notifikasi"
            sub="Pembaruan distribusi real-time"
          />
          <AlertList items={NOTIFIKASI} />
        </Card>
        <Card>
          <SectionTitle
            title="Volume Distribusi per Komoditas"
            sub="Minggu berjalan"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={KOMODITAS_DISTRIBUSI}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit=" ton" />
              <Tooltip
                formatter={(v, n) => [
                  `${v} ton`,
                  n === "volume" ? "Volume" : n,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="volume"
                name="Volume (ton)"
                fill={T.primary}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="tujuan"
                name="Kab/Kota Tujuan"
                fill={T.accent}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <SectionTitle
          title="Rute Terkendala"
          sub="Prioritas penanganan lapangan"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {RUTE_KRITIS.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 13px",
                background: "#FAFBFD",
                border: `1px solid ${T.border}`,
                borderLeft: `4px solid ${T.danger}`,
                borderRadius: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.rute}</div>
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                  Alasan: {r.alasan} · Estimasi: {r.estimasi}
                </div>
              </div>
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
                {r.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Armada" sub="Kesiapan & lokasi" />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: T.primary, color: "#fff" }}>
                {["ID", "Jenis", "Kondisi", "Lokasi", "Kapasitas"].map((h) => (
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
              {ARMADA.map((a, i) => (
                <tr
                  key={a.id}
                  style={{
                    background: i % 2 === 0 ? "#FAFBFD" : "#fff",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                    {a.id}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{a.jenis}</td>
                  <td style={{ padding: "10px 12px" }}>{a.kondisi}</td>
                  <td style={{ padding: "10px 12px" }}>{a.lokasi}</td>
                  <td style={{ padding: "10px 12px" }}>{a.kapasitas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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

// ─── Tab Distribusi ─────────────────────────────────────────────────────────
function TabDistribusi() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <SectionTitle
          title="Log Ritase & Ketepatan Waktu"
          sub="SLA distribusi antar kabupaten/kota"
        />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={TREN_PENGIRIMAN}
            margin={{ top: 8, right: 14, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
            <XAxis dataKey="bln" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="rit"
              name="Ritase"
              stroke={T.primary}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="tepatWaktu"
              name="Tepat Waktu"
              stroke={T.secondary}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="terlambat"
              name="Terlambat"
              stroke={T.accent}
              strokeWidth={2.3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <SectionTitle
          title="Field Penting (Distribusi)"
          sub="Pastikan terisi pada modul logistik"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
          }}
        >
          {[
            "komoditas",
            "volume_ton",
            "asal",
            "tujuan",
            "jadwal_keberangkatan",
            "armada",
            "nakhoda_supir",
            "status_rute",
            "bapb",
            "kondisi_barang",
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

// ─── Tab Tugas & Laporan ────────────────────────────────────────────────────
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
          sub="Fokus verifikasi BAPB, ritase, dan koordinasi rute"
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
export default function FungsionalDistribusiDashboard() {
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
    fetch("/api/dashboard/fungsional-distribusi/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.success && data?.data) setKpiSummary(data.data); })
      .catch(() => {});
  }, []);

  const userName = user?.nama || user?.name || user?.username || "Rudi P.";
  const userJabatan =
    user?.jabatan ||
    user?.position ||
    (user?.roleName === "fungsional_distribusi"
      ? "Pejabat Fungsional · Bidang Distribusi Pangan"
      : user?.roleName || "Pejabat Fungsional · Bidang Distribusi Pangan");

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
      upload: "Mengunggah BAPB / bukti muat…",
      reroute: "Membuka form reroute rute kritis…",
      export: "Mengekspor logbook ritase…",
      verify: "Membuka antarmuka verifikasi BAPB…",
    };
    setToast(msg[id] || "Memproses…");
    setTimeout(() => setToast(null), 2800);
  };

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "distribusi", label: "Distribusi & Rute" },
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
                🚚
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
                  Dashboard Fungsional Distribusi Pangan
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
                1 Rute Kritis
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
        {tab === "distribusi" && <TabDistribusi />}
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
        Distribusi Pangan · v1.0.0
      </div>
    </div>
  );
}
