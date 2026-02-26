import React from "react";

export default function Sidebar({ menu, active }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-green-600 flex flex-col items-center py-6 z-20">
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-8">
        <span className="text-xs text-green-700 font-bold">LOGO</span>
      </div>
      {/* Menu */}
      <nav className="flex flex-col gap-4">
        {menu.map((item, idx) => (
          <button
            key={item.label}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${active === idx ? "bg-green-700 text-white" : "bg-gray-100 text-green-700"}`}
          >
            {/* Icon placeholder */}
            <span className="text-xs font-semibold">{item.icon || "•"}</span>
            <span className="text-[10px] mt-[-2px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
