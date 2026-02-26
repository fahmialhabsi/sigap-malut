import React from "react";

const heroWidgets = [
  { label: "Active Users / Heatmap", color: "text-[#07723A]" },
  { label: "System Errors", color: "text-blue-600" },
  { label: "Notif/Queue", color: "text-yellow-500" },
  { label: "Backup & Recovery", color: "text-[#233441]" },
  { label: "Audit Alerts", color: "text-yellow-400 font-bold" },
  { label: "Compliance Badge", color: "text-green-600" },
];

export default function HeroRow() {
  return (
    <section className="flex gap-6 px-8 mt-24 mb-2">
      {heroWidgets.map((w, i) => (
        <div
          key={w.label}
          className={`bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center ${i === 5 ? "w-[370px]" : "w-[210px]"} h-[110px]`}
        >
          <span className={`text-base ${w.color}`}>{w.label}</span>
        </div>
      ))}
    </section>
  );
}
