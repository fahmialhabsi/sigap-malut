import React, { useEffect, useState } from "react";
import api from "../../services/api";

function StatPill({ label, value, tone }) {
  const toneClass =
    tone === "red"
      ? "bg-red-50 border-red-200 text-red-700"
      : tone === "amber"
        ? "bg-amber-50 border-amber-200 text-amber-700"
        : tone === "emerald"
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-sky-50 border-sky-200 text-sky-700";

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <div className="text-[11px] font-semibold opacity-80">{label}</div>
      <div className="text-sm font-extrabold">{value}</div>
    </div>
  );
}

export default function HeroLabDashboardPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/uptd/dashboard/lab-workload")
      .then((res) => setData(res.data?.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const updatedAt = data?.updated_at ? new Date(data.updated_at) : null;
  const q = data?.sample_queue;
  const sert = data?.sertifikasi;
  const alat = data?.alat_lab;

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            🔬 Status Lab — UPTD Balai Pengawasan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Update:{" "}
            {loading
              ? "memuat…"
              : updatedAt
                ? updatedAt.toLocaleString("id-ID")
                : "—"}
          </p>
        </div>
        <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          real data
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat workload…</p>
      ) : !data ? (
        <p className="text-sm text-gray-400 italic">
          Data workload belum tersedia.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-700 mb-2">
                SAMPLE QUEUE
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total antrean</span>
                <span className="font-extrabold text-gray-900">
                  {q?.total ?? 0}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <StatPill label="Menunggu" value={q?.menunggu ?? 0} tone="amber" />
                <StatPill
                  label="Dalam Proses"
                  value={q?.dalam_proses ?? 0}
                  tone="sky"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-700 mb-2">
                KPI BULAN INI
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatPill
                  label="Selesai"
                  value={data?.kpi_bulan_ini?.selesai ?? 0}
                  tone="emerald"
                />
                <StatPill
                  label="Pass Rate"
                  value={
                    data?.kpi_bulan_ini?.pass_rate_persen == null
                      ? "—"
                      : `${data.kpi_bulan_ini.pass_rate_persen}%`
                  }
                  tone="sky"
                />
                <StatPill
                  label="Avg TAT"
                  value={
                    data?.kpi_bulan_ini?.avg_turnaround_hari == null
                      ? "—"
                      : `${data.kpi_bulan_ini.avg_turnaround_hari} hari`
                  }
                  tone="sky"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="text-xs font-bold text-slate-700 mb-2">
                SERTIFIKASI
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatPill label="Aktif" value={sert?.aktif ?? 0} tone="emerald" />
                <StatPill
                  label="Expiry <30 hari"
                  value={sert?.expiry_lt_30_hari ?? 0}
                  tone="amber"
                />
                <StatPill
                  label="Expiry <7 hari"
                  value={sert?.expiry_lt_7_hari ?? 0}
                  tone="red"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="text-xs font-bold text-slate-700 mb-2">ALAT LAB</div>
              <div className="grid grid-cols-3 gap-2">
                <StatPill
                  label="Operasional"
                  value={alat?.operasional ?? 0}
                  tone="emerald"
                />
                <StatPill
                  label="Terjadwal (<7h)"
                  value={alat?.kalibrasi_terjadwal ?? 0}
                  tone="amber"
                />
                <StatPill
                  label="Overdue"
                  value={alat?.overdue_kalibrasi ?? 0}
                  tone="red"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

