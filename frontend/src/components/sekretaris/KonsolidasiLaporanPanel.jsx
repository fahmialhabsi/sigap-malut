import React, { useEffect, useState } from "react";
import api from "../../services/api";

function unitPill(ok, label) {
  if (ok) return <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">{label} ✅</span>;
  return <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{label} ❌</span>;
}

export default function KonsolidasiLaporanPanel() {
  const [row, setRow] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sekretaris/konsolidasi");
      setRow(res.data?.data ?? null);
      setMeta(res.data?.meta ?? null);
    } catch {
      setRow(null);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  const ensure = async () => {
    setLoading(true);
    try {
      await api.post("/sekretaris/konsolidasi/ensure", {});
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const periode = meta
    ? `${String(meta.periode_bulan).padStart(2, "0")}/${meta.periode_tahun} (${meta.jenis_laporan})`
    : "—";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">📑 Konsolidasi Laporan (3 Bidang + UPTD)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Status submit laporan per unit untuk periode berjalan. Sekretaris adalah konsolidator final sebelum KaDin.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStatus}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
          >
            ↺ Refresh
          </button>
          <button
            onClick={ensure}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Buat Periode
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500">Periode: <strong className="text-gray-700">{periode}</strong></span>
        <span className="text-xs text-gray-500">
          {loading ? "Memuat…" : row ? `Status: ${row.status}` : "Belum ada data"}
        </span>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-10 text-center animate-pulse">Memuat konsolidasi…</div>
      ) : !row ? (
        <div className="text-sm text-gray-400 py-10 text-center">
          Row konsolidasi belum dibuat untuk periode ini. Klik <strong>Buat Periode</strong>.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {unitPill(!!row.ketersediaan_submitted, "Ketersediaan")}
            {unitPill(!!row.distribusi_submitted, "Distribusi")}
            {unitPill(!!row.konsumsi_submitted, "Konsumsi")}
            {unitPill(!!row.uptd_submitted, "UPTD")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Ringkasan</div>
              <div className="mt-2 text-sm text-gray-700">
                <ul className="list-disc ml-5 space-y-1">
                  <li>Ketersediaan: {row.ketersediaan_submitted_at ? new Date(row.ketersediaan_submitted_at).toLocaleString("id-ID") : "—"}</li>
                  <li>Distribusi: {row.distribusi_submitted_at ? new Date(row.distribusi_submitted_at).toLocaleString("id-ID") : "—"}</li>
                  <li>Konsumsi: {row.konsumsi_submitted_at ? new Date(row.konsumsi_submitted_at).toLocaleString("id-ID") : "—"}</li>
                  <li>UPTD: {row.uptd_submitted_at ? new Date(row.uptd_submitted_at).toLocaleString("id-ID") : "—"}</li>
                </ul>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="text-xs text-gray-500">Aksi</div>
              <div className="mt-2 text-sm text-gray-600">
                Tombol generate/teruskan KaDin akan aktif setelah service generator dan validasi “semua unit submit” ditambahkan.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

