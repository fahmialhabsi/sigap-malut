import React from "react";
const defaultMenu = [
  { label: "Dashboard", path: "/dashboard", icon: "🏠" },
  { label: "Kepegawaian", path: "/kepegawaian", icon: "🗃️" },
  { label: "Keuangan", path: "/keuangan", icon: "💰" },
  { label: "Komoditas", path: "/komoditas", icon: "🌾" },
  { label: "UPTD", path: "/uptd", icon: "🏢" },
  { label: "Distribusi", path: "/distribusi", icon: "🚚" },
];

export default function SidebarMenu({ items = defaultMenu, currentRole }) {
  return (
    <nav className="flex flex-col gap-1 px-1">
      {items.map((item, idx) => (
        <a
          key={idx}
          href={item.path}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 dark:hover:bg-background-accent dark:text-text-main transition"
        >
          <span>{item.icon}</span>
          <span className="hidden md:inline">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
