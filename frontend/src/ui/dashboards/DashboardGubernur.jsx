import React from "react";
import useAuthStore from "../../stores/authStore";

export default function DashboardGubernur() {
  const user = useAuthStore((state) => state.user);
  if (!user || user.role !== "gubernur") {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Akses ditolak.</div>
        <div>Silakan login sebagai Gubernur untuk mengakses dashboard ini.</div>
      </div>
    );
  }
  // Modul Gubernur (dummy)
  const gubernurModules = [
    { id: "G001", name: "Laporan Inflasi Daerah" },
    { id: "G002", name: "Ringkasan Program Nasional" },
    // Tambahkan modul lain sesuai kebutuhan
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-bold text-2xl mb-2">Dashboard Gubernur</div>
        <div className="text-muted mb-4">Ringkasan KPI dan modul Gubernur</div>
        {/* KPI Gubernur (dummy) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">2</span>
            <span className="text-xs text-orange-700">Laporan Strategis</span>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">100%</span>
            <span className="text-xs text-orange-700">Compliance</span>
          </div>
        </div>
        {/* Modul Gubernur */}
        <div className="font-bold mb-2">Modul Gubernur</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gubernurModules.map((modul) => (
            <div
              key={modul.id}
              className="bg-white border rounded-xl shadow p-4 flex flex-col gap-2"
            >
              <div className="font-semibold text-orange-700">{modul.name}</div>
              <div className="text-xs text-muted">ID: {modul.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
