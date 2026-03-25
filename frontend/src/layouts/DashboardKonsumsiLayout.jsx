// frontend/src/layouts/DashboardKonsumsiLayout.jsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import konsumsiModules from "../data/konsumsiModules";
import api from "../utils/api";
import BukaEPelaraButton from "../components/BukaEPelaraButton";

function isActiveModule(row) {
  return (
    row?.is_active === undefined ||
    row?.is_active === null ||
    row?.is_active === true ||
    String(row?.is_active).toLowerCase() === "true" ||
    String(row?.is_active) === "1"
  );
}

function SidebarItem({ to, label, sidebarOpen, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className="relative w-full flex items-center group transition"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-2 h-[52px] w-2 bg-gradient-to-b from-yellow-400 to-yellow-200 rounded-r-lg scale-105 shadow-lg transition" />
          )}
          <div
            className={`
              h-[52px] w-full pl-10 pr-5 text-lg flex items-center rounded-2xl font-semibold
              ${
                isActive
                  ? "bg-green-800/90 text-yellow-300"
                  : "bg-green-700/85 text-green-100 hover:bg-green-800/85"
              }
              shadow group-hover:scale-105
              transition-all
              relative
            `}
          >
            <span className="flex-1 text-left">
              {sidebarOpen ? label : label[0]}
            </span>
          </div>
        </>
      )}
    </NavLink>
  );
}

export default function DashboardKonsumsiLayout({
  children,
  modules = konsumsiModules,
}) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768;
  });
  const [waktu, setWaktu] = useState(new Date());
  const [user, setUser] = useState(null);
  const [notifikasi, setNotifikasi] = useState([]);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth check
  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/profile")
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.user || res.data?.data || res.data;
        setUser(data);
      })
      .catch(() => {
        if (!mounted) return;
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Avatar dropdown click outside handler
  useEffect(() => {
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target))
        setAvatarOpen(false);
    };
    if (avatarOpen) window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [avatarOpen]);

  // Auth check
  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/profile")
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.user || res.data?.data || res.data;
        setUser(data);
      })
      .catch(() => {
        if (!mounted) return;
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Avatar dropdown click outside handler
  useEffect(() => {
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target))
        setAvatarOpen(false);
    };
    if (avatarOpen) window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [avatarOpen]);

  const konsumsiMenu = useMemo(() => {
    const modulRows = (Array.isArray(modules) ? modules : [])
      .filter(isActiveModule)
      .sort((a, b) => {
        const orderA = Number(a?.menu_order ?? a?.menuOrder ?? 9999);
        const orderB = Number(b?.menu_order ?? b?.menuOrder ?? 9999);
        return orderA - orderB;
      })
      .map((row) => {
        const id = row.modul_id || row.id;
        return {
          id,
          name: row.nama_modul || row.name || id,
          path: `/konsumsi/${id}`,
        };
      });

    return [
      {
        id: "dashboard",
        name: "Dashboard",
        path: "/dashboard/konsumsi",
      },
      ...modulRows,
    ];
  }, [modules]);

  const menuLabelMap = {
    DASHBOARD: "Dashboard Konsumsi",
    "BKS-KBJ": "Kebijakan Bidang Konsumsi",
    "BKS-DVR": "Diversifikasi & Penganekaragaman",
    "BKS-KMN": "Keamanan Pangan",
    "BKS-BMB": "Bimbingan & Penyuluhan",
    "BKS-EVL": "Monitoring Evaluasi",
    "BKS-LAP": "Laporan Kinerja",
  };

  const getMenuLabel = (moduleItem) => {
    const key = String(moduleItem?.id || "").toUpperCase();
    return menuLabelMap[key] || moduleItem?.name || "Modul";
  };

  return (
    <div className="fixed inset-0 flex font-inter bg-gradient-to-br from-green-900 via-green-800 to-slate-800 text-slate-100 select-none">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-20 bg-slate-950/45"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`h-full bg-green-950/95 z-30 flex flex-col items-center flex-shrink-0 transition-all duration-300 ${
          isMobile
            ? `${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed left-0 top-0 w-[275px] min-w-[275px]`
            : sidebarOpen
              ? "w-[275px] min-w-[275px]"
              : "w-[72px] min-w-[72px]"
        } border-r border-green-900/60 shadow-xl`}
      >
        <div className="flex items-center justify-center w-full py-8">
          <img
            src="/Logo.png"
            alt="logo"
            className={`object-contain ${sidebarOpen ? "w-24 h-24" : "w-10 h-10"}`}
          />
        </div>

        <nav className="w-full flex flex-col gap-4 flex-1 justify-center px-3">
          {konsumsiMenu.length ? (
            konsumsiMenu.map((m) => (
              <SidebarItem
                key={m.id}
                to={m.path}
                label={getMenuLabel(m)}
                sidebarOpen={sidebarOpen}
                onNavigate={() => {
                  if (isMobile) setSidebarOpen(false);
                }}
              />
            ))
          ) : (
            <div className="px-2 py-4 text-center text-sm text-green-100/70">
              {sidebarOpen ? "Menu belum tersedia" : "-"}
            </div>
          )}
        </nav>

        <div className="py-6 w-full text-xs text-green-100/70 text-center tracking-wide">
          {sidebarOpen ? "SIGAP Malut" : "SIGAP"}
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col bg-green-950/80 backdrop-blur">
        <header className="flex-none w-full h-[75px] bg-green-900/80 flex items-center px-4 md:px-12 shadow-sm z-10 sticky top-0">
          <button
            type="button"
            className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-green-700/70 bg-green-950/60 text-green-100 hover:bg-green-800/70"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            <span className="text-base font-bold">
              {sidebarOpen ? "<" : "="}
            </span>
          </button>

          <div className="text-lg md:text-2xl text-white font-bold tracking-wide flex-1">
            SIGAP <span className="font-light">·</span> Bidang Konsumsi
          </div>
          <div className="mr-8 hidden md:block font-mono text-sm blur-none select-text opacity-75">
            {waktu.toLocaleString("id-ID", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="mr-5 hidden md:block text-xs text-green-100/70">
            {user?.email || ""}
          </div>
          <div className="mr-3">
            <BukaEPelaraButton
              label="e-Pelara"
              targetPath="/"
              className="!py-1.5 !px-3 !text-xs"
            />
          </div>
          <div className="relative mr-5">
            <NotificationBell />
            {notifikasi.length > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full w-4 h-4 bg-red-500 flex items-center justify-center text-xs text-white animate-bounce">
                !
              </span>
            )}
          </div>
          <div className="relative" ref={avatarRef}>
            <button onClick={() => setAvatarOpen(!avatarOpen)}>
              <ProfileAvatar
                userName={user?.nama_lengkap || user?.name || "User"}
              />
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900/95 rounded-xl shadow-lg border border-green-950 p-3 flex flex-col text-sm animate-fade-in-up">
                <div className="font-bold mb-2">
                  {user?.nama_lengkap || user?.name || "Pengguna"}
                </div>
                <div className="mb-2 text-green-200 text-xs">
                  {user?.unit_kerja || user?.unit_id || ""}
                </div>
                <button
                  onClick={() => {
                    setAvatarOpen(false);
                    window.location.href = "/logout";
                  }}
                  className="mt-2 py-1 px-3 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-auto bg-transparent">
          {children}
        </main>

        <footer className="flex-none h-10 flex items-center text-xs justify-between px-10 w-full bg-gradient-to-r from-green-900 to-green-800/70 text-green-100/80">
          <span>SIGAP Malut</span>
          <span>SIGAP Malut v1 | Bidang Konsumsi</span>
        </footer>
      </div>
    </div>
  );
}

function NotificationBell() {
  return (
    <span
      className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-200 rounded-full flex items-center justify-center text-yellow-900 text-2xl shadow-md ring-2 ring-yellow-100 animate-spin-slow"
      title="Notifikasi"
    >
      🔔
    </span>
  );
}

function ProfileAvatar({ userName = "User" }) {
  return (
    <span className="flex w-10 h-10 rounded-full bg-green-700 border-2 border-green-400 items-center justify-center text-white text-lg font-bold shadow-xl hover:ring-2 hover:ring-green-500 transition">
      {String(userName)
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

/* ==== Animasi CSS ==== */
const style = document.createElement("style");
style.textContent = `
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s cubic-bezier(0.4,0,0.2,1) both;
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
`;
if (typeof document !== "undefined") {
  document.head.appendChild(style);
}
