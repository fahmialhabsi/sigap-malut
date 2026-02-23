import React from "react";

export default function MapPanel({ locations, label }) {
  // Placeholder: implement with React-Leaflet for production
  return (
    <div className="rounded-xl border p-4 bg-white shadow-soft">
      <div className="font-semibold text-ink mb-2">{label || "Map Panel"}</div>
      <div className="text-xs text-muted">
        Locations: {locations?.map((loc) => loc.name).join(", ")}
      </div>
      {/* TODO: Integrate map library */}
    </div>
  );
}
