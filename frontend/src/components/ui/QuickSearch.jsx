import React from "react";

export default function QuickSearch({ value, onChange }) {
  return (
    <input
      type="text"
      className="rounded border px-2 py-1 text-sm"
      placeholder="Search..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Quick Search"
    />
  );
}
