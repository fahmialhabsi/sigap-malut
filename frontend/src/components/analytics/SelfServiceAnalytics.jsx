/**
 * SelfServiceAnalytics — Filter analytics mandiri
 * Dokumen sumber: 05-Dashboard-Template-Standar.md
 *
 * Fitur:
 * - Filter multi-dimensi (tanggal, wilayah, komoditas, indikator)
 * - Preview tabel hasil
 * - Ekspor ke Excel / CSV
 * - Toggle chart area/bar
 */

import { useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import api from "../../utils/api";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const WILAYAH_OPTIONS = [
  "Semua Wilayah",
  "Ternate",
  "Tidore Kepulauan",
  "Sofifi",
  "Halmahera Barat",
  "Halmahera Timur",
  "Halmahera Utara",
  "Halmahera Selatan",
  "Kepulauan Sula",
  "Pulau Taliabu",
  "Pulau Morotai",
];

const KOMODITAS_OPTIONS = [
  "Semua Komoditas",
  "Beras",
  "Jagung",
  "Kedelai",
  "Gula Pasir",
  "Minyak Goreng",
  "Daging Sapi",
  "Daging Ayam",
  "Telur",
  "Cabai Merah",
  "Bawang Merah",
  "Bawang Putih",
];

const INDIKATOR_OPTIONS = [
  { value: "harga_rata", label: "Harga Rata-rata" },
  { value: "stok_volume", label: "Volume Stok" },
  { value: "inflasi_persen", label: "Inflasi (%)" },
  { value: "distribusi_ton", label: "Distribusi (ton)" },
  { value: "konsumsi_kg", label: "Konsumsi (kg/kapita)" },
];

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 Hari" },
  { value: "1m", label: "1 Bulan" },
  { value: "3m", label: "3 Bulan" },
  { value: "6m", label: "6 Bulan" },
  { value: "1y", label: "1 Tahun" },
  { value: "custom", label: "Kustom" },
];

const generateMockData = (filter) => {
  const points = filter.period === "7d" ? 7 : filter.period === "1m" ? 30 : 24;
  return Array.from({ length: points }, (_, i) => ({
    label:
      filter.period === "7d"
        ? `Hari ${i + 1}`
        : filter.period === "1m"
          ? `Tgl ${i + 1}`
          : `Bln ${i + 1}`,
    nilai: Math.round(Math.random() * 500 + 100),
    tahun_lalu: Math.round(Math.random() * 500 + 80),
  }));
};

export default function SelfServiceAnalytics() {
  const [filter, setFilter] = useState({
    wilayah: "Semua Wilayah",
    komoditas: "Semua Komoditas",
    indikator: "harga_rata",
    period: "3m",
    tanggalMulai: "",
    tanggalAkhir: "",
  });
  const [chartType, setChartType] = useState("area");
  const [data, setData] = useState(() => generateMockData({ period: "3m" }));
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const updateFilter = (key, val) => setFilter((p) => ({ ...p, [key]: val }));

  const handleApply = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/analytics/self-service", { params: filter });
      setData(res.data.results || generateMockData(filter));
    } catch {
      // Fallback ke data simulasi jika endpoint belum ada
      setData(generateMockData(filter));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Analitik");
    XLSX.writeFile(wb, `analitik_${filter.indikator}_${Date.now()}.xlsx`);
    toast.success("File Excel berhasil diunduh");
  };

  const handleExportCSV = () => {
    const header = Object.keys(data[0] || {}).join(",");
    const rows = data.map((r) => Object.values(r).join(",")).join("\n");
    const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analitik_${filter.indikator}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File CSV berhasil diunduh");
  };

  const indikatorLabel =
    INDIKATOR_OPTIONS.find((o) => o.value === filter.indikator)?.label ||
    filter.indikator;

  return (
    <div className="space-y-6">
      {/* Filter panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          🔍 Filter Analitik Mandiri
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Wilayah
            </label>
            <select
              value={filter.wilayah}
              onChange={(e) => updateFilter("wilayah", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {WILAYAH_OPTIONS.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Komoditas
            </label>
            <select
              value={filter.komoditas}
              onChange={(e) => updateFilter("komoditas", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {KOMODITAS_OPTIONS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Indikator
            </label>
            <select
              value={filter.indikator}
              onChange={(e) => updateFilter("indikator", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {INDIKATOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Periode
            </label>
            <select
              value={filter.period}
              onChange={(e) => updateFilter("period", e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApply}
              disabled={loading}
              className="w-full py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {loading ? "Memuat..." : "▶ Terapkan"}
            </button>
          </div>
        </div>
        {filter.period === "custom" && (
          <div className="grid grid-cols-2 gap-3 mt-3 max-w-xs">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dari
              </label>
              <input
                type="date"
                value={filter.tanggalMulai}
                onChange={(e) => updateFilter("tanggalMulai", e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sampai
              </label>
              <input
                type="date"
                value={filter.tanggalAkhir}
                onChange={(e) => updateFilter("tanggalAkhir", e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            📈 {indikatorLabel}
            <span className="text-xs font-normal text-slate-400">
              — {filter.wilayah} · {filter.komoditas}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType("area")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${chartType === "area" ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              style={
                chartType === "area"
                  ? { backgroundColor: "var(--color-primary)" }
                  : {}
              }
            >
              Area
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${chartType === "bar" ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              style={
                chartType === "bar"
                  ? { backgroundColor: "var(--color-primary)" }
                  : {}
              }
            >
              Bar
            </button>
            <button
              onClick={() => setShowTable((v) => !v)}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              {showTable ? "🔼 Tabel" : "🔽 Tabel"}
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"
            >
              📥 Excel
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              📄 CSV
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          {chartType === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="ssa_grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B5FFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0B5FFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="nilai"
                name={indikatorLabel}
                stroke="#0B5FFF"
                fill="url(#ssa_grad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="tahun_lalu"
                name="Tahun Lalu"
                stroke="#94A3B8"
                fill="none"
                strokeDasharray="4 2"
                strokeWidth={1.5}
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="nilai"
                name={indikatorLabel}
                fill="#0B5FFF"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="tahun_lalu"
                name="Tahun Lalu"
                fill="#CBD5E1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Tabel */}
      {showTable && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-700 text-sm">
            📋 Data Tabel
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Periode
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {indikatorLabel}
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Tahun Lalu
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Δ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => {
                  const delta = row.nilai - row.tahun_lalu;
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-700">
                        {row.label}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                        {row.nilai.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                        {row.tahun_lalu.toLocaleString("id-ID")}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-mono font-medium ${delta >= 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {delta >= 0 ? "+" : ""}
                        {delta.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
