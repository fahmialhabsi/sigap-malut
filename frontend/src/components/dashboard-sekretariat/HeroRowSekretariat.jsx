import React from "react";

const heroWidgets = [
  { label: "Surat Masuk", border: "border-green-600", color: "text-green-600" },
  { label: "Surat Keluar", border: "border-blue-600", color: "text-blue-600" },
  { label: "Disposisi", border: "border-yellow-400", color: "text-yellow-400" },
  { label: "Reminders", border: "border-red-500", color: "text-red-500" },
];

export default function HeroRowSekretariat() {
  return (
    <section className="flex gap-6 px-8 mt-20 mb-2">
      {heroWidgets.map((w, i) => (
        <div
          key={w.label}
          className={`bg-white rounded-xl border-2 ${w.border} flex flex-col items-center justify-center w-[200px] h-[70px]`}
        >
          <span className={`text-base ${w.color}`}>{w.label}</span>
        </div>
      ))}
    </section>
  );
}
