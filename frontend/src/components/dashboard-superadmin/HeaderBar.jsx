import React from "react";

export default function HeaderBar() {
  return (
    <header className="fixed left-20 top-0 w-[calc(100vw-5rem)] h-16 bg-[#07723A] flex items-center px-6 z-10">
      {/* Logo */}
      <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center mr-4">
        <span className="text-xs text-gray-400">LOGO</span>
      </div>
      {/* Title */}
      <span className="text-white font-bold text-xl mr-6">SIGAP Malut · Dinas Pangan</span>
      {/* Mission Control badge */}
      <div className="bg-yellow-400 rounded-full px-6 py-1 h-7 flex items-center mr-6">
        <span className="text-[#233441] font-bold text-base">Mission Control</span>
      </div>
      {/* Health Indicator */}
      <div className="flex items-center mr-4 ml-auto">
        <span className="w-7 h-7 rounded-full bg-teal-400 flex items-center justify-center mr-2" />
        <span className="text-white text-sm">SYSTEM: OK</span>
      </div>
      {/* Impersonate button */}
      <button className="bg-blue-600 rounded-full px-6 py-1 h-7 text-white text-base mr-4">Impersonate</button>
      {/* User avatar */}
      <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
        <span className="text-2xl font-bold text-[#233441]">@</span>
      </div>
    </header>
  );
}
