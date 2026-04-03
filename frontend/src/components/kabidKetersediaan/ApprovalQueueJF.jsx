// Approval Queue dari JF — Panel untuk Kepala Bidang mereview dokumen dari JF
import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function ApprovalQueueJF({ unitKerja = "Bidang Ketersediaan" }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [catatan, setCatatan] = useState({});
  const [showCatatan, setShowCatatan] = useState({});
  const [msg, setMsg] = useState({});

  const uk = unitKerja.toLowerCase();
  const endpoint = uk.includes("distribusi")
    ? "/kabid-distribusi/approval-queue"
    : uk.includes("konsumsi")
      ? "/kabid-konsumsi/approval-queue"
      : "/kabid-ketersediaan/approval-queue";

  const setujuiEndpoint = (id) =>
    uk.includes("distribusi")
      ? `/kabid-distribusi/approval-queue/${id}/setujui`
      : uk.includes("konsumsi")
        ? `/kabid-konsumsi/approval-queue/${id}/setujui`
        : `/kabid-ketersediaan/approval-queue/${id}/setujui`;

  const kembalikanEndpoint = (id) =>
    uk.includes("distribusi")
      ? `/kabid-distribusi/approval-queue/${id}/kembalikan`
      : uk.includes("konsumsi")
        ? `/kabid-konsumsi/approval-queue/${id}/kembalikan`
        : `/kabid-ketersediaan/approval-queue/${id}/kembalikan`;

  useEffect(() => {
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => setQueue(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setQueue([]))
      .finally(() => setLoading(false));
  }, [endpoint]);

  const handleSetujui = async (id) => {
    setActionLoading((s) => ({ ...s, [id]: "setujui" }));
    try {
      await api.post(setujuiEndpoint(id));
      setQueue((q) => q.filter((item) => item.id !== id));
      setMsg((m) => ({ ...m, [id]: { ok: true, text: "✅ Disetujui & diteruskan ke Sekretaris." } }));
    } catch {
      setMsg((m) => ({ ...m, [id]: { ok: false, text: "❌ Gagal menyetujui." } }));
    } finally {
      setActionLoading((s) => ({ ...s, [id]: null }));
    }
  };

  const handleKembalikan = async (id) => {
    if (!catatan[id]?.trim()) {
      setMsg((m) => ({ ...m, [id]: { ok: false, text: "Catatan wajib diisi saat mengembalikan." } }));
      return;
    }
    setActionLoading((s) => ({ ...s, [id]: "kembalikan" }));
    try {
      await api.post(kembalikanEndpoint(id), { catatan: catatan[id] });
      setQueue((q) => q.filter((item) => item.id !== id));
      setMsg((m) => ({ ...m, [id]: { ok: true, text: "↩️ Dikembalikan ke JF." } }));
    } catch {
      setMsg((m) => ({ ...m, [id]: { ok: false, text: "❌ Gagal mengembalikan." } }));
    } finally {
      setActionLoading((s) => ({ ...s, [id]: null }));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        📤 Menunggu Review Kepala Bidang
        {queue.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-bold">
            {queue.length}
          </span>
        )}
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat antrian…</p>
      ) : queue.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Tidak ada dokumen yang menunggu review.</p>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => {
            const hariMenunggu = item.hari_menunggu ?? 0;
            return (
              <div key={item.id} className={`p-4 rounded-lg border ${hariMenunggu >= 3 ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.judul || `Dokumen #${item.id}`}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.disubmit_oleh ? `Dari: JF • ` : ""}
                      {item.dibuat_pada ? new Date(item.dibuat_pada).toLocaleDateString("id-ID") : "—"}
                      {" · "}{item.jenis || "laporan_teknis"}
                    </p>
                    {hariMenunggu >= 3 && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">⚠️ Sudah {hariMenunggu} hari belum direspons</p>
                    )}
                  </div>
                </div>

                {/* Catatan form (toggle) */}
                {showCatatan[item.id] && (
                  <div className="mb-2">
                    <textarea
                      rows={2}
                      value={catatan[item.id] ?? ""}
                      onChange={(e) => setCatatan((c) => ({ ...c, [item.id]: e.target.value }))}
                      placeholder="Catatan untuk JF (wajib saat mengembalikan)…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {msg[item.id] && (
                  <p className={`text-xs mb-2 ${msg[item.id].ok ? "text-green-600" : "text-red-500"}`}>
                    {msg[item.id].text}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSetujui(item.id)}
                    disabled={!!actionLoading[item.id]}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                  >
                    {actionLoading[item.id] === "setujui" ? "…" : "✅ Setujui & Teruskan"}
                  </button>
                  <button
                    onClick={() => setShowCatatan((s) => ({ ...s, [item.id]: !s[item.id] }))}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold rounded-lg transition"
                  >
                    ↩️ Kembalikan
                  </button>
                  {showCatatan[item.id] && (
                    <button
                      onClick={() => handleKembalikan(item.id)}
                      disabled={!!actionLoading[item.id]}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                    >
                      {actionLoading[item.id] === "kembalikan" ? "…" : "Konfirmasi Kembalikan"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
