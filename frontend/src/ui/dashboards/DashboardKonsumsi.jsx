import React from "react";
import useAuthStore from "../../stores/authStore";

export default function DashboardKonsumsi() {
  const user = useAuthStore((state) => state.user);
  if (user && user.role !== "super_admin" && user.role !== "kepala_bidang") {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-100 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">
          Maaf, anda adalah pegawai di {user.unit_kerja || user.role}.
        </div>
        <div>Silakan login sesuai bidang untuk mengakses dashboard ini.</div>
      </div>
    );
  }
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold text-lg mb-2">Grafik Pola Konsumsi</h2>
        {/* TODO: Integrasi chart pola konsumsi */}
        <div className="h-64 flex items-center justify-center text-muted">
          [Grafik Pola Konsumsi]
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold text-lg mb-2">Grafik Keamanan Pangan</h2>
        {/* TODO: Integrasi chart keamanan pangan */}
        <div className="h-64 flex items-center justify-center text-muted">
          [Grafik Keamanan Pangan]
        </div>
      </div>
    </div>
  );
}
