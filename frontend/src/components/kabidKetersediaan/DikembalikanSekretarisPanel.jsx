// Panel: Dokumen yang Dikembalikan oleh Sekretaris ke Kepala Bidang
import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function DikembalikanSekretarisPanel({ unitKerja = "Bidang Ketersediaan" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const uk = unitKerja.toLowerCase();
  const endpoint = uk.includes("distribusi")
    ? "/kabid-distribusi/laporan-ke-sekretaris/status"
    : uk.includes("konsumsi")
      ? "/kabid-konsumsi/laporan-ke-sekretaris/status"
      : "/kabid-ketersediaan/laporan-ke-sekretaris/status";

  useEffect(() => {
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => {
        const all = Array.isArray(res.data?.data) ? res.data.data : [];
        setItems(all.filter((d) => d.status === "dikembalikan" || d.status === "returned"));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        ↩️ Dikembalikan Sekretaris
        {items.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-bold">{items.length}</span>
        )}
      </h2>
      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Tidak ada dokumen yang dikembalikan.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id ?? i} className="p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="font-medium text-sm text-gray-800">{item.judul ?? `Dokumen #${i + 1}`}</p>
              {item.catatan_sekretaris && (
                <p className="text-xs text-red-600 mt-1">
                  💬 {item.catatan_sekretaris}
                </p>
              )}
              <button className="mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition">
                📝 Perbaiki & Kirim Ulang
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
