import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import FieldMappingPreview from "../../components/FieldMappingPreview";
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

export default function DashboardKetersediaan() {
  const user = useAuthStore((state) => state.user);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    try {
      const pref = localStorage.getItem("theme");
      const initial =
        pref === "dark" ||
        (!pref &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDark(initial);
      if (initial) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch (e) {}
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (e) {}
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  const ketersediaanModules = [
    { id: "K001", name: "Master data komoditas" },
    { id: "K002", name: "Produksi pangan" },
  ];

  const roleName = normalizeRoleName(user);
  const jabatan = user?.jabatan ? String(user.jabatan).toLowerCase() : "";
  const unitKerja = user?.unit_kerja
    ? String(user.unit_kerja).toLowerCase()
    : "";

  // Allowed:
  // - Kabid Ketersediaan / Super Admin
  // - Eksekutif (Kepala Dinas/Gubernur) boleh monitoring lintas bidang (opsional sesuai dokumenSistem)
  const isKetersediaan =
    roleName === "super_admin" ||
    roleName === "kepala_bidang_ketersediaan" ||
    roleName === "kepala_dinas" ||
    roleName === "gubernur" ||
    unitKerja.includes("ketersediaan") ||
    jabatan.includes("kepala bidang");

  React.useEffect(() => {
    if (user && isKetersediaan) {
      workflowStatusUpdateAPI({
        user,
        modulId: "K001",
        status: "akses",
        detail: "Akses modul Master data komoditas",
      });
    }
  }, [user, isKetersediaan]);

  if (!user || !isKetersediaan) return <Navigate to="/" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow p-6 mb-8 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-2xl">Dashboard Bidang Ketersediaan</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm"
            >
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        <div className="text-muted mb-4 dark:text-gray-300">
          Ringkasan KPI dan modul Bidang Ketersediaan
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              25
            </span>
            <span className="text-xs text-green-700 dark:text-green-300">
              Indikator Monitoring
            </span>
          </div>
          <div className="bg-green-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              98%
            </span>
            <span className="text-xs text-green-700 dark:text-green-300">
              Compliance Alur
            </span>
          </div>
          <div className="bg-green-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              1
            </span>
            <span className="text-xs text-green-700 dark:text-green-300">
              Bypass Terdeteksi
            </span>
          </div>
          <div className="bg-green-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              97%
            </span>
            <span className="text-xs text-green-700 dark:text-green-300">
              Data Valid
            </span>
          </div>
        </div>

        <div className="font-bold mb-2">Modul Bidang Ketersediaan</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {ketersediaanModules.map((modul) => (
            <div
              key={modul.id}
              className="bg-white border rounded-xl shadow p-4 flex flex-col gap-2 dark:bg-gray-800 dark:border-gray-700 min-h-[360px]"
            >
              <div className="font-semibold text-green-700 dark:text-green-300">
                {modul.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                ID: {modul.id}
              </div>
              <FieldMappingPreview modulId={modul.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
