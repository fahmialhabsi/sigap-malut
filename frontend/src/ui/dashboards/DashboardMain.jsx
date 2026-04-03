// frontend/src/ui/dashboards/DashboardMain.jsx

import useAuthStore from "../../stores/authStore";
import { Navigate, useNavigate } from "react-router-dom";
import ProfessionalCharts from "../components/ProfessionalCharts";
import { normalizeRoleKey } from "../../utils/normalizeRole";

function normalizeUnit(user) {
  const v = user?.unit_kerja || user?.unit_id || "";
  return v ? String(v).toLowerCase() : "";
}

export default function DashboardMain() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  const roleName = normalizeRoleKey(user);
  const unit = normalizeUnit(user);

  if (roleName === "super_admin")
    return <Navigate to="/dashboard/superadmin" replace />;

  if (roleName === "gubernur") return <Navigate to="/dashboard/gubernur" replace />;
  if (roleName === "kepala_dinas") return <Navigate to="/dashboard/kepala-dinas" replace />;

  // Kabid generik -> arahkan berdasarkan unit
  if (roleName === "kepala_bidang") {
    if (unit.includes("ketersediaan"))
      return <Navigate to="/dashboard/ketersediaan" replace />;
    if (unit.includes("distribusi"))
      return <Navigate to="/dashboard/distribusi" replace />;
    if (unit.includes("konsumsi"))
      return <Navigate to="/dashboard/konsumsi" replace />;

    // jika unit tidak jelas, fallback ke landing
    return <Navigate to="/" replace />;
  }

  // Role spesifik (kalau nanti backend mengirim spesifik)
  if (roleName === "sekretaris")
    return <Navigate to="/dashboard/sekretaris" replace />;
  if (roleName === "kepala_bidang_ketersediaan")
    return <Navigate to="/dashboard/ketersediaan" replace />;
  if (roleName === "kepala_bidang_distribusi")
    return <Navigate to="/dashboard/distribusi" replace />;
  if (roleName === "kepala_bidang_konsumsi")
    return <Navigate to="/dashboard/konsumsi" replace />;
  if (roleName === "kepala_uptd")
    return <Navigate to="/dashboard/uptd" replace />;

  // Jabatan Fungsional (sekretariat: perencanaan / keuangan, bidang, UPTD)
  if (
    roleName === "jabatan_fungsional" ||
    roleName === "pejabat_fungsional" ||
    roleName === "fungsional" ||
    roleName === "fungsional_perencana" ||
    roleName === "fungsional_perencanaan" ||
    roleName === "fungsional_keuangan" ||
    roleName === "fungsional_analis" ||
    roleName === "fungsional_ketersediaan" ||
    roleName === "fungsional_distribusi" ||
    roleName === "fungsional_konsumsi"
  )
    return <Navigate to="/dashboard/fungsional" replace />;

  // Kasubag Umum & Kepegawaian
  if (
    roleName === "kasubag" ||
    roleName === "kasubag_umum_kepegawaian" ||
    roleName === "kasubbag" ||
    roleName === "kasubbag_umum" ||
    roleName === "kasubbag_kepegawaian"
  )
    return <Navigate to="/dashboard/kasubag" replace />;

  // Bendahara
  if (
    roleName === "bendahara" ||
    roleName === "bendahara_pengeluaran" ||
    roleName === "bendahara_gaji" ||
    roleName === "bendahara_barang"
  )
    return <Navigate to="/dashboard/bendahara" replace />;

  // Staf Pelaksana
  if (
    roleName === "pelaksana" ||
    roleName === "staf_pelaksana" ||
    roleName === "pelaksana_ketersediaan" ||
    roleName === "pelaksana_distribusi" ||
    roleName === "pelaksana_konsumsi"
  )
    return <Navigate to="/dashboard/pelaksana" replace />;

  // Kasubag Tata Usaha UPTD
  if (
    roleName === "subbag_tata_usaha" ||
    roleName === "kasubag_uptd" ||
    roleName === "kasubbag_tata_usaha"
  )
    return <Navigate to="/dashboard/kasubag-uptd" replace />;

  // Kepala Seksi UPTD
  if (
    roleName === "seksi_manajemen_mutu" ||
    roleName === "seksi_manajemen_teknis" ||
    roleName === "kasi_uptd" ||
    roleName === "kasi_mutu" ||
    roleName === "kasi_teknis"
  )
    return <Navigate to="/dashboard/kasi-uptd" replace />;

  return <Navigate to="/" replace />;
}
