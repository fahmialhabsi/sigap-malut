// Alert anomali harga (is_anomaly) — data nyata dari harga_pangan
import React, { useEffect, useState } from "react";
import api from "../../utils/api";

function summarizeReason(raw) {
  if (raw == null || raw === "") return null;
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(o?.reasons)) {
      return o.reasons
        .map((r) => (typeof r === "object" && r.code ? r.code : JSON.stringify(r)))
        .join("; ");
    }
  } catch {
    /* bukan JSON */
  }
  return String(raw).slice(0, 200);
}

export default function AlertHargaKritisPanel({ compact = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/kabid-distribusi/alert-harga-kritis")
      .then((res) => setItems(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5 animate-pulse h-24" />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        Alert anomali harga
        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-bold">
          {items.length}
        </span>
      </h2>
      {!compact && (
        <p className="text-xs text-gray-500 mb-3">
          Entri dengan flag is_anomaly (di luar rentang konfigurasi atau lonjakan harian). Data tetap disimpan;
          verifikasi manual wajib sebelum dipakai agregat resmi.
        </p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Tidak ada anomali aktif.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => {
            const reasonText = summarizeReason(item.anomaly_reason);
            return (
            <div
              key={item.id ?? i}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-red-50 rounded-lg border border-red-100"
            >
              <div>
                <p className="font-medium text-sm text-gray-800">{item.komoditas}</p>
                <p className="text-xs text-gray-500">
                  {[item.kabupaten, item.pasar_nama].filter(Boolean).join(" · ")}
                  {item.tanggal_pemantauan ? ` · ${item.tanggal_pemantauan}` : ""}
                  {item.status_verifikasi ? ` · status: ${item.status_verifikasi}` : ""}
                  {item.requires_manual_verify && (
                    <span className="text-amber-700 font-medium"> · perlu verifikasi</span>
                  )}
                </p>
                {reasonText && (
                  <p className="text-[11px] text-red-800/90 mt-1">{reasonText}</p>
                )}
              </div>
              <div className="text-left sm:text-right">
                {item.harga_pasar != null && (
                  <p className="font-bold text-red-600 text-sm">
                    Rp {Number(item.harga_pasar).toLocaleString("id-ID")}
                  </p>
                )}
                <button
                  type="button"
                  className="mt-1 text-xs text-blue-700 hover:underline font-medium"
                >
                  Buat usul pelepasan CPPD
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
