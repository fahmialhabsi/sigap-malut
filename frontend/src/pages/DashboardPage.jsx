import DashboardMain from "../ui/dashboards/DashboardMain";
import useAuthStore from "../stores/authStore";
import { normalizeRoleKey } from "../utils/normalizeRole";

import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Anda belum login.</div>
        <div>Silakan login untuk mengakses dashboard.</div>
      </div>
    );
  }

  const roleName = normalizeRoleKey(user);

  if (roleName === "sekretaris") {
    navigate("/dashboard/sekretaris", { replace: true });
    return null;
  }

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
    "fungsional_perencana",
    "fungsional_perencanaan",
    "fungsional_keuangan",
    "fungsional_ketersediaan",
    "fungsional_distribusi",
    "fungsional_konsumsi",
    "fungsional_analis",
    "kasubag",
    "kasubag_umum_kepegawaian",
    "kasubbag",
    "kasubbag_umum",
    "kasubbag_kepegawaian",
    "bendahara",
    "bendahara_pengeluaran",
    "bendahara_gaji",
    "bendahara_barang",
    "pelaksana",
    "staf_pelaksana",
    "pelaksana_ketersediaan",
    "pelaksana_distribusi",
    "pelaksana_konsumsi",
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
