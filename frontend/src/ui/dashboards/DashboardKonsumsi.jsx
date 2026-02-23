import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import FieldMappingPreview from "../../components/FieldMappingPreview";

export default function DashboardKonsumsi() {
  const user = useAuthStore((state) => state.user);

  // Modul Konsumsi (dummy, bisa diambil dari config jika ada)
  const konsumsiModules = [
    { id: "C001", name: "Konsumsi pangan" },
    { id: "C002", name: "Skor PPH" },
    // Tambahkan modul lain sesuai kebutuhan
  ];

  // Contoh: log status workflow saat user mengakses modul
  React.useEffect(() => {
    if (user && user.role === "kepala_bidang_konsumsi") {
      workflowStatusUpdateAPI({
        user,
        modulId: "C001",
        status: "akses",
        detail: "Akses modul Konsumsi pangan",
      });
    }
  }, [user]);

  const hasRole = (role) => user && user.role === role;
  if (!hasRole("kepala_bidang_konsumsi")) return <Navigate to="/" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-bold text-2xl mb-2">Dashboard Bidang Konsumsi</div>
        <div className="text-muted mb-4">
          Ringkasan KPI dan modul Bidang Konsumsi
        </div>
        {/* KPI Konsumsi (dummy) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-pink-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">25</span>
            <span className="text-xs text-pink-700">Indikator Monitoring</span>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">96%</span>
            <span className="text-xs text-pink-700">Compliance Alur</span>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">0</span>
            <span className="text-xs text-pink-700">Bypass Terdeteksi</span>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">98%</span>
            <span className="text-xs text-pink-700">Data Valid</span>
          </div>
        </div>
        {/* Modul Konsumsi (auto-sync field mapping) */}
        <div className="font-bold mb-2">Modul Bidang Konsumsi</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {konsumsiModules.map((modul) => (
            <div
              key={modul.id}
              className="bg-white border rounded-xl shadow p-4 flex flex-col gap-2"
            >
              <div className="font-semibold text-pink-700">{modul.name}</div>
              <div className="text-xs text-muted">ID: {modul.id}</div>
              <FieldMappingPreview modulId={modul.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
