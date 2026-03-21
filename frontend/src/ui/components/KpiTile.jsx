// src/ui/components/KpiTile.jsx
import React from "react";

export default function KpiTile({
  label,
  value,
  delta,
  trend,
  unit,
  status,
  onClick,
}) {
  return (
    <div
      className={`bg-card rounded-md shadow-md p-4 flex flex-col gap-2 cursor-pointer border border-surface-border ${
        status === "ok"
          ? "border-success"
          : status === "warn"
            ? "border-warning"
            : status === "alert"
              ? "border-danger"
              : "border-surface-border"
      }`}
      onClick={onClick}
      tabIndex={0}
      aria-label={label}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted">{label}</span>
        <span className="ml-auto text-xs text-muted">{unit}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-primary">{value}</span>
        {delta !== undefined && (
          <span
            className={`text-xs font-semibold rounded px-2 py-1 ${
              delta > 0
                ? "bg-success text-white"
                : delta < 0
                  ? "bg-danger text-white"
                  : "bg-muted text-primary"
            }`}
          >
            {delta > 0 ? "▲" : delta < 0 ? "▼" : ""} {Math.abs(delta)}%
          </span>
        )}
      </div>
      {/* Sparkline placeholder */}
      {trend && (
        <div className="h-6 w-full bg-muted rounded">
          {/* Implement sparkline chart here */}
        </div>
      )}
    </div>
  );
}
