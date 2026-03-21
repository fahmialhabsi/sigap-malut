import React from "react";

export default function HighContrastToggle({ enabled, onToggle }) {
  return (
    <button
      className="px-3 py-1 rounded bg-warning text-white font-semibold shadow-soft hover:bg-warning/80 transition"
      aria-label="Toggle High Contrast Mode"
      onClick={onToggle}
    >
      {enabled ? "Disable High Contrast" : "Enable High Contrast"}
    </button>
  );
}
