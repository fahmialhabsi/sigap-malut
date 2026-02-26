import React, { useEffect } from "react";
import { getReportsAPI } from "../services/reportingService";
import api from "../services/apiClient";

export default function ReportingWorkflowPage() {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReportsAPI();
      setReports((res.data || []).slice().reverse());
    } catch {
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pelaporan Otomatis</h2>
        <button
          className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold shadow"
          onClick={async () => {
            setLoading(true);
            try {
              await api.delete("/report");
              setReports([]);
            } catch {}
            setLoading(false);
          }}
        >
          Hapus Semua
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Memuat data laporan...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Waktu</th>
                <th className="border px-2 py-1">User</th>
                <th className="border px-2 py-1">Modul</th>
                <th className="border px-2 py-1">Periode</th>
                <th className="border px-2 py-1">Tipe</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    Tidak ada log pelaporan.
                  </td>
                </tr>
              ) : (
                reports.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {r.time}
                    </td>
                    <td className="border px-2 py-1">{r.user}</td>
                    <td className="border px-2 py-1">{r.modulId}</td>
                    <td className="border px-2 py-1">{r.periode}</td>
                    <td className="border px-2 py-1">{r.tipe}</td>
                    <td className="border px-2 py-1">{r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
