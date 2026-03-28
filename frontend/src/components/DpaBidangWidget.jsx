// frontend/src/components/DpaBidangWidget.jsx
// A-08 / K-03: Widget "DPA Bidang Saya" — ditampilkan di dashboard 3 Kepala Bidang
// Data diambil via SIGAP proxy → e-Pelara GET /api/dpa
import React, { useEffect, useState } from "react";
import api from "../utils/api";

function formatRupiah(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Props:
 *  - bidangLabel   : string   — nama tampilan bidang, e.g. "Distribusi Pangan"
 *  - programKeyword: string   — kata kunci untuk client-side filter kolom `program` (opsional)
 *  - tahun         : string   — filter tahun, default: tahun sekarang
 */
export default function DpaBidangWidget({
  bidangLabel = "Bidang",
  programKeyword = "",
  tahun = String(new Date().getFullYear()),
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get("/epelara/dpa", { params: { tahun } })
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        const filtered = programKeyword.trim()
          ? rows.filter((r) =>
              String(r.program || "")
                .toLowerCase()
                .includes(programKeyword.toLowerCase()),
            )
          : rows;
        setData(filtered);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Gagal memuat data DPA.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tahun, programKeyword]);

  return (
    <div className="bg-gradient-to-r from-slate-900/95 to-blue-900/80 border-2 border-blue-700/50 rounded-2xl p-6 shadow-xl">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-xl">📄</span>
        DPA {bidangLabel} — Tahun {tahun}
      </h2>

      {loading && (
        <p className="text-sm text-blue-200/75 animate-pulse">
          Memuat data DPA dari e-Pelara…
        </p>
      )}

      {!loading && error && (
        <div className="text-sm text-red-300 bg-red-900/30 border border-red-700/40 rounded-lg px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-sm text-slate-400 italic">
          Belum ada data DPA untuk tahun {tahun}.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-blue-700/30">
          <table className="min-w-full text-xs text-left text-slate-200">
            <thead className="bg-blue-900/60 text-blue-200 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">Program / Kegiatan</th>
                <th className="px-3 py-2">Sub-Kegiatan</th>
                <th className="px-3 py-2 text-right">Anggaran</th>
                <th className="px-3 py-2">Jenis Dokumen</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className={
                    idx % 2 === 0 ? "bg-slate-900/40" : "bg-blue-900/20"
                  }
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-white truncate max-w-[200px]">
                      {row.program || "—"}
                    </div>
                    <div className="text-slate-400 truncate max-w-[200px]">
                      {row.kegiatan || ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-300 truncate max-w-[160px]">
                    {row.sub_kegiatan || "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-green-300 whitespace-nowrap">
                    {formatRupiah(row.anggaran)}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {row.jenis_dokumen || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-xs text-slate-500 px-3 py-1">
            {data.length} item
          </div>
        </div>
      )}
    </div>
  );
}
