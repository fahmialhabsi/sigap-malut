// frontend/src/layouts/DashboardKonsumsiLayout.jsx

import React from "react";
import { NavLink } from "react-router-dom";

const konsumsiMenu = [
  {
    id: "BKS-KBJ",
    name: "Kebijakan Bidang Konsumsi",
    path: "/konsumsi/BKS-KBJ",
  },
  {
    id: "BKS-DVR",
    name: "Diversifikasi/Penganekaragaman",
    path: "/konsumsi/BKS-DVR",
  },
  { id: "BKS-KMN", name: "Keamanan Pangan", path: "/konsumsi/BKS-KMN" },
  {
    id: "BKS-BMB",
    name: "Bimtek/Pelatihan/Penyuluhan",
    path: "/konsumsi/BKS-BMB",
  },
  {
    id: "BKS-EVL",
    name: "Evaluasi (KPI Dashboard)",
    path: "/konsumsi/BKS-EVL",
  },
  { id: "BKS-LAP", name: "Laporan Kinerja / SAKIP", path: "/konsumsi/BKS-LAP" },
];

export default function DashboardKonsumsiLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-80 lg:flex-col border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur">
          <div className="px-6 py-5">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Bidang Konsumsi
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Menu input & pengelolaan data
            </div>
          </div>

          <nav className="px-3 pb-6 overflow-y-auto">
            <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Modul
            </div>

            <div className="space-y-1">
              {konsumsiMenu.map((m) => (
                <NavLink
                  key={m.id}
                  to={m.path}
                  className={({ isActive }) =>
                    [
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                      "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                      "dark:text-slate-200 dark:hover:bg-slate-800/60 dark:hover:text-white",
                      isActive
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800/70 dark:text-white"
                        : "",
                    ].join(" ")
                  }
                >
                  <span className="truncate">{m.name}</span>
                  <span className="ml-3 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {m.id}
                  </span>
                </NavLink>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 px-3">
              <NavLink
                to="/dashboard/konsumsi"
                className={({ isActive }) =>
                  [
                    "block rounded-lg px-3 py-2 text-sm font-medium",
                    "text-pink-700 hover:bg-pink-50",
                    "dark:text-pink-300 dark:hover:bg-slate-800/60",
                    isActive ? "bg-pink-50 dark:bg-slate-800/70" : "",
                  ].join(" ")
                }
              >
                Dashboard Konsumsi
              </NavLink>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Top bar (mobile) */}
          <div className="lg:hidden sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur">
            <div className="px-4 py-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Dashboard Bidang Konsumsi
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Sidebar tersedia di layar besar (desktop)
              </div>
            </div>
          </div>

          <div className="w-full px-4 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
