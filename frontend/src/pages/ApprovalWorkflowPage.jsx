import React, { useEffect } from "react";
import { APPROVAL_STATUS } from "../utils/approvalWorkflow";
import { getApprovalWorkflowAPI } from "../services/approvalService";
import api from "../services/apiClient";

export default function ApprovalWorkflowPage() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getApprovalWorkflowAPI();
      setLogs((res.data || []).slice().reverse());
    } catch {
      setLogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchLogs();
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Approval Workflow</h2>
        <button
          className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold shadow"
          onClick={async () => {
            setLoading(true);
            try {
              await api.delete("/approval");
              setLogs([]);
            } catch {
              /* ignore error */
            }
            setLoading(false);
          }}
        >
          Hapus Log
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Memuat data approval...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Waktu</th>
                <th className="border px-2 py-1">User</th>
                <th className="border px-2 py-1">Modul</th>
                <th className="border px-2 py-1">Data ID</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    Tidak ada log approval.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {log.time}
                    </td>
                    <td className="border px-2 py-1">{log.user}</td>
                    <td className="border px-2 py-1">{log.modulId}</td>
                    <td className="border px-2 py-1">{log.dataId}</td>
                    <td className="border px-2 py-1">{log.status}</td>
                    <td className="border px-2 py-1">{log.detail}</td>
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
