import React from "react";
import { getIntegrationLogs } from "../services/integrationLogService";

export default function IntegrationLogPanel() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [unit, setUnit] = React.useState("");
  const [status, setStatus] = React.useState("");

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getIntegrationLogs({ unit, status, page });
      setLogs(res.data);
      setTotalPages(res.pagination.totalPages);
      setPage(res.pagination.page);
    } catch {
      setLogs([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchLogs(page);
    // eslint-disable-next-line
  }, [unit, status]);

  return (
    <div className="border rounded p-4 bg-gray-50 max-w-2xl mx-auto mt-8">
      <h3 className="font-bold mb-2">Log Sinkronisasi Master-Data/Evidence</h3>
      <div className="mb-2 flex gap-2">
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Filter unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => fetchLogs(1)}
          disabled={loading}
        >
          Cari
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8">Memuat log...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-4 text-muted">
          Tidak ada log sinkronisasi.
        </div>
      ) : (
        <table className="min-w-full border text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Waktu</th>
              <th className="border px-2 py-1">Unit</th>
              <th className="border px-2 py-1">Table</th>
              <th className="border px-2 py-1">Record ID</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">User</th>
              <th className="border px-2 py-1">Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td className="border px-2 py-1 whitespace-nowrap">
                  {log.integrated_at
                    ? new Date(log.integrated_at).toLocaleString()
                    : "-"}
                </td>
                <td className="border px-2 py-1">{log.source_unit}</td>
                <td className="border px-2 py-1">{log.source_table}</td>
                <td className="border px-2 py-1">{log.source_record_id}</td>
                <td className="border px-2 py-1">{log.status}</td>
                <td className="border px-2 py-1">{log.integrated_by}</td>
                <td className="border px-2 py-1 text-red-600">
                  {log.error_message || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-2 flex gap-2 justify-center">
        <button
          className="bg-gray-300 px-2 py-1 rounded"
          onClick={() => fetchLogs(page - 1)}
          disabled={loading || page <= 1}
        >
          Prev
        </button>
        <span className="text-xs">
          Page {page} / {totalPages}
        </span>
        <button
          className="bg-gray-300 px-2 py-1 rounded"
          onClick={() => fetchLogs(page + 1)}
          disabled={loading || page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
