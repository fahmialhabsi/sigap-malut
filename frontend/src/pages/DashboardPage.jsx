import DashboardMain from "../ui/dashboards/DashboardMain";
import useAuthStore from "../stores/authStore";

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

  const allowedRoles = [
    "super_admin",
    "sekretaris",
    "kepala_bidang_ketersediaan",
    "kepala_bidang_distribusi",
    "kepala_bidang_konsumsi",
    "kepala_uptd",
    "gubernur",
    "publik",
  ];

  const roleIdToName = {
    "167289b5-bcdb-4749-a404-f6e1360a9c86": "super_admin",
    // ... tambahkan semua role UUID lain sesuai schema
  };
  const roleName = roleIdToName[user.role_id];

  if (!allowedRoles.includes(roleName)) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Akses ditolak.</div>
        <div>Anda tidak memiliki akses ke dashboard ini.</div>
      </div>
    );
  }

  return <DashboardMain />;
}
