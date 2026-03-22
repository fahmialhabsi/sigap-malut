/**
 * KPIDrilldownDrawer — Drawer detail analisis saat klik KPI tile
 * Dokumen sumber: 03-dashboard-uiux.md
 *
 * Menampilkan:
 * - Nilai KPI saat ini vs target
 * - Tren 6 bulan (area chart via KPITrendChart)
 * - Breakdown per kabupaten/kota
 * - Tombol ekspor & tutup
 */

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import KPITrendChart from "./KPITrendChart";

function formatValue(value, unit = "") {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return String(value);
  return `${num.toLocaleString("id-ID")}${unit ? " " + unit : ""}`;
}

function DeviationBadge({ actual, target }) {
  if (!target || !actual) return null;
  const dev = ((actual - target) / target) * 100;
  const isPositive = dev >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isPositive ? "▲" : "▼"} {Math.abs(dev).toFixed(1)}%
    </span>
  );
}

export default function KPIDrilldownDrawer({ kpi, onClose }) {
  const { t } = useTranslation();
  const drawerRef = useRef(null);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Fokus drawer saat terbuka (aksesibilitas)
  useEffect(() => {
    drawerRef.current?.focus();
  }, []);

  if (!kpi) return null;

  const breakdown = kpi.breakdown || [];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-label={t("kpi.drilldown")}
        aria-modal="true"
        className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white z-50 shadow-2xl flex flex-col outline-none"
        style={{ animation: "slideInRight 0.25s ease-out" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-slate-200"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <div className="flex items-center gap-3">
            {kpi.icon && <span className="text-2xl">{kpi.icon}</span>}
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {kpi.label}
              </h2>
              {kpi.period && (
                <p className="text-xs text-blue-100">
                  {t("kpi.periode")}: {kpi.period}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition-colors"
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nilai utama */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">
                {t("kpi.realisasi")}
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {formatValue(kpi.value, kpi.unit)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">{t("kpi.target")}</p>
              <p className="text-2xl font-bold text-slate-700">
                {formatValue(kpi.target, kpi.unit)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">{t("kpi.capaian")}</p>
              <p className="text-2xl font-bold text-slate-700">
                <DeviationBadge actual={kpi.value} target={kpi.target} />
              </p>
            </div>
          </div>

          {/* Tren 6 bulan */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {t("kpi.trend")}
            </h3>
            <KPITrendChart
              kpiKey={kpi.key}
              label={kpi.label}
              unit={kpi.unit}
              color="#0B5FFF"
            />
          </div>

          {/* Breakdown per wilayah */}
          {breakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Breakdown per Kabupaten/Kota
              </h3>
              <div className="space-y-2">
                {breakdown.map((item, i) => {
                  const pct =
                    kpi.value > 0 ? (item.value / kpi.value) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-28 text-xs text-slate-600 truncate">
                        {item.label}
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: "var(--color-primary)",
                          }}
                        />
                      </div>
                      <div className="w-20 text-xs text-right font-medium text-slate-700">
                        {formatValue(item.value, kpi.unit)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sumber data */}
          {kpi.source && (
            <p className="text-xs text-slate-400 italic">
              {t("kpi.sumber")}: {kpi.source}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
