import React, { useEffect, useState } from "react";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    modul: "",
    aksi: "",
    pegawai_id: "",
    entitas_id: "",
    start: "",
    end: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  const fetchLogs = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const url = new URL("/api/audit-trail", window.location.origin);
      Object.entries({
        ...filters,
        ...params,
        page: pagination.page,
        limit: pagination.limit,
      }).forEach(([k, v]) => {
        if (v) url.searchParams.append(k, v);
      });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Gagal mengambil data audit log");
      const data = await res.json();
      setLogs(data.data || []);
      setPagination((p) => ({
        ...p,
        totalPages: data.pagination?.totalPages || 1,
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit]);

  const handleFilterChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchLogs({ page: 1 });
  };

  const handleExport = async (format) => {
    const url = new URL("/api/audit-trail/export", window.location.origin);
    Object.entries({ ...filters, format }).forEach(([k, v]) => {
      if (v) url.searchParams.append(k, v);
    });
    window.open(url.toString(), "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <h2 className="text-2xl font-bold">Audit Trail (Log Aktivitas)</h2>
        <div className="flex gap-2">
          <button
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-semibold shadow"
            onClick={() => handleExport("csv")}
          >
            Export CSV
          </button>
          <button
            className="bg-green-100 text-green-700 px-4 py-2 rounded font-semibold shadow"
            onClick={() => handleExport("json")}
          >
            Export JSON
          </button>
        </div>
      </div>
      <form
        className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-2"
        onSubmit={handleFilterSubmit}
      >
        <input
          name="modul"
          value={filters.modul}
          onChange={handleFilterChange}
          placeholder="Modul"
          className="border px-2 py-1 rounded"
        />
        <input
          name="aksi"
          value={filters.aksi}
          onChange={handleFilterChange}
          placeholder="Aksi"
          className="border px-2 py-1 rounded"
        />
        <input
          name="pegawai_id"
          value={filters.pegawai_id}
          onChange={handleFilterChange}
          placeholder="Pegawai ID"
          className="border px-2 py-1 rounded"
        />
        <input
          name="entitas_id"
          value={filters.entitas_id}
          onChange={handleFilterChange}
          placeholder="Entitas ID"
          className="border px-2 py-1 rounded"
        />
        <input
          name="start"
          type="date"
          value={filters.start}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        />
        <input
          name="end"
          type="date"
          value={filters.end}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        />
        <button
          type="submit"
          className="col-span-1 md:col-span-6 bg-gray-800 text-white px-4 py-2 rounded mt-2"
        >
          Filter
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Modul</th>
              <th className="border px-2 py-1">Aksi</th>
              <th className="border px-2 py-1">Entitas ID</th>
              <th className="border px-2 py-1">Pegawai ID</th>
              <th className="border px-2 py-1">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  Tidak ada log aktivitas.
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={log.id || i}>
                  <td className="border px-2 py-1 whitespace-nowrap">
                    {log.id}
                  </td>
                  <td className="border px-2 py-1">{log.modul}</td>
                  <td className="border px-2 py-1">{log.aksi}</td>
                  <td className="border px-2 py-1">{log.entitas_id}</td>
                  <td className="border px-2 py-1">{log.pegawai_id}</td>
                  <td className="border px-2 py-1">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() =>
            setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
          }
          disabled={pagination.page <= 1}
        >
          Prev
        </button>
        <span>
          Page {pagination.page} / {pagination.totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() =>
            setPagination((p) => ({
              ...p,
              page: Math.min(p.totalPages, p.page + 1),
            }))
          }
          disabled={pagination.page >= pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
