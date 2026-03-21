import React from "react";

export default function KpiTile({
  label,
  value,
  unit,
  trend,
  source,
  variant = "default",
  lastUpdated,
  onClick,
}) {
  return (
    <button
      className={`rounded-xl border shadow-soft p-4 flex flex-col items-start gap-2 bg-white hover:bg-slate-50 transition ${
        variant === "danger" ? "border-danger bg-danger/10" : "border-slate-200"
      }`}
      aria-label={`KPI ${label}, nilai ${value} ${unit}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ink text-sm">{label}</span>
        {source && (
          <span className="text-xs bg-muted text-white rounded px-2 py-0.5">
            {source}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">{value}</span>
        <span className="text-xs text-muted">{unit}</span>
      </div>
      {trend && (
        <div className="text-xs text-muted">Trend: {trend.join(", ")}</div>
      )}
      {lastUpdated && (
        <div className="text-xs text-muted">Last updated: {lastUpdated}</div>
      )}
    </button>
  );
}
