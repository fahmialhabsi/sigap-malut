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

  const allowedRoles = [
    "super_admin",
    "sekretaris",
    "kepala_dinas",
    "gubernur",

    // IMPORTANT: backend saat ini mengirim KEPALA_BIDANG (generik)
    "kepala_bidang",

    // tetap dukung role spesifik jika nanti backend sudah benar
    "kepala_bidang_ketersediaan",
    "kepala_bidang_distribusi",
    "kepala_bidang_konsumsi",

    "kepala_uptd",

    // A-10: 6 dashboard baru (Fase 3)
    "jabatan_fungsional",
    "pejabat_fungsional",
    "kasubag",
    "kasubag_umum_kepegawaian",
    "kasubbag",
    "kasubbag_umum",
    "kasubbag_kepegawaian",
    "bendahara",
    "pelaksana",
    "staf_pelaksana",
    "subbag_tata_usaha",
    "kasubag_uptd",
    "kasubbag_tata_usaha",
    "seksi_manajemen_mutu",
    "seksi_manajemen_teknis",
    "kasi_uptd",
    "kasi_mutu",
    "kasi_teknis",
  ];

  if (!roleName || !allowedRoles.includes(roleName)) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Akses ditolak.</div>
        <div>Anda tidak memiliki akses ke dashboard ini.</div>
      </div>
    );
  }

  return <DashboardMain />;
}
