import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import BukaEPelaraButton from "../components/BukaEPelaraButton";

const NAV_ITEMS = [
  { label: "Ringkasan KGB", path: "/dashboard/kepegawaian", icon: "👤" },
  { label: "Kalender KGB", path: "/dashboard/kepegawaian/kalender", icon: "📅" },
  { label: "Tracking Proses", path: "/dashboard/kepegawaian/tracking", icon: "🔄" },
  { label: "Arsip SK", path: "/dashboard/kepegawaian/arsip", icon: "🗂️" },
  { label: "Laporan Kepegawaian", path: "/dashboard/kepegawaian/laporan", icon: "📋" },
];

export default function DashboardKepegawaianLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-gradient-to-b from-emerald-900 to-emerald-800 text-white shadow-xl transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        } ${isMobile && !sidebarOpen ? "-translate-x-full" : ""}`}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-emerald-700">
          <span className="text-2xl">🏛️</span>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-sm">SIGAP MALUT</div>
              <div className="text-xs text-emerald-200">Dashboard Kepegawaian</div>
            </div>
          )}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard/kepegawaian"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive ? "bg-emerald-600 font-semibold" : "text-emerald-100 hover:bg-emerald-700"
                }`
              }
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="mx-auto mb-4 w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        } ${isMobile ? "ml-0" : ""}`}
      >
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
          {isMobile && (
            <button onClick={() => setSidebarOpen((v) => !v)} className="mr-3 text-slate-500">☰</button>
          )}
          <div className="font-semibold text-slate-700 flex items-center gap-2">
            <span>🏛️</span> Dashboard Kepegawaian &amp; KGB
          </div>
          <BukaEPelaraButton label="e-Pelara" targetPath="/" className="!py-1.5 !px-3 !text-xs" />
          <div className="relative">
            <button
              onClick={() => setAvatarOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm"
            >
              {user?.nama?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="font-semibold text-sm text-slate-800">{user?.nama || user?.username}</div>
                  <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                </div>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>

      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
