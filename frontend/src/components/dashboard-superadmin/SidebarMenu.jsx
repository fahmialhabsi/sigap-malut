import React from "react";

export default function SidebarMenu() {
  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-[#066D44] flex flex-col items-center py-8 z-20">
      {/* Icon menu */}
      <div className="flex flex-col gap-6 mt-12">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/90" />
        <div className="w-10 h-10 rounded-xl bg-blue-600/90" />
        <div className="w-10 h-10 rounded-xl bg-white/25" />
        <div className="w-10 h-10 rounded-xl bg-green-600/30" />
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20" />
      </div>
    </aside>
  );
}
