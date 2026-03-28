import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/**
 * KpiTrend6Bulan — Area chart tren 6 bulan sesuai spesifikasi 03-spesifikasi-uiux-dashboard.md
 *
 * Props:
 *   title   — string
 *   data    — array [{ bulan, nilai, target? }]  (paling sedikit 6 titik)
 *   unit    — string (satuan label tooltip)
 *   color   — string (default #0B5FFF)
 *   height  — number (default 220)
 *   showTarget — boolean
 */
export default function KpiTrend6Bulan({
  title = "Tren KPI 6 Bulan Terakhir",
  data,
  unit = "",
  color = "#0B5FFF",
  height = 220,
  showTarget = false,
  loading = false,
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const chartData = data ?? generateDemo();

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="h-[220px] bg-slate-50 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-slate-700 text-sm">{title}</div>
        <div className="text-xs text-slate-400 bg-slate-50 rounded px-2 py-1">
          6 bulan terakhir
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {showTarget && (
              <linearGradient id="grad-target" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="bulan"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={38}
            tickFormatter={(v) => (unit ? `${v}${unit}` : v)}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
            formatter={(val, name) => [
              `${val}${unit ? " " + unit : ""}`,
              name === "nilai" ? "Realisasi" : "Target",
            ]}
          />
          {showTarget && (
            <>
              <Legend
                iconSize={10}
                formatter={(v) => (v === "target" ? "Target" : "Realisasi")}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                fill="url(#grad-target)"
                dot={false}
              />
            </>
          )}
          <Area
            type="monotone"
            dataKey="nilai"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#grad-${color.replace("#", "")})`}
            dot={(props) => {
              const { cx, cy, index } = props;
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={activeIndex === index ? 5 : 3}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2 }}
            onMouseMove={(_, index) => setActiveIndex(index)}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function generateDemo() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      bulan: MONTH_LABELS[d.getMonth()],
      nilai: Math.round(Math.random() * 40 + 60),
      target: 85,
    };
  });
}
