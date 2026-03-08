import React from "react";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import { Navigate } from "react-router-dom";
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

export default function DashboardUPTD() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  React.useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "U001",
        status: "akses",
        detail: "Akses modul Sertifikasi Prima",
      });
    }
  }, [user]);

  const unitKerja = user?.unit_kerja
    ? String(user.unit_kerja).toLowerCase()
    : "";
  const isAllowed =
    !!user &&
    (roleName === "kepala_uptd" ||
      roleName === "super_admin" ||
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      unitKerja.includes("uptd"));

  if (!isAllowed) return <Navigate to="/" replace />;

  const uptdModules = [
    { id: "U001", name: "Sertifikasi Prima" },
    { id: "U002", name: "Audit pangan" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-bold text-2xl mb-2">Dashboard UPTD</div>
        <div className="text-muted mb-4">
          Ringkasan KPI dan modul UPTD Balai Pengawasan Mutu dan Keamanan Pangan
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">59</span>
            <span className="text-xs text-purple-700">
              Indikator Monitoring
            </span>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">99%</span>
            <span className="text-xs text-purple-700">Compliance Alur</span>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">0</span>
            <span className="text-xs text-purple-700">Bypass Terdeteksi</span>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">98%</span>
            <span className="text-xs text-purple-700">Data Valid</span>
          </div>
        </div>

        <div className="font-bold mb-2">Modul UPTD</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uptdModules.map((modul) => (
            <div
              key={modul.id}
              className="bg-white border rounded-xl shadow p-4 flex flex-col gap-2"
            >
              <div className="font-semibold text-purple-700">{modul.name}</div>
              <div className="text-xs text-muted">ID: {modul.id}</div>
              <FieldMappingPreview modulId={modul.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
