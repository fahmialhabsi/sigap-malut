import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function HasilUjiUptdPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/kabid-konsumsi/koordinasi-uptd/hasil")
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        🔬 Hasil Uji dari UPTD
        {rows.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-bold">
            {rows.length}
          </span>
        )}
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Belum ada hasil uji masuk.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {r.nomor_surat || `Permintaan #${r.id}`}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Status: <span className="font-semibold">{r.status || "—"}</span>
                    {r.tanggal_hasil ? ` · Tgl hasil: ${r.tanggal_hasil}` : ""}
                  </p>
                  {r.hasil_ringkasan && (
                    <p className="text-xs text-slate-700 mt-2">{r.hasil_ringkasan}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

