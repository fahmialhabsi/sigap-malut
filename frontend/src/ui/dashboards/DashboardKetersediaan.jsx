// src/ui/dashboards/DashboardKetersediaan.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import FieldMappingPreview from "../../components/FieldMappingPreview";

export default function DashboardKetersediaan() {
  const user = useAuthStore((state) => state.user);

  const ketersediaanModules = [
    { id: "K001", name: "Master data komoditas" },
    { id: "K002", name: "Produksi pangan" },
    // Tambahkan modul lain sesuai kebutuhan
  ];

  React.useEffect(() => {
    if (user && user.role === "kepala_bidang_ketersediaan") {
      workflowStatusUpdateAPI({
        user,
        modulId: "K001",
        status: "akses",
        detail: "Akses modul Master data komoditas",
      });
    }
  }, [user]);

  const hasRole = (role) => user && user.role === role;
  if (!hasRole("kepala_bidang_ketersediaan"))
    return <Navigate to="/" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-bold text-2xl mb-2">
          Dashboard Bidang Ketersediaan
        </div>
        <div className="text-muted mb-4">
          Ringkasan KPI dan modul Bidang Ketersediaan
        </div>
        {/* KPI Ketersediaan (dummy) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">25</span>
            <span className="text-xs text-green-700">Indikator Monitoring</span>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">98%</span>
            <span className="text-xs text-green-700">Compliance Alur</span>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">1</span>
            <span className="text-xs text-green-700">Bypass Terdeteksi</span>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">97%</span>
            <span className="text-xs text-green-700">Data Valid</span>
          </div>
        </div>
        {/* Modul Ketersediaan (auto-sync field mapping) */}
        <div className="font-bold mb-2">Modul Bidang Ketersediaan</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ketersediaanModules.map((modul) => (
            <div
              key={modul.id}
              className="bg-white border rounded-xl shadow p-4 flex flex-col gap-2"
            >
              <div className="font-semibold text-green-700">{modul.name}</div>
              <div className="text-xs text-muted">ID: {modul.id}</div>
              <FieldMappingPreview modulId={modul.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
