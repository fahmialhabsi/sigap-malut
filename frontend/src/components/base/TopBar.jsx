import React from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import RoleSwitch from "../ui/RoleSwitch";
import DateRangeSelector from "../ui/DateRangeSelector";
import GlobalExportButton from "../ui/GlobalExportButton";
import QuickSearch from "../ui/QuickSearch";
import SkipToContent from "../ui/SkipToContent";
import HighContrastToggle from "../ui/HighContrastToggle";

export default function TopBar() {
  const { user, logout } = useAuthStore();
  const [search, setSearch] = React.useState("");
  const [period, setPeriod] = React.useState("2026-02");
  const [role, setRole] = React.useState(user?.role || "sekretaris");
  const [highContrast, setHighContrast] = React.useState(false);

  React.useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  // Define allowed navigation links by role
  const navLinks = [
    {
      label: "Dashboard Sekretariat",
      to: "/dashboard/sekretariat",
      roles: ["super_admin", "sekretaris"],
    },
    {
      label: "Dashboard Ketersediaan",
      to: "/dashboard/ketersediaan",
      roles: ["super_admin", "kepala_bidang_ketersediaan"],
    },
    {
      label: "Dashboard Distribusi",
      to: "/dashboard/distribusi",
      roles: ["super_admin", "kepala_bidang_distribusi"],
    },
    {
      label: "Dashboard Konsumsi",
      to: "/dashboard/konsumsi",
      roles: ["super_admin", "kepala_bidang_konsumsi"],
    },
  ];

  // Filter links sesuai role
  const allowedLinks = navLinks.filter((l) => l.roles.includes(role));

  return (
    <>
      <SkipToContent />
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-600">🏛️ SIGAP Malut</h1>
            <QuickSearch value={search} onChange={setSearch} />
            <RoleSwitch
              roles={[
                "super_admin",
                "sekretaris",
                "kepala_bidang_ketersediaan",
                "kepala_bidang_distribusi",
                "kepala_bidang_konsumsi",
                "kepala_uptd",
              ]}
              currentRole={role}
              onSwitch={setRole}
            />
            <DateRangeSelector value={period} onChange={setPeriod} />
            <GlobalExportButton onExport={() => alert("Exporting data...")} />
            {/* Navigation links filtered by role */}
            <div className="flex gap-2 ml-6">
              {allowedLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-blue-600 hover:underline font-medium px-3 py-1 rounded"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Notifications"
            >
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            <HighContrastToggle
              enabled={highContrast}
              onToggle={() => setHighContrast((v) => !v)}
            />

            <div className="flex items-center gap-2 border-l pl-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {user?.nama_lengkap || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || "Staff"}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Logout"
                aria-label="Logout"
              >
                <span className="text-xl">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
