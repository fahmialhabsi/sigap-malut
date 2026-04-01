import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

function kategoriBadge(kategori) {
  const k = String(kategori || "").toLowerCase();
  if (k === "sangat_baik") return { text: "Sangat Baik", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (k === "baik") return { text: "Baik", cls: "bg-green-50 text-green-700 border-green-200" };
  if (k === "cukup") return { text: "Cukup", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (k === "kurang") return { text: "Kurang", cls: "bg-orange-50 text-orange-700 border-orange-200" };
  if (k === "sangat_kurang") return { text: "Sangat Kurang", cls: "bg-red-50 text-red-700 border-red-200" };
  return { text: kategori || "—", cls: "bg-gray-50 text-gray-700 border-gray-200" };
}

export default function ScorecardBawahanPanel() {
  const [rows, setRows] = useState([]);
  const [avg, setAvg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [listRes, avgRes] = await Promise.all([
        api.get("/api/sekretaris/kinerja/bawahan"),
        api.get("/api/sekretaris/kinerja/bawahan/avg"),
      ]);
      setRows(Array.isArray(listRes.data?.data) ? listRes.data.data : []);
      setAvg(avgRes.data?.data?.avg_score ?? null);
    } catch {
      setRows([]);
      setAvg(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const u = r.yangDinilai || {};
      const name = String(u.nama_lengkap || "").toLowerCase();
      const jab = String(u.jabatan || r.jabatan_dinilai || "").toLowerCase();
      return name.includes(q) || jab.includes(q);
    });
  }, [rows, search]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">📊 Scorecard Kinerja Bawahan</h2>
          <p className="text-xs text-gray-500 mt-1">
            Ringkasan penilaian SKP bawahan langsung Sekretaris (periode berjalan).
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          ↺ Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Rata-rata Tim</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            {avg != null ? `${Number(avg).toFixed(0)}%` : "—"}
          </span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama/jabatan…"
          className="w-full md:max-w-sm md:ml-auto px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-10 text-center animate-pulse">Memuat scorecard…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-400 py-10 text-center">
          Belum ada data SKP untuk periode ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const u = r.yangDinilai || {};
            const badge = kategoriBadge(r.kategori);
            const skor = r.skor_total != null ? Number(r.skor_total) : null;
            return (
              <div
                key={r.id}
                className="rounded-xl border border-gray-100 shadow-sm bg-white p-4 hover:border-emerald-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 truncate">
                      {u.nama_lengkap || "—"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {u.jabatan || r.jabatan_dinilai || "—"}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${badge.cls}`}>
                    {badge.text}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Skor Total</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {skor != null ? `${skor.toFixed(0)}%` : "—"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    disabled
                    title="Form isi SKP akan diaktifkan di tahap berikutnya"
                  >
                    Isi SKP
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">
                    Eksekusi: {r.skor_eksekusi_tugas ?? "—"}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">
                    Kepatuhan: {r.skor_kepatuhan_alur ?? "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

