import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function TanggapanBawahanPanel({ title = "Tanggapan dari bawahan" }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/panel/tanggapan-dari-bawahan", { params: { limit: 40 } })
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => {
        toast.error("Gagal memuat tanggapan");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800">{title}</h2>
      <p className="text-xs text-gray-500 mt-1 mb-4">
        Task yang Anda keluarkan dan sudah mendapat tanggapan teknis / koordinasi
        dari penerima tugas.
      </p>
      {loading ? (
        <p className="text-sm text-gray-500 animate-pulse">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Belum ada tanggapan tercatat.</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-gray-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <div className="font-semibold text-gray-800">{r.title}</div>
              <div className="text-[11px] text-gray-500">
                Task #{r.id} · {r.status}
              </div>
              {r.response?.note ? (
                <div className="text-xs text-gray-700 mt-1 whitespace-pre-wrap border-t border-gray-200 pt-1">
                  <span className="font-medium text-gray-600">Tanggapan: </span>
                  {r.response.note}
                </div>
              ) : null}
              <div className="text-[10px] text-gray-400 mt-1">
                {r.response?.by_name || "—"} ({r.response?.by_role || "—"}) ·{" "}
                {r.response?.at
                  ? new Date(r.response.at).toLocaleString("id-ID")
                  : "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
