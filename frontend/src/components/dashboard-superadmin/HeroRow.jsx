import React from "react";

const heroWidgets = [
  { label: "Active Users / Heatmap", color: "text-emerald-400" },
  { label: "System Errors", color: "text-blue-400" },
  { label: "Notif/Queue", color: "text-yellow-400" },
  { label: "Backup & Recovery", color: "text-slate-200" },
  { label: "Audit Alerts", color: "text-yellow-400 font-bold" },
  { label: "Compliance Badge", color: "text-emerald-400" },
];

export default function HeroRow() {
  return (
    <section className="flex gap-6 px-8 mt-24 mb-2">
      {heroWidgets.map((w, i) => (
        <div
          key={w.label}
          className={`bg-slate-950/88 backdrop-blur-md border border-slate-800/85 rounded-2xl shadow-lg flex flex-col items-center justify-center ${i === 5 ? "w-[370px]" : "w-[210px]"} h-[110px]`}
        >
          <span className={`text-base ${w.color}`}>{w.label}</span>
        </div>
      ))}
    </section>
  );
}
