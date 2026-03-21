import React, { useEffect } from "react";
import { getCasesAPI, updateCaseStatusAPI } from "../services/caseService";
import api from "../services/apiClient";

export default function CaseWorkflowPage() {
  const [cases, setCases] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await getCasesAPI();
      setCases((res.data || []).slice().reverse());
    } catch {
      setCases([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleStatus = async (id, status) => {
    setLoading(true);
    try {
      await updateCaseStatusAPI(id, status);
      await fetchCases();
    } catch {}
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Penanganan Alert/Kasus</h2>
        <button
          className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold shadow"
          onClick={async () => {
            setLoading(true);
            try {
              await api.delete("/case");
              setCases([]);
            } catch {}
            setLoading(false);
          }}
        >
          Hapus Semua
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Memuat data kasus...</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Waktu</th>
                <th className="border px-2 py-1">User</th>
                <th className="border px-2 py-1">Modul</th>
                <th className="border px-2 py-1">Data ID</th>
                <th className="border px-2 py-1">Alert</th>
                <th className="border px-2 py-1">Pesan</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    Tidak ada kasus/alert.
                  </td>
                </tr>
              ) : (
                cases.map((c, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {c.created}
                    </td>
                    <td className="border px-2 py-1">{c.user}</td>
                    <td className="border px-2 py-1">{c.modulId}</td>
                    <td className="border px-2 py-1">{c.dataId}</td>
                    <td className="border px-2 py-1">{c.alertType}</td>
                    <td className="border px-2 py-1">{c.pesan}</td>
                    <td className="border px-2 py-1">{c.status}</td>
                    <td className="border px-2 py-1">
                      {c.status !== "closed" && (
                        <>
                          <button
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded mr-1"
                            onClick={() => handleStatus(i, "in progress")}
                          >
                            In Progress
                          </button>
                          <button
                            className="bg-green-100 text-green-700 px-2 py-1 rounded mr-1"
                            onClick={() => handleStatus(i, "resolved")}
                          >
                            Resolved
                          </button>
                          <button
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            onClick={() => handleStatus(i, "closed")}
                          >
                            Closed
                          </button>
                        </>
                      )}
                    </td>
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
