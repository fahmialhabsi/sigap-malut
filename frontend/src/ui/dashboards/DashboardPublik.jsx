import React from "react";

export default function DashboardPublik() {
  // Modul Publik (dummy)
  const publikModules = [
    { id: "P001", name: "Data produksi pangan" },
    { id: "P002", name: "Harga pangan harian" },
    { id: "P003", name: "Inflasi pangan" },
    { id: "P004", name: "UMKM pangan bersertifikat" },
    // Tambahkan modul lain sesuai kebutuhan
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-bold text-2xl mb-2">Portal Data Publik</div>
        <div className="text-muted mb-4">
          Ringkasan data terbuka dan modul publik
        </div>
        {/* Modul Publik */}
        <div className="font-bold mb-2">Modul Data Terbuka</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publikModules.map((modul) => (
            <div
              key={modul.id}
              className="bg-white border rounded-xl shadow p-4 flex flex-col gap-2"
            >
              <div className="font-semibold text-blue-700">{modul.name}</div>
              <div className="text-xs text-muted">ID: {modul.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
