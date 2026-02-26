import React from "react";

export default function Header({ title, user }) {
  return (
    <header className="fixed left-20 top-0 w-[calc(100vw-5rem)] h-16 bg-[#07723A] flex items-center px-8 z-10">
      <span className="text-white font-bold text-xl flex-1">{title}</span>
      {/* User/avatar */}
      <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center ml-4">
        <span className="text-lg font-bold text-[#233441]">
          {user?.initials || "U"}
        </span>
      </div>
    </header>
  );
}
