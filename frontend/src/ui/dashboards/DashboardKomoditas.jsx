import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import DashboardKomoditasLayout from "../../layouts/DashboardKomoditasLayout";
import api from "../../utils/api";
import useAuthStore from "../../stores/authStore";
import { notifySuccess, notifyWarning } from "../../utils/notify";

const ALLOWED_ROLES = [
  "super_admin",
  "sekretaris",
  "kepala_dinas",
  "gubernur",
  "kepala_bidang",
  "kepala_bidang_distribusi",
  "analis_pangan",
];
const roleIdToName = { 1: "super_admin", 2: "kepala_dinas", 3: "sekretaris" };

function normalizeRole(user) {
  return (
    user?.roleName?.toLowerCase() ||
    user?.role?.toLowerCase() ||
    roleIdToName?.[user?.role_id]?.toLowerCase() ||
    null
  );
}

function AccessDenied() {
  return (
    <DashboardKomoditasLayout>
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <div className="text-5xl mb-3">🔒</div>
        <div className="font-semibold text-lg">Akses Ditolak</div>
        <div className="text-sm mt-1">
          Anda tidak memiliki izin melihat halaman ini.
        </div>
      </div>
    </DashboardKomoditasLayout>
  );
}

// ── HEAT LEVEL CONFIG ─────────────────────────────────────────────────────────
const HEAT_LEVELS = [
  {
    label: "Aman",
    range: [80, 100],
    color: "#10b981",
    textColor: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  {
    label: "Cukup",
    range: [50, 79],
    color: "#f59e0b",
    textColor: "text-amber-700",
    bg: "bg-amber-100",
  },
  {
    label: "Kritis",
    range: [20, 49],
    color: "#f97316",
    textColor: "text-orange-700",
    bg: "bg-orange-100",
  },
  {
    label: "Darurat",
    range: [0, 19],
    color: "#ef4444",
    textColor: "text-red-700",
    bg: "bg-red-100",
  },
];

function getHeatLevel(pct) {
  return (
    HEAT_LEVELS.find((h) => pct >= h.range[0] && pct <= h.range[1]) ||
    HEAT_LEVELS[0]
  );
}

// ── PASAR BREAKDOWN DRAWER ────────────────────────────────────────────────────
function PasarBreakdown({ komoditas, onClose }) {
  if (!komoditas) return null;
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-teal-50">
        <div>
          <div className="font-bold text-slate-800">{komoditas.nama}</div>
          <div className="text-xs text-slate-500">Detail Per Pasar</div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-xl"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Stok Per Lokasi
        </div>
        {komoditas.pasar.map((p) => {
          const level = getHeatLevel(p.stokPct);
          return (
            <div key={p.nama} className={`rounded-xl border p-3 ${level.bg}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-sm text-slate-700">
                  {p.nama}
                </div>
                <span className={`text-xs font-bold ${level.textColor}`}>
                  {level.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${p.stokPct}%`,
                      backgroundColor: level.color,
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-600 w-10 text-right">
                  {p.stokPct}%
                </span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Stok: {p.stokTon}T</span>
                <span>Harga: Rp {p.harga.toLocaleString("id-ID")}/kg</span>
              </div>
            </div>
          );
        })}
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">
          Trend Harga 6 Bulan
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart
            data={komoditas.trendHarga}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="bulan" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => `Rp ${v.toLocaleString("id-ID")}`} />
            <Line
              type="monotone"
              dataKey="harga"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => {
              notifySuccess("Permintaan uji UPTD dikirim");
              onClose();
            }}
            className="w-full py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition"
          >
            🔬 Request Uji UPTD
          </button>
          <button
            onClick={() => {
              notifySuccess("Perintah distribusi dibuat");
              onClose();
            }}
            className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
          >
            🚚 Buat Perintah Distribusi
          </button>
          <button
            onClick={() => {
              notifySuccess("Komoditas ditandai terverifikasi");
              onClose();
            }}
            className="w-full py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition"
          >
            ✅ Tandai Verified
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EARLY WARNING CARD ────────────────────────────────────────────────────────
function EarlyWarningCard({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;
  const severityColor = {
    HIGH: "border-red-400 bg-red-50",
    MEDIUM: "border-amber-400 bg-amber-50",
    LOW: "border-blue-300 bg-blue-50",
  };
  const severityIcon = { HIGH: "🚨", MEDIUM: "⚠️", LOW: "ℹ️" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚠️</span>
        <span className="font-semibold text-slate-700">
          Early Warning — Ambang Stok/Harga
        </span>
        <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
          {alerts.length} Alert
        </span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`rounded-xl border p-3 ${severityColor[alert.severity] || severityColor.LOW}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg mt-0.5">
                {severityIcon[alert.severity]}
              </span>
              <div className="flex-1">
                <div className="font-medium text-sm text-slate-800">
                  {alert.komoditas} — {alert.lokasi}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {alert.pesan}
                </div>
                <div className="text-xs text-teal-700 font-medium mt-1">
                  💡 {alert.rekomendasi}
                </div>
              </div>
              <button
                onClick={() => onDismiss(i)}
                className="text-slate-300 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DUMMY DATA ────────────────────────────────────────────────────────────────
const DUMMY_KOMODITAS = [
  {
    id: 1,
    nama: "Beras",
    satuan: "ton",
    kategori: "Pokok",
    stokTotal: 2840,
    stokPct: 74,
    hargaRata: 14_500,
    pasar: [
      {
        nama: "Pasar Barito Ternate",
        stokPct: 82,
        stokTon: 640,
        harga: 14_000,
      },
      { nama: "Pasar Gamalama", stokPct: 68, stokTon: 420, harga: 14_500 },
      { nama: "Pasar Tidore", stokPct: 55, stokTon: 380, harga: 15_200 },
      { nama: "Pasar Sofifi", stokPct: 71, stokTon: 510, harga: 14_800 },
    ],
    trendHarga: [
      { bulan: "Feb", harga: 13_800 },
      { bulan: "Mar", harga: 14_000 },
      { bulan: "Apr", harga: 14_200 },
      { bulan: "Mei", harga: 14_200 },
      { bulan: "Jun", harga: 14_500 },
      { bulan: "Jul", harga: 14_500 },
    ],
    koordinat: [-0.79, 127.39],
  },
  {
    id: 2,
    nama: "Minyak Goreng",
    satuan: "liter",
    kategori: "Pokok",
    stokTotal: 42_500,
    stokPct: 38,
    hargaRata: 18_700,
    pasar: [
      {
        nama: "Pasar Barito Ternate",
        stokPct: 30,
        stokTon: 8_200,
        harga: 18_500,
      },
      { nama: "Pasar Gamalama", stokPct: 42, stokTon: 11_000, harga: 18_800 },
      { nama: "Pasar Tidore", stokPct: 48, stokTon: 9_800, harga: 19_000 },
      { nama: "Pasar Sofifi", stokPct: 28, stokTon: 7_500, harga: 18_600 },
    ],
    trendHarga: [
      { bulan: "Feb", harga: 17_000 },
      { bulan: "Mar", harga: 17_500 },
      { bulan: "Apr", harga: 18_000 },
      { bulan: "Mei", harga: 18_500 },
      { bulan: "Jun", harga: 18_700 },
      { bulan: "Jul", harga: 18_700 },
    ],
    koordinat: [-0.82, 127.41],
  },
  {
    id: 3,
    nama: "Gula Pasir",
    satuan: "kg",
    kategori: "Pokok",
    stokTotal: 18_900,
    stokPct: 15,
    hargaRata: 17_200,
    pasar: [
      {
        nama: "Pasar Barito Ternate",
        stokPct: 12,
        stokTon: 3_800,
        harga: 17_000,
      },
      { nama: "Pasar Gamalama", stokPct: 18, stokTon: 5_200, harga: 17_200 },
      { nama: "Pasar Tidore", stokPct: 15, stokTon: 4_100, harga: 17_500 },
      { nama: "Pasar Sofifi", stokPct: 16, stokTon: 4_800, harga: 17_200 },
    ],
    trendHarga: [
      { bulan: "Feb", harga: 15_500 },
      { bulan: "Mar", harga: 16_000 },
      { bulan: "Apr", harga: 16_500 },
      { bulan: "Mei", harga: 16_800 },
      { bulan: "Jun", harga: 17_000 },
      { bulan: "Jul", harga: 17_200 },
    ],
    koordinat: [-0.76, 127.44],
  },
  {
    id: 4,
    nama: "Telur Ayam",
    satuan: "butir",
    kategori: "Protein",
    stokTotal: 125_000,
    stokPct: 62,
    hargaRata: 2_200,
    pasar: [
      {
        nama: "Pasar Barito Ternate",
        stokPct: 71,
        stokTon: 38_000,
        harga: 2_100,
      },
      { nama: "Pasar Gamalama", stokPct: 65, stokTon: 32_000, harga: 2_200 },
      { nama: "Pasar Tidore", stokPct: 55, stokTon: 28_000, harga: 2_300 },
      { nama: "Pasar Sofifi", stokPct: 60, stokTon: 27_000, harga: 2_200 },
    ],
    trendHarga: [
      { bulan: "Feb", harga: 2_000 },
      { bulan: "Mar", harga: 2_050 },
      { bulan: "Apr", harga: 2_100 },
      { bulan: "Mei", harga: 2_150 },
      { bulan: "Jun", harga: 2_200 },
      { bulan: "Jul", harga: 2_200 },
    ],
    koordinat: [-0.85, 127.36],
  },
  {
    id: 5,
    nama: "Tepung Terigu",
    satuan: "kg",
    kategori: "Pokok",
    stokTotal: 32_000,
    stokPct: 88,
    hargaRata: 12_500,
    pasar: [
      {
        nama: "Pasar Barito Ternate",
        stokPct: 90,
        stokTon: 9_200,
        harga: 12_200,
      },
      { nama: "Pasar Gamalama", stokPct: 88, stokTon: 8_400, harga: 12_500 },
      { nama: "Pasar Tidore", stokPct: 85, stokTon: 7_800, harga: 12_800 },
      { nama: "Pasar Sofifi", stokPct: 89, stokTon: 6_600, harga: 12_500 },
    ],
    trendHarga: [
      { bulan: "Feb", harga: 12_000 },
      { bulan: "Mar", harga: 12_000 },
      { bulan: "Apr", harga: 12_200 },
      { bulan: "Mei", harga: 12_300 },
      { bulan: "Jun", harga: 12_500 },
      { bulan: "Jul", harga: 12_500 },
    ],
    koordinat: [-0.78, 127.48],
  },
];

const DUMMY_ALERTS = [
  {
    severity: "HIGH",
    komoditas: "Gula Pasir",
    lokasi: "Semua Pasar",
    pesan: "Stok di bawah 20% kapasitas — risiko kelangkaan 5-7 hari",
    rekomendasi:
      "Tambah pasokan dari Bulog segera; koordinasi distribusi lintas UPTD",
  },
  {
    severity: "HIGH",
    komoditas: "Minyak Goreng",
    lokasi: "Sofifi & Ternate",
    pesan: "Stok ≤ 30%, tren harga naik 4.2% dalam 2 bulan terakhir",
    rekomendasi: "Aktifkan operasi pasar; koordinasi agen distributor provinsi",
  },
  {
    severity: "MEDIUM",
    komoditas: "Beras",
    lokasi: "Pasar Tidore",
    pesan: "Stok 55% — di bawah target regional 70%",
    rekomendasi: "Percepat pengiriman dari gudang UPTD Tidore; monitor harian",
  },
];

const MAP_CENTER = [-0.8, 127.4];
const MAP_ZOOM = 8;

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DashboardKomoditas() {
  const user = useAuthStore((s) => s.user);
  const roleName = normalizeRole(user);

  const [komoditasList, setKomoditasList] = useState(DUMMY_KOMODITAS);
  const [alerts, setAlerts] = useState(DUMMY_ALERTS);
  const [selectedKomoditas, setSelectedKomoditas] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/komoditas/stock");
      const d = res.data?.data;
      if (d?.komoditas?.length > 0) {
        // Map API response to component shape (add heatmap koordinat dari DUMMY jika tidak ada)
        const mapped = d.komoditas.map((k, i) => {
          const dummy = DUMMY_KOMODITAS[i % DUMMY_KOMODITAS.length];
          return {
            id: k.id,
            nama: k.nama,
            satuan: k.satuan,
            kategori: k.kode ? "Pokok" : dummy.kategori,
            stokTotal: k.harga ? Math.round(k.harga * 2) : dummy.stokTotal,
            stokPct: k.verified ? 75 : 30, // default jika tidak ada stok numerik
            hargaRata: k.harga || dummy.hargaRata,
            pasar: dummy.pasar, // per-pasar detail masih dari dummy
            trendHarga: dummy.trendHarga,
            koordinat: dummy.koordinat,
          };
        });
        setKomoditasList(mapped);

        // Auto-generate early warning dari verified status
        const liveAlerts = d.komoditas
          .filter(
            (k) =>
              !k.verified || (k.perubahanPct && parseFloat(k.perubahanPct) > 5),
          )
          .slice(0, 3)
          .map((k) => ({
            severity: !k.verified ? "HIGH" : "MEDIUM",
            komoditas: k.nama,
            lokasi: "Semua Pasar",
            pesan: !k.verified
              ? `Data stok belum diperbarui bulan ini`
              : `Kenaikan harga ${parseFloat(k.perubahanPct).toFixed(1)}% dari bulan lalu`,
            rekomendasi: !k.verified
              ? "Koordinasi UPTD untuk pembaruan data segera"
              : "Pantau harga dan pertimbangkan operasi pasar",
          }));
        if (liveAlerts.length > 0) setAlerts(liveAlerts);
      }
    } catch {
      // use dummy data as fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user || !ALLOWED_ROLES.includes(roleName)) return <AccessDenied />;

  const kategoriOptions = [
    "Semua",
    ...new Set(komoditasList.map((k) => k.kategori)),
  ];
  const filtered = komoditasList.filter((k) => {
    const matchSearch =
      !searchQuery || k.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori =
      kategoriFilter === "Semua" || k.kategori === kategoriFilter;
    return matchSearch && matchKategori;
  });

  const dismissAlert = (idx) =>
    setAlerts((prev) => prev.filter((_, i) => i !== idx));

  const summaryStats = {
    amanCount: komoditasList.filter((k) => k.stokPct >= 80).length,
    cukupCount: komoditasList.filter((k) => k.stokPct >= 50 && k.stokPct < 80)
      .length,
    kritisCount: komoditasList.filter((k) => k.stokPct >= 20 && k.stokPct < 50)
      .length,
    daruratCount: komoditasList.filter((k) => k.stokPct < 20).length,
  };

  return (
    <DashboardKomoditasLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Dashboard Komoditas &amp; Stok Pangan
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Pemantauan stok, harga, dan distribusi komoditas pangan wilayah
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow transition"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Summary KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Stok Aman",
              count: summaryStats.amanCount,
              color: "from-emerald-400 to-emerald-600",
              icon: "✅",
            },
            {
              label: "Stok Cukup",
              count: summaryStats.cukupCount,
              color: "from-amber-400 to-amber-600",
              icon: "⚡",
            },
            {
              label: "Stok Kritis",
              count: summaryStats.kritisCount,
              color: "from-orange-400 to-orange-600",
              icon: "⚠️",
            },
            {
              label: "Stok Darurat",
              count: summaryStats.daruratCount,
              color: "from-red-400 to-red-600",
              icon: "🚨",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-gradient-to-br ${s.color} p-4 rounded-2xl text-white shadow`}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-bold">{s.count}</div>
              <div className="text-xs opacity-80 mt-1">{s.label} komoditas</div>
            </div>
          ))}
        </div>

        {/* Early Warning */}
        {alerts.length > 0 && (
          <EarlyWarningCard alerts={alerts} onDismiss={dismissAlert} />
        )}

        {/* MAP + Heatmap */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span>🗺️</span>
            <span className="font-semibold text-slate-700">
              Peta Stok Wilayah (Heatmap)
            </span>
            <div className="ml-auto flex gap-3 text-xs">
              {HEAT_LEVELS.map((h) => (
                <span
                  key={h.label}
                  className={`flex items-center gap-1 ${h.textColor} font-medium`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: h.color }}
                  />
                  {h.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ height: 320 }}>
            <MapContainer
              ref={mapRef}
              center={MAP_CENTER}
              zoom={MAP_ZOOM}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {komoditasList.map((k) => {
                const level = getHeatLevel(k.stokPct);
                return (
                  <CircleMarker
                    key={k.id}
                    center={k.koordinat}
                    radius={18 + (100 - k.stokPct) * 0.2}
                    pathOptions={{
                      color: level.color,
                      fillColor: level.color,
                      fillOpacity: 0.7,
                      weight: 2,
                    }}
                    eventHandlers={{ click: () => setSelectedKomoditas(k) }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-bold">{k.nama}</div>
                        <div>
                          Stok: {k.stokPct}% —{" "}
                          <span style={{ color: level.color }}>
                            {level.label}
                          </span>
                        </div>
                        <div>
                          Harga: Rp {k.hargaRata.toLocaleString("id-ID")}/satuan
                        </div>
                        <button
                          onClick={() => setSelectedKomoditas(k)}
                          className="mt-1 text-xs text-teal-600 font-medium underline"
                        >
                          Lihat Detail →
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Komoditas Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="font-semibold text-slate-700 flex-1">
              🌾 Daftar Komoditas
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cari komoditas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                {kategoriOptions.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Komoditas</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Total Stok</th>
                  <th className="px-4 py-3">Level Stok</th>
                  <th className="px-4 py-3 text-right">Harga Rata-rata</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      Tidak ada komoditas ditemukan
                    </td>
                  </tr>
                ) : (
                  filtered.map((k) => {
                    const level = getHeatLevel(k.stokPct);
                    return (
                      <tr
                        key={k.id}
                        className="hover:bg-teal-50 cursor-pointer transition"
                        onClick={() => setSelectedKomoditas(k)}
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {k.nama}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                            {k.kategori}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {k.stokTotal.toLocaleString("id-ID")} {k.satuan}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${k.stokPct}%`,
                                  backgroundColor: level.color,
                                }}
                              />
                            </div>
                            <span
                              className={`text-xs font-semibold ${level.textColor}`}
                            >
                              {k.stokPct}%
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${level.bg} ${level.textColor}`}
                            >
                              {level.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-700">
                          Rp {k.hargaRata.toLocaleString("id-ID")}/{k.satuan}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedKomoditas(k);
                            }}
                            className="text-xs text-teal-600 hover:underline"
                          >
                            Detail →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-100">
            Klik baris untuk melihat breakdown per pasar, trend harga, dan aksi
            distribusi
          </div>
        </div>
      </div>

      {/* Pasar Breakdown Drawer */}
      {selectedKomoditas && (
        <PasarBreakdown
          komoditas={selectedKomoditas}
          onClose={() => setSelectedKomoditas(null)}
        />
      )}
    </DashboardKomoditasLayout>
  );
}
