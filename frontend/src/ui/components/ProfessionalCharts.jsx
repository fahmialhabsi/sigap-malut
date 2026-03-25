import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const kpiTrend = [
  { bulan: "Jan", indeks: 72, inflasi: 3.2 },
  { bulan: "Feb", indeks: 74, inflasi: 3.0 },
  { bulan: "Mar", indeks: 73, inflasi: 3.5 },
  { bulan: "Apr", indeks: 76, inflasi: 2.8 },
  { bulan: "Mei", indeks: 78, inflasi: 2.6 },
  { bulan: "Jun", indeks: 77, inflasi: 2.9 },
];

const anggaranData = [
  { bidang: "Sekretariat", pagu: 4.5, realisasi: 3.8 },
  { bidang: "Ketersediaan", pagu: 6.2, realisasi: 5.1 },
  { bidang: "Distribusi", pagu: 5.0, realisasi: 4.3 },
  { bidang: "Konsumsi", pagu: 3.8, realisasi: 3.2 },
  { bidang: "UPTD", pagu: 4.0, realisasi: 3.5 },
];

const kinerjaData = [
  { bidang: "Ketersediaan", kinerja: 88 },
  { bidang: "Distribusi", kinerja: 82 },
  { bidang: "Konsumsi", kinerja: 79 },
  { bidang: "Sekretariat", kinerja: 91 },
  { bidang: "UPTD", kinerja: 85 },
];

export default function ProfessionalCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
      {/* Grafik Indeks Ketahanan Pangan */}
      <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
        <h2 className="font-bold text-lg mb-4 text-slate-100">
          Grafik Indeks Ketahanan Pangan
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={kpiTrend}>
            <defs>
              <linearGradient id="colorIndeks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="bulan" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis domain={[60, 90]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "none",
                color: "#f1f5f9",
              }}
            />
            <Area
              type="monotone"
              dataKey="indeks"
              stroke="#3b82f6"
              fill="url(#colorIndeks)"
              strokeWidth={2}
              name="Indeks"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Inflasi Pangan */}
      <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
        <h2 className="font-bold text-lg mb-4 text-slate-100">
          Grafik Inflasi Pangan (%)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={kpiTrend}>
            <defs>
              <linearGradient id="colorInflasi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="bulan" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis domain={[2, 4]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "none",
                color: "#f1f5f9",
              }}
            />
            <Area
              type="monotone"
              dataKey="inflasi"
              stroke="#f59e0b"
              fill="url(#colorInflasi)"
              strokeWidth={2}
              name="Inflasi %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Realisasi Anggaran */}
      <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
        <h2 className="font-bold text-lg mb-4 text-slate-100">
          Grafik Realisasi Anggaran (Miliar Rp)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={anggaranData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="bidang" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "none",
                color: "#f1f5f9",
              }}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Bar
              dataKey="pagu"
              fill="#6366f1"
              name="Pagu"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="realisasi"
              fill="#22c55e"
              name="Realisasi"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grafik Kinerja Lintas Bidang */}
      <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
        <h2 className="font-bold text-lg mb-4 text-slate-100">
          Grafik Kinerja Lintas Bidang (%)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={kinerjaData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="bidang"
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "none",
                color: "#f1f5f9",
              }}
            />
            <Bar
              dataKey="kinerja"
              fill="#0ea5e9"
              name="Kinerja %"
              radius={[0, 3, 3, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
