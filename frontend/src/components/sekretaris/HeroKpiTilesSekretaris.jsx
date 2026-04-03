import React from "react";
import { useSekretarisDashboard } from "../../hooks/useSekretarisDashboard";

export const HeroKpiTilesSekretaris = ({ className = "" }) => {
  const {
    kpi = {},
    inboxCount,
    approvalCount,
    bypassCount,
    kgbAlertCount,
    kinerjaAvg,
    loading,
  } = useSekretarisDashboard();

  const tiles = [
    {
      label: "Inbox Kepala Dinas & Bawahan",
      value: loading ? "…" : inboxCount ?? 0,
      color: inboxCount > 0 ? "red" : "indigo",
      icon: "📥",
    },
    {
      label: "Approval Queue",
      value: loading ? "…" : approvalCount ?? 0,
      color: approvalCount > 5 ? "amber" : "emerald",
      icon: "✅",
    },
    {
      label: "Bypass Alert",
      value: loading ? "…" : bypassCount ?? 0,
      color: bypassCount > 0 ? "red" : "blue",
      icon: "🚫",
    },
    {
      label: "KGB Alert",
      value: loading ? "…" : kgbAlertCount ?? 0,
      color: (kgbAlertCount ?? 0) > 0 ? "amber" : "blue",
      icon: "⏰",
    },
    {
      label: "SLA Compliance",
      value: loading ? "…" : `${kpi?.slaCompliance ?? 0}%`,
      color:
        (kpi?.slaCompliance ?? 0) >= 90
          ? "emerald"
          : (kpi?.slaCompliance ?? 0) >= 80
            ? "amber"
            : "red",
      icon: "📈",
    },
    {
      label: "Kinerja Tim",
      value: loading ? "…" : kinerjaAvg != null ? `${kinerjaAvg.toFixed(0)}%` : "—",
      color:
        kinerjaAvg == null
          ? "indigo"
          : kinerjaAvg >= 80
            ? "emerald"
            : kinerjaAvg >= 70
              ? "amber"
              : "red",
      icon: "👥",
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 ${className}`}
    >
      {tiles.map((tile, idx) => (
        <TileCard
          key={idx}
          icon={tile.icon}
          label={tile.label}
          value={tile.value}
          color={tile.color}
        />
      ))}
    </div>
  );
};

export default HeroKpiTilesSekretaris;

function TileCard({ icon, label, value, color }) {
  const colorMap = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  };
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1 ${colorMap[color] || colorMap.indigo}`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}
