import React from "react";

export default function ExportPanel({ onExport, formats }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-soft flex flex-col gap-2">
      <div className="font-semibold text-ink mb-2">Export Panel</div>
      <div className="flex gap-2">
        {formats.map((fmt) => (
          <button
            key={fmt}
            className="px-3 py-1 rounded bg-accent text-white font-semibold shadow-soft hover:bg-accentDark transition"
            aria-label={`Export as ${fmt}`}
            onClick={() => onExport(fmt)}
          >
            {fmt}
          </button>
        ))}
      </div>
    </div>
  );
}
