import { Navigate } from "react-router-dom";
import DashboardMain from "../ui/dashboards/DashboardMain";
import useAuthStore from "../stores/authStore";
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

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Anda belum login.</div>
        <div>Silakan login untuk mengakses dashboard.</div>
      </div>
    );
  }

  const roleName = normalizeRoleName(user);

  // Redirect khusus untuk dashboard spesifik
  if (roleName === "fungsional_ketersediaan") {
    return <Navigate to="/dashboard/fungsional-ketersediaan" replace />;
  }
  if (roleName === "fungsional_distribusi") {
    return <Navigate to="/dashboard/fungsional-distribusi" replace />;
  }
  if (roleName === "fungsional_konsumsi") {
    return <Navigate to="/dashboard/fungsional-konsumsi" replace />;
  }
  if (roleName === "fungsional_perencana") {
    return <Navigate to="/dashboard/fungsional-perencanaan" replace />;
  }
  if (roleName === "fungsional_keuangan") {
    return <Navigate to="/dashboard/fungsional-keuangan" replace />;
  }
  if (roleName === "fungsional_analis") {
    return <Navigate to="/dashboard/fungsional-keuangan" replace />;
  }
  if (roleName === "fungsional_uptd") {
    return <Navigate to="/dashboard/fungsional-uptd" replace />;
  }
  if (roleName === "fungsional_uptd_mutu") {
    return <Navigate to="/dashboard/fungsional-uptd-mutu" replace />;
  }
  if (roleName === "fungsional_uptd_teknis") {
    return <Navigate to="/dashboard/fungsional-uptd-teknis" replace />;
  }

  // Fallback: dashboard main (untuk role lain)
  return <DashboardMain />;
}
