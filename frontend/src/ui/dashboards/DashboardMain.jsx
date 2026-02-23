import useAuthStore from "../../stores/authStore";
import { Navigate, useNavigate } from "react-router-dom";
import ProfessionalCharts from "../components/ProfessionalCharts";

export default function DashboardMain() {
  const bidangList = [
    {
      label: "Sekretariat",
      path: "/dashboard/sekretariat",
      roles: ["sekretaris"],
    },
    {
      label: "Bidang Ketersediaan",
      path: "/dashboard/ketersediaan",
      roles: ["kepala_bidang_ketersediaan"],
    },
    {
      label: "Bidang Distribusi",
      path: "/dashboard/distribusi",
      roles: ["kepala_bidang_distribusi"],
    },
    {
      label: "Bidang Konsumsi",
      path: "/dashboard/konsumsi",
      roles: ["kepala_bidang_konsumsi"],
    },
    { label: "UPTD", path: "/dashboard/uptd", roles: ["kepala_uptd"] },
  ];
  // Central RBAC utility
  const hasRole = (role) => user && user.role === role;

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (hasRole("super_admin"))
    return <Navigate to="/dashboard/superadmin" replace />;
  const allowedBidang = bidangList.filter((b) => hasRole(b.roles[0]));
  if (allowedBidang.length === 0) return <Navigate to="/" replace />;
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigasi Dashboard Bidang */}
      <div className="bg-slate-800 rounded-xl shadow p-6 flex flex-col gap-2 mb-8 border border-slate-700">
        <div className="font-bold text-lg mb-4 text-slate-100">
          Navigasi Dashboard Bidang
        </div>
        <div className="flex flex-wrap gap-4">
          {allowedBidang.map((b) => (
            <button
              key={b.path}
              onClick={() => navigate(b.path)}
              className="bg-primary rounded px-6 py-3 font-semibold shadow hover:bg-primary-700 transition text-primary-foreground text-base border border-slate-600"
              style={{ color: "#f1f5f9" }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      {/* ...existing code... */}
      <ProfessionalCharts />
      {/* ...existing code... */}
    </div>
  );
}
