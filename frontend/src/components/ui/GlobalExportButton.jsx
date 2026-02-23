import React from "react";

export default function GlobalExportButton({ onExport }) {
  return (
    <button
      className="px-4 py-2 rounded bg-success text-white font-semibold shadow-soft hover:bg-success/80 transition"
      aria-label="Global Export"
      onClick={onExport}
    >
      Export
    </button>
  );
}
