import React from "react";

export default function TrendChart({ data, label }) {
  // Placeholder: implement with Recharts/ECharts for production
  return (
    <div className="rounded-xl border p-4 bg-white shadow-soft">
      <div className="font-semibold text-ink mb-2">
        {label || "Trend Chart"}
      </div>
      <div className="text-xs text-muted">Data: {data?.join(", ")}</div>
      {/* TODO: Integrate chart library */}
    </div>
  );
}
