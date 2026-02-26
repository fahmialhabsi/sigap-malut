import React from "react";

export default function TimeseriesPanel({ title, series, controls, onExport }) {
  return (
    <div className="bg-card rounded-md shadow-md p-4 flex flex-col gap-3 border border-surface-border">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-primary">{title}</div>
        {controls && <div>{controls}</div>}
        <button
          className="px-2 py-1 rounded bg-accent text-white text-xs font-semibold"
          onClick={onExport}
          aria-label="Export Chart"
        >
          Export CSV
        </button>
      </div>
      <div className="h-64 w-full bg-muted rounded">
        {/* Implement chart (ECharts/Recharts) here */}
      </div>
    </div>
  );
}
