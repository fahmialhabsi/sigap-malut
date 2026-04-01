import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function BypassAlertCenter() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchList = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/api/sekretaris/bypass/list", {
        params: { page: p, limit: 20 },
      });
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
      setPage(p);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">🔎 Bypass Alert Center</h2>
          <p className="text-xs text-gray-500 mt-1">
            Daftar pelanggaran alur koordinasi (30 hari terakhir).
          </p>
        </div>
        <button
          onClick={() => fetchList(page)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          ↺ Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-10 text-center animate-pulse">
          Memuat bypass…
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-400 py-10 text-center">
          Tidak ada bypass terdeteksi.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Waktu</th>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Level Dilewati</th>
                <th className="px-3 py-2 text-left">Aksi</th>
                <th className="px-3 py-2 text-left">Severity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const t = r.detected_at
                  ? new Date(r.detected_at).toLocaleString("id-ID")
                  : "—";
                const sev = String(r.severity || "high").toLowerCase();
                const sevCls =
                  sev === "critical" || sev === "high"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : sev === "medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";
                return (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600">{t}</td>
                    <td className="px-3 py-2 font-semibold text-gray-800">
                      {r.user_id ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{r.user_role || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{r.bypassed_level || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{r.attempted_action || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold ${sevCls}`}>
                        {r.severity || "high"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => fetchList(page - 1)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          ← Prev
        </button>
        <span className="text-xs text-gray-500">Page {page}</span>
        <button
          onClick={() => fetchList(page + 1)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

