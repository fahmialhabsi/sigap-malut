import React from "react";
import ProfessionalCharts from "../components/ProfessionalCharts";
import { useNavigate } from "react-router-dom";

const bidangList = [
  { label: "Sekretariat", path: "/dashboard/sekretariat" },
  { label: "Bidang Ketersediaan", path: "/dashboard/ketersediaan" },
  { label: "Bidang Distribusi", path: "/dashboard/distribusi" },
  { label: "Bidang Konsumsi", path: "/dashboard/konsumsi" },
  { label: "UPTD", path: "/dashboard/uptd" },
];

export default function DashboardMain() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigasi Dashboard Bidang */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 mb-8">
        <div className="font-bold text-lg mb-4">Navigasi Dashboard Bidang</div>
        <div className="flex flex-wrap gap-4">
          {bidangList.map((b) => (
            <button
              key={b.path}
              onClick={() => navigate(b.path)}
              className="bg-primary rounded px-6 py-3 font-semibold shadow hover:bg-primary-700 transition text-primary-foreground text-base"
              style={{ color: "#1e293b" }} // slate-800
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      {/* Grafik Profesional */}
      <ProfessionalCharts />
      {/* Ringkasan Eksekutif */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 mb-8">
        <h3 className="text-lg font-bold mb-2">Ringkasan Eksekutif</h3>
        <p className="text-sm text-muted mb-2">
          Dashboard Kendali SIGAP Malut
          <br />
          Pantau indikator kinerja utama, alur koordinasi, serta kesiapan data
          lintas bidang untuk keputusan cepat.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">190+</span>
            <span className="text-xs text-muted">Modul</span>
          </div>
          <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">4</span>
            <span className="text-xs text-muted">Surat Masuk</span>
          </div>
          <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">5</span>
            <span className="text-xs text-muted">Surat Keluar</span>
          </div>
          <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">14</span>
            <span className="text-xs text-muted">Komoditas</span>
          </div>
          <div className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">15</span>
            <span className="text-xs text-muted">Pengguna Aktif</span>
          </div>
        </div>
      </div>
      {/* Alert Prioritas Minggu Ini */}
      <div className="bg-red-50 border-l-4 border-red-400 rounded-xl p-4 flex flex-col gap-1 mb-8">
        <div className="font-bold text-red-700">Alert Prioritas Minggu Ini</div>
        <div className="text-sm text-red-800">
          1 pegawai melewati tenggat 30 hari.
        </div>
        <div className="text-xs text-red-600">
          2 bypass terdeteksi pada alur Sekretariat.
        </div>
        <div className="text-xs text-orange-600">
          Harga cabai naik 5% minggu ini.
        </div>
      </div>
      {/* Ringkasan Laporan Strategis */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="font-bold mb-2">Kinerja Bulanan</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>Sekretariat</span>
              <span className="font-bold text-green-600">84%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ketersediaan</span>
              <span className="font-bold text-green-600">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Distribusi</span>
              <span className="font-bold text-green-600">81%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Konsumsi</span>
              <span className="font-bold text-green-600">76%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="font-bold mb-2">Ringkasan Laporan Strategis</div>
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Laporan Inflasi:</span> Siap untuk
              rapat TPID minggu ini.
            </div>
            <div>
              <span className="font-semibold">Rekap SPPG:</span> Data valid 100%
              untuk pelaporan nasional.
            </div>
            <div>
              <span className="font-semibold">Kinerja Bidang:</span> Ringkasan
              KPI bulanan sudah tersusun.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
