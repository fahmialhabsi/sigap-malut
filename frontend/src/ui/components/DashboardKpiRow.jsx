import React from "react";
import KpiTile from "./KpiTile";

export default function DashboardKpiRow({ kpis, onKpiClick }) {
  return (
    <div className="grid grid-cols-6 gap-4 mb-6 h-[72px]">
      {kpis.map((kpi) => (
        <KpiTile
          key={kpi.id}
          {...kpi}
          onClick={() => onKpiClick && onKpiClick(kpi)}
        />
      ))}
    </div>
  );
}
