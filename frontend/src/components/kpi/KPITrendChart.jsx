/**
 * KPITrendChart — Area chart tren 6 bulan untuk satu KPI
 * Dokumen sumber: 03-spesifikasi-uiux-dashboard.md
 *
 * Menggunakan Recharts (sudah terinstall).
 * Data diambil dari /api/inflasi/kpi-trend atau fallback ke mock.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import api from "../../api/axiosInstance";

function buildMockData(_label) {
  const months = ["Okt", "Nov", "Des", "Jan", "Feb", "Mar"];
  return months.map((bulan, i) => ({
    bulan,
    nilai: Math.round(80 + Math.random() * 40 + i * 2),
    target: 100,
  }));
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toLocaleString("id-ID")}</strong>
          {unit ? ` ${unit}` : ""}
        </p>
      ))}
    </div>
  );
};

export default function KPITrendChart({
  kpiKey,
  label = "KPI",
  unit = "",
  color = "#0B5FFF",
  showTarget = true,
  height = 220,
}) {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchTrend() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/inflasi/kpi-trend`, {
          params: { key: kpiKey, months: 6 },
        });
        if (!cancelled) {
          setData(res.data?.data || buildMockData(label));
        }
      } catch {
        if (!cancelled) {
          // Fallback ke data mock
          setData(buildMockData(label));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTrend();
    return () => {
      cancelled = true;
    };
  }, [kpiKey, label]);

  if (loading) {
    return (
      <div
        className="animate-pulse bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm"
        style={{ height }}
      >
        {t("kpi.loading")}
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div
        className="bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-sm"
        style={{ height }}
      >
        {t("kpi.noData")}
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.map((d) => d.nilai ?? 0),
    ...(showTarget ? data.map((d) => d.target ?? 0) : []),
  );

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <p className="text-xs text-slate-500 mb-3">
        {t("kpi.sixMonthTrend")}:{" "}
        <span className="font-medium text-slate-700">{label}</span>
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={`grad-${kpiKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />
          <XAxis
            dataKey="bulan"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxVal * 1.1)]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          {showTarget && data[0]?.target && (
            <ReferenceLine
              y={data[0].target}
              stroke="#f59e0b"
              strokeDasharray="4 2"
              label={{
                value: "Target",
                position: "right",
                fontSize: 10,
                fill: "#f59e0b",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="nilai"
            name={label}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${kpiKey})`}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
