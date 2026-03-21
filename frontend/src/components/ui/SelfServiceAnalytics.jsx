import React from "react";

export default function SelfServiceAnalytics({ filters, onFilterChange }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-soft flex flex-col gap-2">
      <div className="font-semibold text-ink mb-2">Self-Service Analytics</div>
      <div className="flex gap-2">
        {filters.map((filter) => (
          <select
            key={filter.name}
            className="rounded border px-2 py-1 text-sm"
            value={filter.value}
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            aria-label={`Filter ${filter.name}`}
          >
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
}
