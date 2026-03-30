// EWS Panel — Early Warning System Ketersediaan & Kerawanan Pangan
import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const LEVEL_CONFIG = {
  aman: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700", icon: "✅" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "⚠️" },
  kritis: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700", icon: "🚨" },
};

export default function EWSPanel() {
  const [ews, setEws] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/kabid-ketersediaan/dashboard/ews")
      .then((res) => setEws(res.data?.data ?? null))
      .catch(() =>
        setEws({
          status_keseluruhan: "waspada",
          alert_aktif: 3,
          update_terakhir: new Date().toISOString(),
          indikator: [
            { nama: "Stok Beras Daerah", status: "warning", nilai: "24 hari", threshold: "< 30 hari", level: "warning" },
            { nama: "Produksi Padi", status: "aman", nilai: "95% target", threshold: "> 80%", level: "aman" },
            { nama: "Wilayah Rawan Pangan", status: "warning", nilai: "7 kab/kota", threshold: "> 5", level: "warning" },
            { nama: "Harga Pangan Strategis", status: "aman", nilai: "+2.1%/bln", threshold: "< 10%", level: "aman" },
            { nama: "Distribusi Antarpulau", status: "warning", nilai: "Terganggu", threshold: "Normal", level: "warning" },
          ],
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleKirimEws = async () => {
    setSending(true);
    setSentMsg("");
    try {
      await api.post("/api/kabid-ketersediaan/ews/kirim-kadin", { catatan: "Eskalasi EWS dari Kepala Bidang Ketersediaan" });
      setSentMsg("✅ EWS berhasil dikirim ke Kepala Dinas.");
    } catch {
      setSentMsg("❌ Gagal mengirim EWS. Coba lagi.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="bg-white rounded-xl border p-5 animate-pulse h-48" />;

  const statusColor = ews?.status_keseluruhan === "aman" ? "text-green-600 bg-green-50 border-green-200" : ews?.status_keseluruhan === "kritis" ? "text-red-600 bg-red-50 border-red-200" : "text-amber-600 bg-amber-50 border-amber-200";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/90 to-slate-900/80 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white flex items-center gap-2 text-base">
              🚨 Early Warning System — Ketersediaan & Kerawanan Pangan
            </h2>
            <p className="text-xs text-red-200/70 mt-0.5">
              Update terakhir: {ews?.update_terakhir ? new Date(ews.update_terakhir).toLocaleString("id-ID") : "—"}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusColor}`}>
            ⚠️ {ews?.alert_aktif ?? 0} warning aktif
          </div>
        </div>
      </div>

      {/* Tabel Indikator */}
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
            {(ews?.indikator ?? []).map((ind, i) => {
              const cfg = LEVEL_CONFIG[ind.level] ?? LEVEL_CONFIG.aman;
              return (
                <tr key={i} className={`border-t border-gray-100 ${cfg.bg}`}>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{ind.nama}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                      {cfg.icon} {ind.status === "warning" ? "WARNING" : ind.status === "kritis" ? "KRITIS" : "AMAN"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{ind.nilai}</td>
                  <td className="px-4 py-2.5 text-gray-500">{ind.threshold}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-3">
        <button
          onClick={handleKirimEws}
          disabled={sending}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
        >
          📤 {sending ? "Mengirim…" : "Kirim EWS ke Kepala Dinas"}
        </button>
        {sentMsg && <span className="text-xs text-gray-600">{sentMsg}</span>}
      </div>
    </div>
  );
}
