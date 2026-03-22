import { useState } from "react";
import KpiDrilldownDrawer from "./KpiDrilldownDrawer";

export default function KpiTile({
  label,
  value,
  unit,
  trend,
  source,
  variant = "default",
  lastUpdated,
  target,
  history,
  onClick,
  // drilldown = true enables the built-in drilldown drawer
  drilldown = true,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClick = () => {
    if (drilldown) {
      setDrawerOpen(true);
    }
    onClick?.();
  };

  return (
    <>
      <button
        className={`rounded-xl border shadow-soft p-4 flex flex-col items-start gap-2 bg-white hover:bg-slate-50 transition group ${
          variant === "danger" ? "border-danger bg-danger/10" : "border-slate-200"
        }`}
        aria-label={`KPI ${label}, nilai ${value} ${unit}. Klik untuk detail.`}
        onClick={handleClick}
        title="Klik untuk melihat tren & detail"
      >
        <div className="flex items-center justify-between w-full gap-2">
          <span className="font-semibold text-ink text-sm">{label}</span>
          <div className="flex items-center gap-1">
            {source && (
              <span className="text-xs bg-muted text-white rounded px-2 py-0.5">
                {source}
              </span>
            )}
            {drilldown && (
              <span className="text-slate-300 group-hover:text-primary transition text-xs">
                ↗
              </span>
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">{value}</span>
          <span className="text-xs text-muted">{unit}</span>
        </div>
        {target && (
          <div className="text-xs text-muted">
            Target:{" "}
            <span className="font-medium text-amber-600">
              {target} {unit}
            </span>
          </div>
        )}
        {trend && (
          <div className="text-xs text-muted">Trend: {trend.join(", ")}</div>
        )}
        {lastUpdated && (
          <div className="text-xs text-muted">Update: {lastUpdated}</div>
        )}
      </button>

      {drilldown && (
        <KpiDrilldownDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          kpi={{ label, value, unit, source, target, history }}
        />
      )}
    </>
  );
}
