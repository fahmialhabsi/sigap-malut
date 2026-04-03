import React, { useEffect, useState } from "react";
import api from "../../services/api";

const STATUS_STYLE = {
  baru: "bg-red-50 border-red-200 text-red-700",
  investigasi: "bg-amber-50 border-amber-200 text-amber-700",
  uji_lab: "bg-indigo-50 border-indigo-200 text-indigo-700",
  selesai: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

export default function AlertKeracunanPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/kabid-konsumsi/keracunan/aktif")
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const handleKoordinasi = async (id) => {
    setMsg("");
    try {
      await api.post(`/api/kabid-konsumsi/keracunan/${id}/koordinasi-uptd`);
      setMsg("✅ Permintaan uji ke UPTD dibuat (mock).");
    } catch {
      setMsg("❌ Gagal membuat permintaan ke UPTD.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            🚨 Alert Keracunan Pangan
            {rows.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-bold">
                {rows.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Insidental, prioritas darurat (respon 24 jam).
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat alert…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Tidak ada alert keracunan aktif.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const st = String(r.status || "").toLowerCase();
            const cls = STATUS_STYLE[st] || "bg-slate-50 border-slate-200 text-slate-700";
            return (
              <div key={r.id} className={`rounded-lg border p-4 ${cls}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold">
                      {r.nomor_kasus || `Kasus #${r.id}`}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {r.lokasi || "Lokasi tidak tersedia"}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Korban: {r.jumlah_korban ?? "—"} · {r.kabupaten_kota || "—"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Sumber: {r.sumber_laporan || "—"} · Status:{" "}
                      <span className="font-semibold">{st || "—"}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleKoordinasi(r.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Hubungi UPTD
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {msg && <p className="text-xs text-gray-600 mt-3">{msg}</p>}
    </div>
  );
}

