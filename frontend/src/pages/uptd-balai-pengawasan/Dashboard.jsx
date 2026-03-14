import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useUptdBalaiPengawasanData from "./useUptdBalaiPengawasanData";

export default function UPTDBalaiPengawasanDashboard() {
  const { summary, latest, loading, error } = useUptdBalaiPengawasanData();

  return (
    <DashboardLayout title="UPTD Balai Pengawasan">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {summary.map((item, idx) => (
          <div key={idx} className="bg-white rounded shadow p-4">
            <div className="text-gray-700 font-bold text-lg">{item.label}</div>
            <div className="text-2xl font-extrabold text-blue-700">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded shadow p-4">
        <div className="font-bold text-lg mb-2">Data Terbaru</div>
        {loading ? (
          <div>Memuat data...</div>
        ) : error ? (
          <div className="text-red-500">Gagal memuat data</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                {latest.length > 0 && Object.keys(latest[0]).map((col) => (
                  <th key={col} className="text-left font-semibold pr-4">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latest.map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(row).map((col) => (
                    <td key={col} className="pr-4">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
