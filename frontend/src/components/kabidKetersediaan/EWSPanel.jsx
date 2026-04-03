import React, { useEffect, useState } from "react";
import api from "../../services/api";

const LEVEL_CONFIG = {
  aman: {
    row: "bg-green-50",
    badge: "bg-green-100 text-green-700",
    label: "AMAN",
  },
  warning: {
    row: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    label: "WASPADA",
  },
  kritis: {
    row: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    label: "KRITIS",
  },
};

export default function EWSPanel() {
  const [ews, setEws] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/kabid-ketersediaan/dashboard/ews")
      .then((res) => setEws(res.data?.data ?? null))
      .catch(() => setEws(null))
      .finally(() => setLoading(false));
  }, []);

  const handleKirimEws = async () => {
    setSending(true);
    setSentMsg("");
    try {
      await api.post("/kabid-ketersediaan/ews/kirim-kadin", {
        catatan: "Eskalasi EWS dari Kepala Bidang Ketersediaan",
      });
      setSentMsg("EWS berhasil dikirim ke Kepala Dinas.");
    } catch {
      setSentMsg("Gagal mengirim EWS. Coba lagi.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-xl border p-5 animate-pulse h-48" />;
  }

  if (!ews) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">Early Warning System</h2>
        <p className="text-sm text-gray-500">
          Data EWS belum tersedia dari input operasional bidang.
        </p>
      </div>
    );
  }

  const statusColor =
    ews.status_keseluruhan === "aman"
      ? "text-green-600 bg-green-50 border-green-200"
      : ews.status_keseluruhan === "kritis"
        ? "text-red-600 bg-red-50 border-red-200"
        : "text-amber-600 bg-amber-50 border-amber-200";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-900/90 to-slate-900/80 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-white text-base">
              Early Warning System Ketersediaan
            </h2>
            <p className="text-xs text-red-200/70 mt-0.5">
              Update terakhir:{" "}
              {ews.update_terakhir
                ? new Date(ews.update_terakhir).toLocaleString("id-ID")
                : "-"}
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusColor}`}
          >
            {ews.alert_aktif ?? 0} alert aktif
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-2 text-left">Indikator</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Nilai Aktual</th>
              <th className="px-4 py-2 text-left">Threshold</th>
            </tr>
          </thead>
          <tbody>
            {(ews.indikator ?? []).map((indikator, index) => {
              const config =
                LEVEL_CONFIG[indikator.level] ?? LEVEL_CONFIG.aman;
              return (
                <tr
                  key={`${indikator.nama}-${index}`}
                  className={`border-t border-gray-100 ${config.row}`}
                >
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {indikator.nama}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}
                    >
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {indikator.nilai}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {indikator.threshold}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-3">
        <button
          onClick={handleKirimEws}
          disabled={sending}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
        >
          {sending ? "Mengirim..." : "Kirim EWS ke Kepala Dinas"}
        </button>
        {sentMsg && <span className="text-xs text-gray-600">{sentMsg}</span>}
      </div>
    </div>
  );
}
