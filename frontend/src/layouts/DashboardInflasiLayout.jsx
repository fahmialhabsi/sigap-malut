import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import LiveKPIBadge from "../components/realtime/LiveKPIBadge";
import AppSidebar, {
  MAIN_MARGIN_EXPANDED,
  MAIN_MARGIN_COLLAPSED,
} from "../components/design/AppSidebar";

const NAV_ITEMS = [
  {
    label: "Ringkasan Inflasi",
    path: "/dashboard/inflasi",
    icon: "📊",
    end: true,
  },
  { label: "Harga Komoditas", path: "/dashboard/inflasi/harga", icon: "💰" },
  { label: "Rapat Mendagri", path: "/dashboard/inflasi/mendagri", icon: "📋" },
  {
    label: "Prediksi & Rekomendasi",
    path: "/dashboard/inflasi/prediksi",
    icon: "🤖",
  },
];

export default function DashboardInflasiLayout({ children }) {
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Sidebar — design tokens: 280px / 72px */}
      <AppSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        isMobile={isMobile}
        navItems={NAV_ITEMS}
        logo={{
          icon: "📈",
          title: "SIGAP MALUT",
          subtitle: "Dashboard Inflasi",
        }}
      />

      {/* Main area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile
            ? "ml-0"
            : sidebarOpen
              ? MAIN_MARGIN_EXPANDED
              : MAIN_MARGIN_COLLAPSED
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="mr-3 text-slate-500 hover:text-slate-700"
            >
              ☰
            </button>
          )}
          <div className="font-semibold text-slate-700 flex items-center gap-2">
            <span>📈</span> Dashboard Inflasi & Stabilisasi Harga
            <LiveKPIBadge type="inflasi" />
          </div>
          <div className="relative">
            <button
              onClick={() => setAvatarOpen((v) => !v)}
              className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "var(--color-primary)" }}
              aria-label="User menu"
            >
              {user?.nama?.[0]?.toUpperCase() ||
                user?.username?.[0]?.toUpperCase() ||
                "U"}
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="font-semibold text-sm text-slate-800">
                    {user?.nama || user?.username}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user?.role || "—"}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Overlay (mobile) */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
