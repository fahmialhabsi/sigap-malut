import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function CppdStatusPanel() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/kabid-distribusi/cppd")
      .then((res) => {
        const rows = Array.isArray(res.data?.data?.stok_cadangan)
          ? res.data.data.stok_cadangan
          : [];
        setData(
          rows.map((row) => ({
            id: row.id || row.komoditas,
            komoditas: row.komoditas,
            stok: row.stok_ton != null ? `${row.stok_ton} ton` : "-",
            persen: Math.min(100, Number(row.persen_tercapai) || 0),
            status:
              row.status === "kritis"
                ? "kritis"
                : row.status === "waspada"
                  ? "waspada"
                  : "aman",
          })),
        );
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4">
        Status CPPD - Cadangan Pangan Pemerintah Daerah
      </h2>
      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat data CPPD...</p>
      ) : data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          Belum ada data CPPD operasional yang siap diringkas.
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div
              key={item.id ?? index}
              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700 w-28">
                {item.komoditas ?? `Item ${index + 1}`}
              </span>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.status === "aman"
                        ? "bg-green-400"
                        : item.status === "waspada"
                          ? "bg-amber-400"
                          : "bg-red-400"
                    }`}
                    style={{ width: `${item.persen ?? 0}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 w-20 text-right">
                {item.stok}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  item.status === "aman"
                    ? "bg-green-100 text-green-700"
                    : item.status === "waspada"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
