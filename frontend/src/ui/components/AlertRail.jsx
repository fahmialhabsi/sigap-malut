import React from "react";

export default function AlertRail({ alerts, onAction }) {
  return (
    <div className="bg-card rounded-md shadow-md p-4 flex flex-col gap-3 border border-surface-border">
      <div className="font-semibold text-primary mb-2">Alerts</div>
      {alerts && alerts.length > 0 ? (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-2 p-2 rounded border-l-4 ${
              alert.severity === "critical"
                ? "border-danger"
                : alert.severity === "warning"
                  ? "border-warning"
                  : "border-info"
            } bg-muted`}
          >
            <div className="flex-1">
              <div className="font-bold text-danger">{alert.title}</div>
              <div className="text-xs text-muted">{alert.summary}</div>
            </div>
            <button
              className="px-2 py-1 rounded bg-primary text-white text-xs font-semibold"
              onClick={() => onAction && onAction(alert)}
              aria-label="Acknowledge Alert"
            >
              Acknowledge
            </button>
          </div>
        ))
      ) : (
        <div className="text-xs text-muted">No alerts</div>
      )}
    </div>
  );
}
