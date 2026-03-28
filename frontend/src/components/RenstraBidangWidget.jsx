// frontend/src/components/RenstraBidangWidget.jsx
// Panel "Renstra Bidang Saya" untuk 3 Kepala Bidang (Ketersediaan, Distribusi, Konsumsi).
// Menampilkan status dokumen Renstra aktif + Target vs Realisasi dari e-Pelara.
// Menjawab kebutuhan Bagian IV, Role 3 dari dokumen analisis.
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import BukaEPelaraButton from "./BukaEPelaraButton";

const STATUS_COLOR = {
  draft: "bg-gray-100 text-gray-600",
  diajukan: "bg-amber-100 text-amber-700",
  diverifikasi: "bg-blue-100 text-blue-700",
  disetujui: "bg-green-100 text-green-700",
  ditolak: "bg-red-100 text-red-700",
};

/**
 * Props:
 *   bidangLabel   — label tampilan, e.g. "Distribusi Pangan"
 *   programKeyword — kata kunci filter, e.g. "distribusi"
 *   tahun          — opsional, default tahun berjalan
 */
export default function RenstraBidangWidget({
  bidangLabel = "Bidang",
  programKeyword = "",
  tahun = new Date().getFullYear(),
}) {
  const [renstra, setRenstra] = useState([]);
  const [target, setTarget] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get("/api/epelara/renstra-opd", { params: { tahun, limit: 5 } }),
      api.get("/api/epelara/target-renstra", { params: { tahun, limit: 8 } }),
    ])
      .then(([renstraRes, targetRes]) => {
        if (renstraRes.status === "fulfilled") {
          const d = renstraRes.value.data;
          const all = Array.isArray(d) ? d : d?.data || [];
          // filter client-side by keyword
          const filtered = programKeyword
            ? all.filter((r) =>
                JSON.stringify(r)
                  .toLowerCase()
                  .includes(programKeyword.toLowerCase()),
              )
            : all;
          setRenstra(filtered.slice(0, 3));
        }
        if (targetRes.status === "fulfilled") {
          const d = targetRes.value.data;
          const all = Array.isArray(d) ? d : d?.data || [];
          const filtered = programKeyword
            ? all.filter((r) =>
                JSON.stringify(r)
                  .toLowerCase()
                  .includes(programKeyword.toLowerCase()),
              )
            : all;
          setTarget(filtered.slice(0, 6));
        }
      })
      .finally(() => setLoading(false));
  }, [programKeyword, tahun]);

  return (
    <div className="mt-8 space-y-6">
      {/* Status Renstra Bidang */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📄 Renstra Bidang Saya — {bidangLabel} ({tahun})
          </h2>
          <BukaEPelaraButton
            label="Edit di e-Pelara →"
            targetPath="/dashboard-renstra"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        {loading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat data Renstra…
          </p>
        ) : renstra.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada data Renstra untuk bidang ini di e-Pelara.
          </p>
        ) : (
          <div className="space-y-3">
            {renstra.map((r, i) => (
              <div
                key={r.id ?? i}
                className="flex items-start justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-indigo-900 text-sm">
                    {r.judul ||
                      r.jenis_dokumen ||
                      r.tujuan ||
                      `Dokumen #${i + 1}`}
                  </p>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    {r.sasaran || r.program || "—"} · Tahun: {r.tahun || tahun}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    STATUS_COLOR[r.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.status || "draft"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Target vs Realisasi Tahunan */}
      {target.length > 0 && (
        <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎯 Target vs Realisasi — {bidangLabel} ({tahun})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">
                    Indikator / Sub-Kegiatan
                  </th>
                  <th className="px-3 py-2 text-right">Target</th>
                  <th className="px-3 py-2 text-right">Realisasi</th>
                  <th className="px-3 py-2 text-center">Capaian</th>
                </tr>
              </thead>
              <tbody>
                {target.map((t, i) => {
                  const tgt = Number(t.target_nilai ?? t.target ?? 0);
                  const real = Number(t.realisasi ?? t.capaian ?? 0);
                  const pct = tgt > 0 ? Math.round((real / tgt) * 100) : null;
                  return (
                    <tr
                      key={t.id ?? i}
                      className="border-t border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 font-medium text-gray-800 max-w-[240px] truncate">
                        {t.nama_indikator ??
                          t.indikator ??
                          t.nama_sub_kegiatan ??
                          `Indikator #${i + 1}`}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {tgt > 0 ? tgt.toLocaleString("id-ID") : "—"}
                        {t.satuan ? ` ${t.satuan}` : ""}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {real > 0 ? real.toLocaleString("id-ID") : "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {pct !== null ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              pct >= 80
                                ? "bg-green-100 text-green-700"
                                : pct >= 50
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {pct}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
