// src/components/ui/AlertList.jsx
import React from "react";

export default function AlertList({ alerts }) {
  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded border-l-4 p-3 shadow-soft bg-white flex flex-col gap-1 ${
            alert.severity === "critical"
              ? "border-danger"
              : alert.severity === "warning"
                ? "border-warning"
                : "border-accent"
          }`}
          aria-label={`Alert: ${alert.title}`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">{alert.title}</span>
            <span className="text-xs text-muted">{alert.summary}</span>
          </div>
          {alert.link && (
            <a href={alert.link} className="text-xs text-primary underline">
              Detail
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
