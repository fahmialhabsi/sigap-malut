import React from "react";

export default function KpiTile({
  label,
  value,
  unit,
  delta,
  trend = [],
  color = "primary",
  icon,
}) {
  const colorClass = `text-${color}-700 dark:text-${color}-400`;
  return (
    <div
      className={`rounded-xl p-4 w-full flex flex-col items-center shadow bg-white dark:bg-background-card transition-colors duration-300 border-b-4 border-${color}-500 dark:border-${color}-400`}
    >
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      <span className={`text-xs mt-1 ${colorClass}`}>{label}</span>
      {unit && (
        <span className="text-[10px] text-muted dark:text-text-muted">
          {unit}
        </span>
      )}
      {delta != null && (
        <span
          className={`mt-1 text-xs ${
            delta > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%
        </span>
      )}
    </div>
  );
}
