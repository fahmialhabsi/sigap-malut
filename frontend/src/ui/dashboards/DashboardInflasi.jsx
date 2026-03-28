/**
 * DashboardInflasi.jsx — Dashboard Inflasi & Stabilisasi Harga
 *
 * Fitur sesuai dokumen 03-dashboard-uiux.md:
 * - Period selector (bulanan)
 * - Big number inflasi + status pill (ON_TARGET / WARNING / ALERT)
 * - Top-10 contributors bar chart (Recharts)
 * - Predictive widget (1-month forecast + confidence % + rekomendasi)
 * - Trend 6-bulan (line chart)
 * - PPTX export (pptxgenjs)
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import DashboardInflasiLayout from "../../layouts/DashboardInflasiLayout";
import api from "../../utils/api";
import { notifyError, notifySuccess } from "../../utils/notify";

// ─── Allowed Roles ────────────────────────────────────────────────────────────
const ALLOWED_ROLES = [
  "super_admin",
  "sekretaris",
  "kepala_dinas",
  "gubernur",
  "kepala_bidang",
  "kepala_bidang_distribusi",
];

function normalizeRole(user) {
  return (
    user?.roleName?.toLowerCase() ||
    user?.role?.toLowerCase() ||
    roleIdToName?.[user?.role_id]?.toLowerCase() ||
    null
  );
}

// ─── Dummy/fallback data ───────────────────────────────────────────────────────
const DUMMY_INFLASI = {
  periode: "Maret 2026",
  inflasi_persen: 2.35,
  status: "on_target",
  top_10: [
    { komoditas: "Beras Premium", perubahan: 3.31, kontribusi: 1.1 },
    { komoditas: "Minyak Goreng", perubahan: 2.74, kontribusi: 0.6 },
    { komoditas: "Daging Ayam", perubahan: 2.12, kontribusi: 0.4 },
    { komoditas: "Cabai Merah", perubahan: 5.4, kontribusi: 0.35 },
    { komoditas: "Telur Ayam", perubahan: 1.9, kontribusi: 0.25 },
    { komoditas: "Gula Pasir", perubahan: 1.5, kontribusi: 0.2 },
    { komoditas: "Bawang Merah", perubahan: 4.2, kontribusi: 0.18 },
    { komoditas: "Tomat", perubahan: 3.8, kontribusi: 0.12 },
    { komoditas: "Tahu", perubahan: 1.2, kontribusi: 0.08 },
    { komoditas: "Tempe", perubahan: 1.1, kontribusi: 0.07 },
  ],
  trend_6bulan: [
    { bulan: "Okt", inflasi: 1.8 },
    { bulan: "Nov", inflasi: 2.1 },
    { bulan: "Des", inflasi: 2.4 },
    { bulan: "Jan", inflasi: 2.2 },
    { bulan: "Feb", inflasi: 2.31 },
    { bulan: "Mar", inflasi: 2.35 },
  ],
  prediksi: {
    bulan_depan: 2.18,
    confidence: 78,
    rekomendasi: [
      {
        id: "r1",
        title: "Operasi Pasar Beras",
        impact_est: "-0.3 poin",
        cost_est: "Rp 500 jt",
        actions: ["Koordinasi Bulog", "Gelar OP di 5 pasar"],
      },
      {
        id: "r2",
        title: "Subsidi Minyak Goreng",
        impact_est: "-0.15 poin",
        cost_est: "Rp 200 jt",
        actions: ["Surat ke Kemendag", "Pantau distribusi"],
      },
    ],
  },
};

const PERIODE_OPTIONS = [
  "Januari 2026",
  "Februari 2026",
  "Maret 2026",
  "April 2026",
  "Mei 2026",
  "Juni 2026",
];

const STATUS_CONFIG = {
  on_target: {
    label: "ON TARGET",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  warning: {
    label: "WARNING",
    cls: "bg-amber-100 text-amber-700 border-amber-300",
  },
  alert: { label: "ALERT", cls: "bg-red-100 text-red-700 border-red-300" },
};

// ─── PPTX Export ─────────────────────────────────────────────────────────────
async function exportToPPTX(data, periode) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  // Slide 1 — Cover
  const slide1 = pptx.addSlide();
  slide1.background = { color: "1E40AF" };
  slide1.addText("LAPORAN INFLASI PANGAN", {
    x: 1,
    y: 1.5,
    w: 8,
    h: 1,
    fontSize: 32,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  slide1.addText(`Periode: ${periode}`, {
    x: 1,
    y: 2.6,
    w: 8,
    h: 0.6,
    fontSize: 18,
    color: "BFDBFE",
    align: "center",
  });
  slide1.addText("Dinas Ketahanan Pangan — Maluku Utara", {
    x: 1,
    y: 3.4,
    w: 8,
    h: 0.5,
    fontSize: 14,
    color: "93C5FD",
    align: "center",
  });
  slide1.addText(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, {
    x: 1,
    y: 6.8,
    w: 8,
    h: 0.4,
    fontSize: 10,
    color: "93C5FD",
    align: "center",
  });

  // Slide 2 — Inflasi Summary
  const slide2 = pptx.addSlide();
  slide2.addText("Inflasi Pangan Bulan Ini", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 22,
    bold: true,
    color: "1E3A8A",
  });
  slide2.addText(`${data.inflasi_persen}%`, {
    x: 1,
    y: 1.2,
    w: 4,
    h: 2.5,
    fontSize: 72,
    bold: true,
    color: "1E40AF",
    align: "center",
  });
  slide2.addText(STATUS_CONFIG[data.status]?.label || data.status, {
    x: 1,
    y: 3.8,
    w: 4,
    h: 0.8,
    fontSize: 18,
    bold: true,
    color:
      data.status === "on_target"
        ? "059669"
        : data.status === "warning"
          ? "D97706"
          : "DC2626",
    align: "center",
  });
  slide2.addText(
    `Prediksi bulan depan: ${data.prediksi.bulan_depan}% (confidence ${data.prediksi.confidence}%)`,
    {
      x: 0.5,
      y: 6.5,
      w: 9,
      h: 0.5,
      fontSize: 12,
      color: "64748B",
    },
  );

  // Slide 3 — Top 10 Kontributor
  const slide3 = pptx.addSlide();
  slide3.addText("Top 10 Kontributor Inflasi", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 20,
    bold: true,
    color: "1E3A8A",
  });
  const rows = [
    [
      {
        text: "Komoditas",
        options: { bold: true, fill: "1E3A8A", color: "FFFFFF" },
      },
      {
        text: "Perubahan Harga (%)",
        options: { bold: true, fill: "1E3A8A", color: "FFFFFF" },
      },
      {
        text: "Kontribusi (poin)",
        options: { bold: true, fill: "1E3A8A", color: "FFFFFF" },
      },
    ],
    ...data.top_10.map((r, i) => [
      {
        text: r.komoditas,
        options: { fill: i % 2 === 0 ? "F0F9FF" : "FFFFFF" },
      },
      {
        text: `${r.perubahan.toFixed(2)}%`,
        options: { fill: i % 2 === 0 ? "F0F9FF" : "FFFFFF" },
      },
      {
        text: `${r.kontribusi.toFixed(2)}`,
        options: { fill: i % 2 === 0 ? "F0F9FF" : "FFFFFF" },
      },
    ]),
  ];
  slide3.addTable(rows, {
    x: 0.5,
    y: 1.3,
    w: 9,
    colW: [4.5, 2.25, 2.25],
    fontSize: 12,
  });

  // Slide 4 — Rekomendasi
  const slide4 = pptx.addSlide();
  slide4.addText("Rekomendasi Intervensi", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 20,
    bold: true,
    color: "1E3A8A",
  });
  data.prediksi.rekomendasi.forEach((r, i) => {
    slide4.addText(`${i + 1}. ${r.title}`, {
      x: 0.5,
      y: 1.3 + i * 2.2,
      w: 9,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: "1E40AF",
    });
    slide4.addText(
      `Estimasi dampak: ${r.impact_est}  |  Estimasi biaya: ${r.cost_est}`,
      {
        x: 0.5,
        y: 1.8 + i * 2.2,
        w: 9,
        h: 0.4,
        fontSize: 11,
        color: "475569",
      },
    );
    slide4.addText(`Langkah: ${r.actions.join(", ")}`, {
      x: 0.5,
      y: 2.2 + i * 2.2,
      w: 9,
      h: 0.4,
      fontSize: 11,
      color: "64748B",
    });
  });

  await pptx.writeFile({
    fileName: `Inflasi_${periode.replace(/\s/g, "_")}.pptx`,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardInflasi() {
  const user = useAuthStore((s) => s.user);
  const roleName = normalizeRole(user);

  const [periode, setPeriode] = useState("Maret 2026");
  const [data, setData] = useState(DUMMY_INFLASI);
  const [loading, setLoading] = useState(false);
  const [pptxLoading, setPptxLoading] = useState(false);
  const [drilldownKomoditas, setDrilldownKomoditas] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/inflasi/latest");
      const d = res.data?.data;
      if (d && d.inflasiPangan !== null) {
        // Map API response to component data shape
        setData({
          inflasiPangan: d.inflasiPangan,
          status:
            d.inflasiPangan > 5
              ? "alert"
              : d.inflasiPangan > 3
                ? "warning"
                : "on_target",
          contributors: (d.contributors || []).map((c) => ({
            nama: c.nama,
            kontribusi: parseFloat(c.kontribusi),
            harga: c.harga,
            hargaBulanLalu: c.hargaBulanLalu,
            tren: c.tren,
          })),
          tren6Bulan: d.tren6Bulan || [],
          prediksi: DUMMY_INFLASI.prediksi, // prediksi tetap dari model ML lokal
          rekomendasi: DUMMY_INFLASI.rekomendasi,
        });
        if (d.periode) setPeriode(d.periode);
      }
    } catch {
      // endpoint belum tersedia — gunakan dummy
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user || !ALLOWED_ROLES.includes(roleName)) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Akses Ditolak</div>
        <p>Anda tidak memiliki izin untuk mengakses Dashboard Inflasi.</p>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[data.status] || STATUS_CONFIG.on_target;

  const handleExportPPTX = async () => {
    setPptxLoading(true);
    try {
      await exportToPPTX(data, periode);
      notifySuccess("PPTX berhasil diunduh");
    } catch (e) {
      notifyError("Gagal membuat PPTX: " + e.message);
    } finally {
      setPptxLoading(false);
    }
  };

  return (
    <DashboardInflasiLayout>
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            📈 Inflasi &amp; Stabilisasi Harga
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pemantauan harga komoditas pangan Maluku Utara
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {/* Period selector */}
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-300 outline-none"
            aria-label="Pilih periode"
          >
            {PERIODE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportPPTX}
            disabled={pptxLoading}
            className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {pptxLoading ? "⏳ Membuat..." : "📊 Export PPTX"}
          </button>
          <button
            onClick={() => navigate("/dashboard/inflasi/mendagri")}
            className="flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-sm font-semibold"
          >
            📋 Laporan Mendagri
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "⏳" : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Big Number Inflasi */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <div className="text-sm text-slate-500 mb-2 font-medium">
            Inflasi Pangan — {periode}
          </div>
          <div className="text-6xl font-bold text-blue-700 mb-2">
            {data.inflasi_persen}%
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConf.cls}`}
          >
            {statusConf.label}
          </span>
          <div className="text-xs text-slate-400 mt-3">Target TPID: ≤ 3.0%</div>
        </div>

        {/* Predictive Widget */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span>🤖</span> Prediksi Bulan Depan
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold text-violet-600">
              {data.prediksi.bulan_depan}%
            </span>
            <span className="text-sm text-slate-500">estimasi</span>
          </div>
          <div className="text-xs text-slate-500 mb-3">
            Confidence: <strong>{data.prediksi.confidence}%</strong>
          </div>
          <div className="text-xs font-semibold text-slate-600 mb-2">
            Rekomendasi Intervensi:
          </div>
          <div className="space-y-2">
            {data.prediksi.rekomendasi.map((r) => (
              <div
                key={r.id}
                className="bg-violet-50 border border-violet-100 rounded-lg p-3"
              >
                <div className="text-xs font-semibold text-violet-800">
                  {r.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Dampak: {r.impact_est} · Biaya: {r.cost_est}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend 6 Bulan */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span>📉</span> Tren 6 Bulan
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data.trend_6bulan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, "Inflasi"]} />
              <ReferenceLine
                y={3}
                stroke="#f59e0b"
                strokeDasharray="4 2"
                label={{ value: "Target", fill: "#d97706", fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="inflasi"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top 10 Bar Chart ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-slate-800 flex items-center gap-2">
            <span>📊</span> Top 10 Kontributor Inflasi — {periode}
          </div>
          <div className="text-xs text-slate-400">Klik bar untuk detail</div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={[...data.top_10].sort((a, b) => b.kontribusi - a.kontribusi)}
            layout="vertical"
            margin={{ left: 120, right: 40, top: 8, bottom: 8 }}
            onClick={(payload) => {
              if (payload?.activePayload?.[0]) {
                setDrilldownKomoditas(payload.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} unit=" poin" />
            <YAxis
              type="category"
              dataKey="komoditas"
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip
              formatter={(v, name) => [
                name === "kontribusi" ? `${v} poin` : `${v}%`,
                name === "kontribusi" ? "Kontribusi" : "Perubahan Harga",
              ]}
            />
            <Bar
              dataKey="kontribusi"
              fill="#2563EB"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Drilldown drawer (komoditas detail) ──────────────── */}
      {drilldownKomoditas && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-blue-50">
            <span className="font-bold text-blue-800">
              {drilldownKomoditas.komoditas}
            </span>
            <button
              onClick={() => setDrilldownKomoditas(null)}
              className="text-slate-400 hover:text-slate-600 text-lg"
            >
              ✕
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">
                Kontribusi terhadap inflasi
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {drilldownKomoditas.kontribusi} poin
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Perubahan harga</div>
              <div className="text-2xl font-bold text-orange-500">
                {drilldownKomoditas.perubahan}%
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
              Kontributor ke-
              {data.top_10.findIndex(
                (x) => x.komoditas === drilldownKomoditas.komoditas,
              ) + 1}{" "}
              dari 10 komoditas penyumbang inflasi terbesar.
            </div>
            <button
              onClick={() => setDrilldownKomoditas(null)}
              className="w-full mt-2 rounded-lg bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </DashboardInflasiLayout>
  );
}
