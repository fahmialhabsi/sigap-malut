// Panel verifikasi data dari Pelaksana — dipakai JF Ketersediaan & Distribusi (baseUrl berbeda)
import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function JfVerifikasiDataMasukPanel({
  baseUrl,
  title = "Verifikasi Data Masuk",
  unitBadge,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [catatan, setCatatan] = useState({});
  const [msg, setMsg] = useState({});

  useEffect(() => {
    setLoading(true);
    api
      .get(`${baseUrl}/verifikasi/masuk`)
      .then((res) => setItems(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [baseUrl]);

  const handleVerifikasi = async (id, action) => {
    setActionLoading((s) => ({ ...s, [id]: action }));
    try {
      await api.post(`${baseUrl}/verifikasi/${id}/${action}`, {
        catatan: catatan[id] ?? "",
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMsg((m) => ({
        ...m,
        [id]: {
          ok: true,
          text: action === "terima" ? "✅ Data diverifikasi." : "↩️ Data dikembalikan.",
        },
      }));
    } catch {
      setMsg((m) => ({ ...m, [id]: { ok: false, text: "❌ Gagal memproses." } }));
    } finally {
      setActionLoading((s) => ({ ...s, [id]: null }));
    }
  };

  const tone =
    baseUrl.includes("distribusi") ? "blue" : "teal";
  const border = tone === "blue" ? "border-blue-100" : "border-teal-100";
  const badgeBg = tone === "blue" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700";
  const pillBg = tone === "blue" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-teal-50 border-teal-200 text-teal-700";
  const itemBg = tone === "blue" ? "bg-blue-50 border-blue-100" : "bg-teal-50 border-teal-100";
  const btnOk = tone === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-teal-600 hover:bg-teal-700";

  return (
    <div className={`bg-white rounded-xl border ${border} shadow-sm p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          🔍 {title}
          {items.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeBg}`}>
              {items.length}
            </span>
          )}
        </h2>
        {unitBadge && (
          <span className={`text-xs ${pillBg} px-2 py-0.5 rounded-full font-medium`}>
            {unitBadge}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Data dari Pelaksana untuk verifikasi teknis sebelum diteruskan ke Kepala Bidang.
      </p>
      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat data masuk…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Tidak ada data yang perlu diverifikasi saat ini.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`p-3 rounded-lg border ${itemBg}`}>
              <p className="font-medium text-sm text-gray-800">
                {item.judul || item.title || `Data #${item.id}`}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {item.jenis ?? item.tipe ?? "data_lapangan"}
                {item.ringkas ? ` · ${item.ringkas}` : ""}
                {" · "}
                {(item.dibuat_pada || item.created_at)
                  ? new Date(item.dibuat_pada || item.created_at).toLocaleString("id-ID")
                  : "—"}
              </p>
              <textarea
                rows={1}
                value={catatan[item.id] ?? ""}
                onChange={(e) => setCatatan((c) => ({ ...c, [item.id]: e.target.value }))}
                placeholder="Catatan (opsional saat terima, wajib saat kembalikan)…"
                className="mt-2 w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400"
              />
              {msg[item.id] && (
                <p className={`text-xs mt-1 ${msg[item.id].ok ? "text-green-600" : "text-red-500"}`}>
                  {msg[item.id].text}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleVerifikasi(item.id, "terima")}
                  disabled={!!actionLoading[item.id]}
                  className={`px-3 py-1 ${btnOk} disabled:opacity-50 text-white text-xs font-semibold rounded transition`}
                >
                  {actionLoading[item.id] === "terima" ? "…" : "✅ Verifikasi"}
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifikasi(item.id, "kembalikan")}
                  disabled={!!actionLoading[item.id]}
                  className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold rounded transition"
                >
                  {actionLoading[item.id] === "kembalikan" ? "…" : "↩️ Kembalikan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
