import React from "react";

export default function DateRangeSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-xs text-muted">Periode:</span>
      <input
        type="month"
        className="rounded border px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Date Range Selector"
      />
    </div>
  );
}
