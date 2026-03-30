// Strip coverage pasar hari ini — Pelaksana Distribusi
import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function ProgressCoverageHariIniStrip() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/pelaksana/harga-pasar/coverage", { params: { total_pasar: 3 } })
      .then((res) => setData(res.data?.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-xs text-blue-200/80 py-1 animate-pulse">Memuat coverage pasar…</div>;
  }
  if (!data) return null;

  const full = data.sudah >= data.total;
  return (
    <div
      className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium flex flex-wrap items-center gap-2 ${
        full ? "bg-emerald-500/15 text-emerald-100 border border-emerald-400/30" : "bg-amber-500/15 text-amber-100 border border-amber-400/30"
      }`}
    >
      {full ? (
        <span>✅ Semua {data.total} pasar penugasan sudah ada input hari ini ({data.tanggal})</span>
      ) : (
        <>
          <span>
            📊 Input pasar: <strong>{data.sudah}</strong>/{data.total} · Deadline 14.00 WIT
          </span>
        </>
      )}
    </div>
  );
}
