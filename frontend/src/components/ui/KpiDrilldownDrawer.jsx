import { useState, useEffect } from "react";
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

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/**
 * KpiDrilldownDrawer — Drawer samping yang muncul saat klik KPI tile.
 * Menampilkan: detail nilai, tren 6 bulan (area chart), target vs realisasi.
 *
 * Props:
 *   open       — boolean
 *   onClose    — () => void
 *   kpi        — { label, value, unit, trend, target, source, history }
 *                history: array 6 obj { bulan, nilai, target }
 */
export default function KpiDrilldownDrawer({ open, onClose, kpi }) {
  const [visible, setVisible] = useState(false);

  // Animasi slide-in
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open && !visible) return null;

  const history = kpi?.history ?? generateDemoHistory(kpi?.value);
  const capaian =
    kpi?.target && kpi?.value
      ? Math.round((parseFloat(kpi.value) / parseFloat(kpi.target)) * 100)
      : null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail KPI: ${kpi?.label}`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-slate-200"
          style={{ backgroundColor: "var(--color-primary, #0B5FFF)" }}
        >
          <div>
            <div className="text-white font-bold text-base">
              {kpi?.label ?? "Detail KPI"}
            </div>
            {kpi?.source && (
              <div className="text-blue-200 text-xs mt-0.5">
                Sumber: {kpi.source}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition"
            aria-label="Tutup drawer"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nilai utama */}
          <div className="flex gap-4">
            <div className="flex-1 bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500 mb-1">Realisasi</div>
              <div
                className="text-3xl font-bold"
                style={{ color: "var(--color-primary, #0B5FFF)" }}
              >
                {kpi?.value ?? "—"}
              </div>
              <div className="text-xs text-slate-500 mt-1">{kpi?.unit}</div>
            </div>
            {kpi?.target && (
              <div className="flex-1 bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">Target</div>
                <div className="text-3xl font-bold text-slate-700">
                  {kpi.target}
                </div>
                <div className="text-xs text-slate-500 mt-1">{kpi?.unit}</div>
              </div>
            )}
            {capaian !== null && (
              <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">Capaian</div>
                <div
                  className={`text-3xl font-bold ${
                    capaian >= 100
                      ? "text-green-600"
                      : capaian >= 80
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {capaian}%
                </div>
              </div>
            )}
          </div>

          {/* Tren 6 bulan */}
          <div>
            <div className="font-semibold text-slate-700 mb-3 text-sm">
              Tren 6 Bulan Terakhir
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B5FFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0B5FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [v, kpi?.label ?? "Nilai"]}
                />
                {kpi?.target && (
                  <ReferenceLine
                    y={parseFloat(kpi.target)}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                    label={{ value: "Target", position: "right", fontSize: 10, fill: "#f59e0b" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="nilai"
                  stroke="#0B5FFF"
                  strokeWidth={2}
                  fill="url(#kpiGrad)"
                  dot={{ r: 3, fill: "#0B5FFF" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tabel data */}
          <div>
            <div className="font-semibold text-slate-700 mb-2 text-sm">
              Data Bulanan
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-2 px-3 text-slate-500 font-medium">Bulan</th>
                  <th className="text-right py-2 px-3 text-slate-500 font-medium">Nilai</th>
                  {history[0]?.target !== undefined && (
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Target</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-2 px-3 text-slate-700">{row.bulan}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-800">
                      {row.nilai}
                    </td>
                    {row.target !== undefined && (
                      <td className="py-2 px-3 text-right text-amber-600">
                        {row.target}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 text-right">
          Data diperbarui secara real-time &bull; SIGAP MALUT
        </div>
      </aside>
    </>
  );
}

/**
 * Buat data demo jika prop history tidak tersedia.
 */
function generateDemoHistory(currentValue) {
  const now = new Date();
  const base = parseFloat(currentValue) || 50;
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const noise = (Math.random() - 0.5) * base * 0.2;
    return {
      bulan: MONTHS_ID[d.getMonth()],
      nilai: Math.round((base + noise) * 10) / 10,
    };
  });
}
