import React, { useEffect } from "react";
import { getReportsAPI } from "../services/reportingService";
import api from "../services/apiClient";

export default function ReportingWorkflowPage() {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedEvidence, setSelectedEvidence] = React.useState(null);

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
                <th className="border px-2 py-1">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
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
                    <td className="border px-2 py-1">
                      {r.evidence &&
                      Array.isArray(r.evidence) &&
                      r.evidence.length > 0 ? (
                        <button
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                          onClick={() => setSelectedEvidence(r.evidence)}
                        >
                          Lihat Evidence
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
            <h3 className="text-lg font-bold mb-4">Detail Evidence</h3>
            <ul className="mb-4">
              {selectedEvidence.map((ev, idx) => (
                <li key={idx} className="mb-2 border-b pb-2">
                  <div>
                    <b>File:</b> {ev.file}
                  </div>
                  <div>
                    <b>Line:</b> {ev.line}
                  </div>
                  <div>
                    <b>Snippet:</b>{" "}
                    <pre className="bg-gray-100 p-2 rounded text-xs">
                      {ev.snippet}
                    </pre>
                  </div>
                  <div>
                    <b>Confidence:</b> {ev.confidence}
                  </div>
                </li>
              ))}
            </ul>
            <button
              className="bg-gray-200 px-4 py-2 rounded font-semibold"
              onClick={() => setSelectedEvidence(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
