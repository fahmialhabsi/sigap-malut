import React from "react";

export default function HeaderBarSekretariat() {
  return (
    <header className="fixed left-18 top-0 w-[calc(100vw-4.5rem)] h-15 bg-[#07723A] flex items-center px-8 z-10">
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center mr-4">
        <span className="text-xs text-green-700">LOGO</span>
      </div>
      {/* Title */}
      <span className="text-white font-bold text-lg">
        Dashboard Sekretariat
      </span>
    </header>
  );
}
