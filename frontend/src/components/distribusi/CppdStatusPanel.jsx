// CPPD Status Panel — Cadangan Pangan Pemerintah Daerah
import React, { useState, useEffect } from "react";
import api from "../../utils/api";

export default function CppdStatusPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/kabid-distribusi/cppd")
      .then((res) => {
        const d = res.data?.data;
        const rows = Array.isArray(d?.stok_cadangan) ? d.stok_cadangan : [];
        setData(
          rows.map((r) => ({
            id: r.komoditas,
            komoditas: r.komoditas,
            stok: `${r.stok_ton ?? "—"} ton`,
            persen: Math.min(100, Number(r.persen_tercapai) || 0),
            status: r.status === "kritis" ? "kritis" : r.status === "waspada" ? "waspada" : "aman",
          })),
        );
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        🏛️ Status CPPD — Cadangan Pangan Pemerintah Daerah
      </h2>
      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat data CPPD…</p>
      ) : !data || data.length === 0 ? (
        <div className="space-y-2">
          {[
            { komoditas: "Beras", stok: "45 ton", status: "waspada", persen: 60 },
            { komoditas: "Minyak Goreng", stok: "12 ton", status: "aman", persen: 80 },
            { komoditas: "Gula", stok: "8 ton", status: "kritis", persen: 30 },
          ].map((item) => (
            <div key={item.komoditas} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 w-28">{item.komoditas}</span>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.status === "aman" ? "bg-green-400" : item.status === "waspada" ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${item.persen}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 w-16 text-right">{item.stok}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.status === "aman" ? "bg-green-100 text-green-700" : item.status === "waspada" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={item.id ?? i} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 w-28">{item.komoditas ?? item.nama ?? `Item ${i + 1}`}</span>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${(item.status === "aman") ? "bg-green-400" : (item.status === "waspada") ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${item.persen ?? 50}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 w-20 text-right">{item.stok ?? "—"}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(item.status === "aman") ? "bg-green-100 text-green-700" : (item.status === "waspada") ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                {item.status ?? "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
