import React, { startTransition, useEffect, useRef, useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import api from "../../utils/api";
import {
  emptyDashboardSummary,
  fetchDashboardSummary,
} from "../../services/dashboardService";
import superAdminModules from "../../data/superAdminModules";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function formatDateTime(value) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

// Hero Card Component
function HeroCard({ title, value, info, accent = "blue" }) {
  const accentMap = {
    emerald: {
      bg: "bg-gradient-to-t from-black/95 to-slate-900/85",
      border: "border-slate-700",
      title: "text-slate-200",
      value: "text-slate-100",
    },
    blue: {
      bg: "bg-gradient-to-t from-slate-950/90 to-blue-950/70",
      border: "border-blue-700",
      title: "text-blue-200",
      value: "text-blue-100",
    },
    amber: {
      bg: "bg-gradient-to-t from-slate-950/90 to-amber-950/70",
      border: "border-amber-700",
      title: "text-amber-200",
      value: "text-amber-100",
    },
    red: {
      bg: "bg-gradient-to-t from-slate-950/90 to-red-950/70",
      border: "border-red-700",
      title: "text-red-200",
      value: "text-red-100",
    },
  };

  const theme = accentMap[accent] || accentMap.blue;

  return (
    <div
      className={`rounded-2xl border-2 px-4 py-3 min-h-[86px] flex flex-col justify-between shadow-lg ${theme.bg} ${theme.border}`}
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className={`text-2xl font-extrabold tracking-wide ${theme.value}`}>
        {value}
      </div>
      <div>
        <div className={`text-xs font-semibold ${theme.title}`}>{title}</div>
        <div className="text-[11px] text-slate-200/80 mt-1">{info}</div>
      </div>
    </div>
  );
}

// Panel Box Component
function PanelBox({ title, accent = "blue", children, className = "" }) {
  const accentMap = {
    emerald: "text-slate-200",
    blue: "text-blue-200",
    amber: "text-amber-200",
    red: "text-red-200",
  };
  const titleColor = accentMap[accent] || accentMap.blue;

  return (
    <section
      className={`rounded-2xl p-7 flex flex-col border border-slate-800/85 shadow-md flex-1 bg-slate-950/88 ${className}`}
      style={{
        backdropFilter: "blur(17px)",
        WebkitBackdropFilter: "blur(17px)",
      }}
    >
      <h2
        className={`font-bold mb-4 text-xl flex items-center gap-2 ${titleColor}`}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

// Sidebar Item Component
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

export default function DashboardSuperAdmin() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768;
  });
  const [waktu, setWaktu] = useState(new Date());
  const [userData, setUserData] = useState(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState(
    emptyDashboardSummary,
  );
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const avatarRef = useRef();

  // Auth check
  if (!user || roleName !== "super_admin") return <Navigate to="/" replace />;

  // Responsive handler
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

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user info
  useEffect(() => {
    let mounted = true;

    api
      .get("/auth/me")
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data || res.data?.user || res.data;
        setUserData(data);
      })
      .catch(() => {
        if (!mounted) return;
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    setSummaryLoading(true);
    fetchDashboardSummary()
      .then((summary) => {
        if (!mounted) return;
        startTransition(() => {
          setDashboardSummary(summary);
        });
        setSummaryError("");
      })
      .catch((error) => {
        if (!mounted) return;
        setSummaryError(
          error?.response?.data?.message ||
            error?.message ||
            "Gagal memuat ringkasan dashboard",
        );
      })
      .finally(() => {
        if (!mounted) return;
        setSummaryLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Avatar dropdown handler
  useEffect(() => {
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };

    if (avatarOpen) window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [avatarOpen]);

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard Super Admin",
      path: "/dashboard/superadmin",
    },
    { id: "SA01", name: "Monitoring 50 indikator", path: "/module/sa01" },
    { id: "SA02", name: "Tool modul tanpa coding", path: "/module/sa02" },
    { id: "SA03", name: "Tata Naskah Dinas", path: "/module/sa03" },
    { id: "SA04", name: "Database peraturan", path: "/module/sa04" },
    { id: "SA05", name: "Manajemen User", path: "/user-management" },
  ];

  const formatWaktu = () => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agt",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const day = days[waktu.getDay()];
    const date = waktu.getDate();
    const month = months[waktu.getMonth()];
    const year = waktu.getFullYear();
    const hours = String(waktu.getHours()).padStart(2, "0");
    const minutes = String(waktu.getMinutes()).padStart(2, "0");
    const seconds = String(waktu.getSeconds()).padStart(2, "0");

    return `${day}, ${date} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
  };

  const serviceStats = dashboardSummary.service_statistics;
  const workflowStats = dashboardSummary.workflow_statistics;
  const approvalStats = dashboardSummary.approval_statistics;
  const moduleActivity = dashboardSummary.module_activity;

  const kpiData = [
    {
      label: "Modul Terdaftar",
      value: serviceStats.total_registered_modules,
      info: `${serviceStats.total_tasks} total tugas aktif di sistem`,
    },
    {
      label: "Workflow Terbuka",
      value: serviceStats.open_workflows,
      info: `${serviceStats.total_workflows} total instance workflow`,
    },
    {
      label: "Approval Hari Ini",
      value: approvalStats.approvals_today,
      info: `${approvalStats.total_approvals} total approval tercatat`,
    },
    {
      label: "Aktivitas Modul",
      value: moduleActivity.length,
      info: "Jumlah modul dengan event audit terbaru",
    },
  ];

  return (
    <div className="fixed inset-0 flex font-inter bg-gradient-to-br from-black via-slate-950 to-slate-900 text-slate-100 select-none">
      {/* Sidebar Backdrop */}
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-20 bg-slate-950/45"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`h-full bg-black/95 z-30 flex flex-col items-center flex-shrink-0 transition-all duration-300 ${
          isMobile
            ? `${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed left-0 top-0 w-[275px] min-w-[275px]`
            : sidebarOpen
              ? "w-[275px] min-w-[275px]"
              : "w-[72px] min-w-[72px]"
        } border-r border-slate-800/80 shadow-xl`}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center w-full py-8">
          <img
            src="/Logo.png"
            alt="Logo"
            className={`${sidebarOpen ? "w-24 h-24" : "w-12 h-12"} object-contain transition-all`}
          />
        </div>

        {/* Menu Items */}
        <div
          className={`flex flex-col ${sidebarOpen ? "w-[245px] gap-y-2 px-4" : "w-[58px] gap-y-2 px-1.5"} mt-6 transition-all flex-1 overflow-y-auto`}
        >
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              to={item.path}
              label={item.name}
              sidebarOpen={sidebarOpen}
              onNavigate={() => {
                if (isMobile) setSidebarOpen(false);
              }}
            />
          ))}
        </div>

        {/* Toggle Sidebar Button (Desktop Only) */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-6 px-4 py-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl text-white font-semibold shadow-md border border-slate-700/80 transition"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="h-20 flex items-center justify-between px-8 bg-slate-950/90 border-b border-slate-800/85 shadow-lg z-10"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-lg text-white"
              >
                ☰
              </button>
            )}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                SIGAP · Super Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-slate-200/90">{formatWaktu()}</div>
            <div className="text-sm text-slate-300">
              {userData?.email || user?.email || "superadmin@sigap.id"}
            </div>

            {/* Avatar Dropdown */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition"
              >
                {userData?.name?.[0]?.toUpperCase() || "SA"}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 border border-slate-700/90 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-700/70">
                    <div className="text-sm font-semibold text-slate-100">
                      {userData?.name || "Super Admin"}
                    </div>
                    <div className="text-xs text-slate-300/80">
                      {userData?.email || user?.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-slate-800/90"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-6 md:px-12 py-8 space-y-8">
            {/* Hero Banner */}
            <div
              className="bg-gradient-to-r from-black/95 to-slate-900/92 border-2 border-slate-800/85 rounded-2xl p-8 shadow-2xl"
              style={{
                backdropFilter: "blur(15px)",
                WebkitBackdropFilter: "blur(15px)",
              }}
            >
              <h1 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
                <span className="text-4xl">🛡️</span>
                Dashboard Super Admin
              </h1>
              <p className="text-slate-200/85 text-base leading-relaxed">
                Executive Control Center — Semua Modul, KPI, dan Alert
              </p>
              <div className="mt-3 text-sm text-slate-300/85">
                {summaryLoading
                  ? "Memuat statistik backend..."
                  : summaryError ||
                    `Sinkron terakhir ${formatDateTime(dashboardSummary.generated_at)}`}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  className="bg-blue-900 hover:bg-blue-800 text-blue-100 px-5 py-2 rounded-lg font-semibold shadow border border-blue-700/70 transition"
                  onClick={() => alert("Generate Mendagri Report")}
                >
                  📄 Generate Mendagri Report
                </button>
                <button
                  className="bg-slate-900 hover:bg-slate-800 text-slate-100 px-5 py-2 rounded-lg font-semibold shadow border border-slate-700/70 transition"
                  onClick={() => alert("Open AI Inbox")}
                >
                  🤖 Open AI Inbox
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <HeroCard
                title={kpiData[0].label}
                value={kpiData[0].value}
                info={kpiData[0].info}
                accent="blue"
              />
              <HeroCard
                title={kpiData[1].label}
                value={kpiData[1].value}
                info={kpiData[1].info}
                accent="emerald"
              />
              <HeroCard
                title={kpiData[2].label}
                value={kpiData[2].value}
                info={kpiData[2].info}
                accent="amber"
              />
              <HeroCard
                title={kpiData[3].label}
                value={kpiData[3].value}
                info={kpiData[3].info}
                accent="red"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <PanelBox title="Status Workflow" accent="amber">
                {workflowStats.state_breakdown.length === 0 ? (
                  <div className="text-sm text-slate-300/85">
                    {summaryLoading
                      ? "Menarik status workflow..."
                      : "Belum ada data workflow yang dapat ditampilkan."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workflowStats.state_breakdown.map((item) => (
                      <div
                        key={item.state}
                        className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-black/35 px-4 py-3"
                      >
                        <span className="text-slate-200 capitalize">
                          {String(item.state || "unknown").replace(/_/g, " ")}
                        </span>
                        <span className="text-xl font-bold text-amber-200">
                          {item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </PanelBox>

              <PanelBox title="Approval Ringkas" accent="blue">
                {approvalStats.action_breakdown.length === 0 ? (
                  <div className="text-sm text-slate-300/85">
                    {summaryLoading
                      ? "Menarik statistik approval..."
                      : "Belum ada aktivitas approval yang tercatat."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvalStats.action_breakdown.map((item) => (
                      <div
                        key={item.action}
                        className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-black/35 px-4 py-3"
                      >
                        <span className="text-slate-200 capitalize">
                          {String(item.action || "unknown").replace(/_/g, " ")}
                        </span>
                        <span className="text-xl font-bold text-blue-200">
                          {item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </PanelBox>

              <PanelBox title="Aktivitas Modul" accent="emerald">
                {moduleActivity.length === 0 ? (
                  <div className="text-sm text-slate-300/85">
                    {summaryLoading
                      ? "Menarik aktivitas modul..."
                      : "Belum ada event audit modul yang tersedia."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {moduleActivity.slice(0, 6).map((item) => (
                      <div
                        key={`${item.module_id}-${item.last_event_at}`}
                        className="rounded-xl border border-slate-800/80 bg-black/35 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold text-slate-100">
                            {item.module_id}
                          </span>
                          <span className="text-emerald-200 font-bold">
                            {item.total_events} event
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-300/80">
                          Event terakhir {formatDateTime(item.last_event_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PanelBox>
            </div>

            {/* Module Section */}
            <PanelBox title="Modul Super Admin" accent="blue">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {superAdminModules.map((modul, idx) => (
                  <div
                    key={modul.id}
                    className={`bg-gradient-to-br from-slate-900/92 to-black/85 border-2 border-slate-700/70 rounded-xl p-5 flex flex-col gap-3 shadow-lg hover:scale-105 transition ${modul.id === "SA05" ? "cursor-pointer" : ""}`}
                    style={{
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                    onClick={() => {
                      if (modul.id === "SA05") {
                        window.location.href = "/user-management";
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {["📊", "🛠️", "📄", "🗄️", "👤"][idx % 5]}
                      </span>
                      <div className="font-bold text-lg text-slate-100">
                        {modul.name}
                      </div>
                    </div>
                    <div className="text-xs text-slate-300/80 font-mono">
                      ID: {modul.id}
                    </div>
                    {modul.id === "SA05" && (
                      <button className="mt-2 bg-blue-900 hover:bg-blue-800 text-blue-100 px-4 py-2 rounded-lg font-semibold text-sm shadow border border-blue-700/70 transition">
                        Tambah User
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </PanelBox>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="h-12 flex items-center justify-between px-8 bg-black border-t border-slate-800/85 text-slate-400 text-sm"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span>SIGAP Malut v1.0 | Dinas Pangan Maluku Utara</span>
          <span>Super Admin Mode</span>
        </footer>
      </div>
    </div>
  );
}
