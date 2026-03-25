// frontend/src/ui/dashboards/DashboardMain.jsx

import useAuthStore from "../../stores/authStore";
import { Navigate, useNavigate } from "react-router-dom";
import ProfessionalCharts from "../components/ProfessionalCharts";
import { roleIdToName } from "../../utils/roleMap";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function normalizeUnit(user) {
  const v = user?.unit_kerja || user?.unit_id || "";
  return v ? String(v).toLowerCase() : "";
}

export default function DashboardMain() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);

  if (roleName === "super_admin")
    return <Navigate to="/dashboard/superadmin" replace />;

  if (roleName === "gubernur" || roleName === "kepala_dinas") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-xl shadow p-6 flex flex-col gap-2 mb-8 border border-slate-700">
          <div className="font-bold text-lg mb-2 text-slate-100">
            Dashboard Eksekutif
          </div>
          <div className="text-slate-300 text-sm">
            Ringkasan lintas bidang untuk monitoring (Gubernur / Kepala Dinas).
          </div>
        </div>
        <ProfessionalCharts />
      </div>
    );
  }

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
    return <Navigate to="/dashboard/sekretariat" replace />;
  if (roleName === "kepala_bidang_ketersediaan")
    return <Navigate to="/dashboard/ketersediaan" replace />;
  if (roleName === "kepala_bidang_distribusi")
    return <Navigate to="/dashboard/distribusi" replace />;
  if (roleName === "kepala_bidang_konsumsi")
    return <Navigate to="/dashboard/konsumsi" replace />;
  if (roleName === "kepala_uptd")
    return <Navigate to="/dashboard/uptd" replace />;

  // Jabatan Fungsional
  if (roleName === "jabatan_fungsional" || roleName === "pejabat_fungsional")
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
  if (roleName === "bendahara")
    return <Navigate to="/dashboard/bendahara" replace />;

  // Staf Pelaksana
  if (roleName === "pelaksana" || roleName === "staf_pelaksana")
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
