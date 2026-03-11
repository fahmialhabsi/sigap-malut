// frontend/src/layouts/DashboardSekretariatLayout.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../utils/api";
import sekretariatModules from "../data/sekretariatModules";
import { roleIdToName } from "../utils/roleMap";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

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
                  ? "bg-slate-800/95 text-yellow-300"
                  : "bg-slate-900/90 text-slate-100 hover:bg-slate-800/90"
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

export default function DashboardSekretariatLayout({
  children,
  fallbackModules = sekretariatModules,
}) {
  const navigate = useNavigate();
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
  const [authChecked, setAuthChecked] = useState(false);
  const [modules, setModules] = useState(
    Array.isArray(fallbackModules) ? fallbackModules : [],
  );
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [approvalOpen, setApprovalOpen] = useState(false);
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

  useEffect(() => {
    let mounted = true;

    api
      .get("/auth/me")
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data || res.data?.user || res.data;
        setUser(data);
        setAuthChecked(true);

        const roleName = normalizeRoleName(data);
        const unit = data?.unit_kerja
          ? String(data.unit_kerja).toLowerCase()
          : "";
        const allowed =
          roleName === "sekretaris" ||
          roleName === "super_admin" ||
          roleName === "kepala_dinas" ||
          roleName === "gubernur" ||
          unit.includes("sekretariat");

        if (!data || !allowed) {
          window.location.href = "/";
        }
      })
      .catch(() => {
        if (!mounted) return;
        setAuthChecked(true);
        window.location.href = "/";
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    let mounted = true;

    const applyModules = (arr) => {
      if (!mounted) return;

      const rows = Array.isArray(arr) ? arr : [];
      if (!rows.length) {
        setModules(Array.isArray(fallbackModules) ? fallbackModules : []);
        return;
      }

      const sekretariatRows = rows.filter((row) => {
        const moduleId = String(row?.modul_id || row?.id || "")
          .trim()
          .toUpperCase();
        const bidang = String(
          row?.bidang ||
            row?.bidang_name ||
            row?.kategori ||
            row?.department ||
            "",
        )
          .trim()
          .toLowerCase();

        const byBidang = bidang.includes("sekretariat");
        const byId =
          moduleId.startsWith("SA") ||
          /^M0(0[1-9]|[1-2][0-9]|3[0-1])$/.test(moduleId);

        return isActiveModule(row) && (byBidang || byId);
      });

      const selected = sekretariatRows.length ? sekretariatRows : rows;
      const sorted = [...selected].sort((a, b) => {
        const orderA = Number(a?.menu_order ?? a?.menuOrder ?? 9999);
        const orderB = Number(b?.menu_order ?? b?.menuOrder ?? 9999);
        return orderA - orderB;
      });
      setModules(sorted);
    };

    api
      .get("/modules")
      .then((res) => {
        if (!mounted) return;

        const payload = res.data;
        const arr = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.result)
              ? payload.result
              : [];

        if (arr.length) {
          applyModules(arr);
          return;
        }

        fetch("/master-data/modules-sekretariat.json")
          .then((r) => r.json())
          .then((json) => applyModules(json))
          .catch(() => applyModules(fallbackModules));
      })
      .catch(() => {
        fetch("/master-data/modules-sekretariat.json")
          .then((r) => r.json())
          .then((json) => applyModules(json))
          .catch(() => applyModules(fallbackModules));
      });

    return () => {
      mounted = false;
    };
  }, [authChecked, fallbackModules]);

  // Fetch approval queue (submitted tasks awaiting sekretaris review)
  useEffect(() => {
    if (!authChecked) return;
    let mounted = true;
    api
      .get("/tasks", { params: { status: "submitted" } })
      .then((res) => {
        if (!mounted) return;
        const arr = Array.isArray(res.data?.data) ? res.data.data : [];
        setApprovalQueue(arr);
      })
      .catch(() => {
        // Silently fail - tasks endpoint may not exist yet
      });
    return () => { mounted = false; };
  }, [authChecked]);

  useEffect(() => {
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };

    if (avatarOpen) window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [avatarOpen]);

  const sekretariatMenu = useMemo(() => {
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
          path: `/module/${String(id).toLowerCase()}`,
        };
      });

    return [
      {
        id: "dashboard",
        name: "Dashboard",
        path: "/dashboard/sekretariat",
      },
      {
        id: "tasks",
        name: "Task Workflow",
        path: "/sekretariat/tasks",
      },
      ...modulRows,
    ];
  }, [modules]);

  const menuLabelMap = {
    DASHBOARD: "Dashboard Sekretariat",
    TASKS: "Task Workflow",
    M001: "Data ASN",
    M002: "Tracking KGB",
    M003: "Tracking Pangkat",
    M004: "Tracking Penghargaan",
    M005: "Data Cuti",
    M006: "Perjalanan Dinas",
    M007: "Diklat & Pelatihan",
    M008: "SKP",
    M009: "Database Kepegawaian",
  };

  const getMenuLabel = (moduleItem) => {
    const key = String(moduleItem?.id || "").toUpperCase();
    return menuLabelMap[key] || moduleItem?.name || "Modul";
  };

  const handleApprovalViewAll = () => {
    setApprovalOpen(false);
    navigate("/sekretariat/tasks");
  };

  return (
    <div className="fixed inset-0 flex font-inter bg-gradient-to-br from-black via-slate-950 to-slate-900 text-slate-100 select-none">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-20 bg-slate-950/45"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`h-full bg-black/95 z-30 flex flex-col items-center flex-shrink-0 transition-all duration-300 ${
          isMobile
            ? `${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed left-0 top-0 w-[275px] min-w-[275px]`
            : sidebarOpen
              ? "w-[275px] min-w-[275px]"
              : "w-[72px] min-w-[72px]"
        } border-r border-slate-800/80 shadow-xl`}
      >
        <div className="flex items-center justify-center w-full py-8">
          <img
            src="/Logo.png"
            alt="logo"
            className={`object-contain ${sidebarOpen ? "w-24 h-24" : "w-10 h-10"}`}
          />
        </div>

        <nav className="w-full flex flex-col gap-4 flex-1 justify-center px-3">
          {sekretariatMenu.length ? (
            sekretariatMenu.map((m) => (
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
            <div className="px-2 py-4 text-center text-sm text-slate-300/70">
              {sidebarOpen ? "Menu belum tersedia" : "-"}
            </div>
          )}
        </nav>

        <div className="py-6 w-full text-xs text-slate-300/70 text-center tracking-wide">
          {sidebarOpen ? "SIGAP Malut" : "SIGAP"}
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col bg-black/85 backdrop-blur">
        <header className="flex-none w-full h-[75px] bg-slate-950/90 flex items-center px-4 md:px-12 shadow-sm z-10 sticky top-0">
          <button
            type="button"
            className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-black/70 text-slate-100 hover:bg-slate-900/80"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            <span className="text-base font-bold">
              {sidebarOpen ? "<" : "="}
            </span>
          </button>

          <div className="text-lg md:text-2xl text-white font-bold tracking-wide flex-1">
            SIGAP <span className="font-light">·</span> Sekretariat
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
          <div className="mr-5 hidden md:block text-xs text-slate-300/80">
            {user?.email || ""}
          </div>
          <div className="relative mr-5">
            <NotificationBell />
            {notifikasi.length > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full w-4 h-4 bg-red-500 flex items-center justify-center text-xs text-white animate-bounce">
                !
              </span>
            )}
          </div>
          {/* Approval Queue Widget */}
          <div className="relative mr-3">
            <button
              onClick={() => setApprovalOpen((o) => !o)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/80 hover:bg-orange-800 border border-orange-700/60 rounded-lg text-orange-100 text-xs font-semibold transition"
              title="Antrian Persetujuan"
            >
              📥 Antrian
              {approvalQueue.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white rounded-full text-[10px] font-bold">
                  {approvalQueue.length}
                </span>
              )}
            </button>
            {approvalOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-black/97 rounded-xl shadow-2xl border border-slate-700 p-3 z-50 animate-fade-in-up">
                <div className="font-bold text-sm text-orange-300 mb-2">
                  Antrian Persetujuan ({approvalQueue.length})
                </div>
                {approvalQueue.length === 0 ? (
                  <div className="text-xs text-slate-400 py-2">Tidak ada tugas menunggu persetujuan</div>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {approvalQueue.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 cursor-pointer"
                        onClick={() => {
                          setApprovalOpen(false);
                          navigate(`/sekretariat/tasks/${t.id}`);
                        }}
                      >
                        <span className="text-orange-400 mt-0.5 flex-shrink-0">📋</span>
                        <div>
                          <div className="text-xs font-semibold text-white">{t.title}</div>
                          {t.modul_id && (
                            <div className="text-[10px] text-slate-400 font-mono">{t.modul_id}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={handleApprovalViewAll}
                  className="mt-3 w-full text-center text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Lihat Semua Tugas →
                </button>
              </div>
            )}
          </div>
          <div className="relative" ref={avatarRef}>
            <button onClick={() => setAvatarOpen(!avatarOpen)}>
              <ProfileAvatar
                userName={user?.nama_lengkap || user?.name || "User"}
              />
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-black/95 rounded-xl shadow-lg border border-slate-700 p-3 flex flex-col text-sm animate-fade-in-up">
                <div className="font-bold mb-2">
                  {user?.nama_lengkap || user?.name || "Pengguna"}
                </div>
                <div className="mb-2 text-slate-300 text-xs">
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

        <footer className="flex-none h-10 flex items-center text-xs justify-between px-10 w-full bg-gradient-to-r from-black to-slate-900/90 text-slate-300/85">
          <span>SIGAP Malut</span>
          <span>SIGAP Malut v1 | Sekretariat</span>
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
    <span className="flex w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 items-center justify-center text-white text-lg font-bold shadow-xl hover:ring-2 hover:ring-slate-500 transition">
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
