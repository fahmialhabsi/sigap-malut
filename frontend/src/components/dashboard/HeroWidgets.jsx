import React from "react";

export default function HeroWidgets({ widgets }) {
  return (
    <section className="flex gap-6 px-8 mt-24 mb-2">
      {widgets.map((w, i) => (
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
