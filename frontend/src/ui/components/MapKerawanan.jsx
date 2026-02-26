import React from "react";

export default function MapKerawanan({ geoData, layers, onRegionClick }) {
  return (
    <div className="bg-card rounded-md shadow-md p-4 flex flex-col gap-3 border border-surface-border">
      <div className="font-semibold text-primary mb-2">Peta Kerawanan</div>
      <div className="h-80 w-full bg-muted rounded">
        {/* Implement map (React-Leaflet/MapboxGL) here */}
      </div>
      {/* Layer toggles, legend, etc. */}
      {layers && <div className="flex gap-2 mt-2">{layers}</div>}
    </div>
  );
}
