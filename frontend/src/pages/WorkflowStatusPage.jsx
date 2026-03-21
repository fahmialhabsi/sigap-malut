import React, { useEffect } from "react";
import { getWorkflowStatus, clearWorkflowStatus } from "../utils/workflowHooks";

export default function WorkflowStatusPage() {
  const [logs, setLogs] = React.useState([]);

  useEffect(() => {
    queueMicrotask(() => setLogs(getWorkflowStatus().reverse()));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Workflow Status (Alur Proses)</h2>
        <button
          className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold shadow"
          onClick={() => {
            clearWorkflowStatus();
            setLogs([]);
          }}
        >
          Hapus Log
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Waktu</th>
              <th className="border px-2 py-1">User</th>
              <th className="border px-2 py-1">Modul</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  Tidak ada log workflow.
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
                  <td className="border px-2 py-1">{log.status}</td>
                  <td className="border px-2 py-1">{log.detail}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
