import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import FieldMappingPreview from "../../components/FieldMappingPreview";
import DashboardDistribusiLayout from "../../layouts/DashboardDistribusiLayout";

export default function DashboardDistribusi() {
  const user = useAuthStore((state) => state.user);

  const distribusiModules = [
    { id: "D001", name: "Data pasar" },
    { id: "D002", name: "Harga pangan" },
    // Tambahkan modul lain sesuai kebutuhan
  ];

  useEffect(() => {
    if (user && user.role === "kepala_bidang_distribusi") {
      workflowStatusUpdateAPI({
        user,
        modulId: "D001",
        status: "akses",
        detail: "Akses modul Data pasar",
      });
    }
  }, [user]);

  if (!(user && user.unit_kerja === "Bidang Distribusi"))
    return <Navigate to="/" replace />;

  return (
    <DashboardDistribusiLayout>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-bold text-2xl mb-2">
          Dashboard Bidang Distribusi
        </div>
        <div className="text-muted mb-4">
          Ringkasan KPI dan modul Bidang Distribusi
        </div>
        {/* KPI Distribusi (dummy) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">30</span>
            <span className="text-xs text-yellow-700">
              Indikator Monitoring
            </span>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">97%</span>
            <span className="text-xs text-yellow-700">Compliance Alur</span>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">2</span>
            <span className="text-xs text-yellow-700">Bypass Terdeteksi</span>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">95%</span>
            <span className="text-xs text-yellow-700">Data Valid</span>
          </div>
        </div>
        {/* Modul Distribusi (auto-sync field mapping) */}
        <div className="font-bold mb-2">Modul Bidang Distribusi</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {distribusiModules.map((modul) => (
            <div
              key={modul.id}
              className="bg-white border rounded-xl shadow p-4 flex flex-col gap-2"
            >
              <div className="font-semibold text-yellow-700">{modul.name}</div>
              <div className="text-xs text-muted">ID: {modul.id}</div>
              <FieldMappingPreview modulId={modul.id} />
            </div>
          ))}
        </div>
      </div>
    </DashboardDistribusiLayout>
  );
}
