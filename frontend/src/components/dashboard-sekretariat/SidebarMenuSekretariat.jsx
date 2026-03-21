import React from "react";

const menuItems = [
  { label: "Dash", color: "text-green-700" },
  { label: "SMasuk", color: "text-green-700" },
  { label: "SKeluar", color: "text-green-700" },
  { label: "Dispo", color: "text-yellow-500" },
  { label: "Agenda", color: "text-blue-600" },
  { label: "Notul", color: "text-blue-600" },
  { label: "Kepeg", color: "text-green-700" },
  { label: "Keu", color: "text-green-700" },
  { label: "Aset", color: "text-green-700" },
];

export default function SidebarMenuSekretariat() {
  return (
    <aside className="fixed left-0 top-0 h-full w-18 bg-green-600 flex flex-col items-center py-4 z-20">
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center mt-2 mb-8">
        <span className="text-xs text-green-700">LOGO</span>
      </div>
      {/* Menu */}
      <div className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center" />
            <span
              className={`text-[10px] mt-[-6px] font-semibold ${item.color}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
