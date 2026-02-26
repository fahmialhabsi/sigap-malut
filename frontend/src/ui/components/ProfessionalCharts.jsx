import React from "react";

// Placeholder for professional charts, replace with real chart components (e.g. Recharts, Chart.js, etc)
export default function ProfessionalCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
      <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
        <h2 className="font-bold text-lg mb-2 text-slate-100">
          Grafik Indeks Ketahanan Pangan
        </h2>
        <div className="h-64 flex items-center justify-center text-slate-400">
          [Grafik Indeks Ketahanan Pangan]
        </div>
      </div>
      <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
        <h2 className="font-bold text-lg mb-2 text-slate-100">
          Grafik Inflasi Pangan
        </h2>
        <div className="h-64 flex items-center justify-center text-slate-400">
          [Grafik Inflasi Pangan]
        </div>
      </div>
      <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
        <h2 className="font-bold text-lg mb-2 text-slate-100">
          Grafik Realisasi Anggaran
        </h2>
        <div className="h-64 flex items-center justify-center text-slate-400">
          [Grafik Realisasi Anggaran]
        </div>
      </div>
      <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
        <h2 className="font-bold text-lg mb-2 text-slate-100">
          Grafik Kinerja Lintas Bidang
        </h2>
        <div className="h-64 flex items-center justify-center text-slate-400">
          [Grafik Kinerja Lintas Bidang]
        </div>
      </div>
    </div>
  );
}
