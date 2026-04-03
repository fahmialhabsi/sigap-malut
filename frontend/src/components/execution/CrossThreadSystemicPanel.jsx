import React, { useEffect, useState } from "react";
import api from "../../services/api";

/**
 * Ringkasan analitik lintas thread untuk dashboard eksekutif (Gubernur / Kadis).
 */
export default function CrossThreadSystemicPanel({ className = "" }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/execution-thread/analytics/cross")
      .then((r) => {
        if (!cancelled) setData(r.data?.data || null);
      })
      .catch((e) => {
        if (!cancelled) {
          if (e?.response?.status === 403) setErr("Tidak memiliki akses analitik lintas thread.");
          else setErr(e?.message || "Gagal memuat");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div
        className={`rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-500 ${className}`}
      >
        Masalah sistemik: {err}
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div
        className={`rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-500 ${className}`}
      >
        Memuat analitik sistemik…
      </div>
    );
  }

  if (data.ok === false) {
    return (
      <div
        className={`rounded-2xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-xs text-amber-100 ${className}`}
      >
        Analitik lintas thread membutuhkan PostgreSQL.
      </div>
    );
  }

  const users = data.top_bottleneck_users || [];
  const units = data.top_problematic_units || [];
  const workload = data.workload_open_by_unit || [];

  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-950/85 px-4 py-4 ${className}`}
      aria-label="Masalah sistemik"
    >
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Masalah sistemik
      </div>
      <div className="mb-3 grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-2">
          <div className="text-[10px] uppercase text-slate-500">Thread diam &gt;7 h</div>
          <div className="mt-1 text-lg font-semibold text-rose-200">
            {data.threads_with_stale_activity_7d_plus ?? "—"}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-2 sm:col-span-2">
          <div className="text-[10px] uppercase text-slate-500">Distribusi thread dengan tugas terlambat</div>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span>tidak: {data.sla_open_overdue_distribution?.none ?? 0}</span>
            <span>rendah: {data.sla_open_overdue_distribution?.low ?? 0}</span>
            <span>sedang: {data.sla_open_overdue_distribution?.medium ?? 0}</span>
            <span>tinggi: {data.sla_open_overdue_distribution?.high ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase text-amber-200/90">
            Bottleneck penanggung jawab
          </div>
          <ul className="space-y-1 text-[11px]">
            {users.length === 0 ? (
              <li className="text-slate-500">Tidak ada sinyal overdue/eskalasi teragregasi.</li>
            ) : (
              users.map((u) => (
                <li key={u.user_id} className="flex justify-between gap-2 border-b border-slate-800/80 py-1">
                  <span className="truncate text-slate-200">{u.display_name}</span>
                  <span className="shrink-0 text-rose-300">{u.risk_task_count} tugas</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase text-rose-200/90">
            Unit paling banyak terlambat
          </div>
          <ul className="space-y-1 text-[11px]">
            {units.length === 0 ? (
              <li className="text-slate-500">Tidak ada tugas terbuka lewat deadline.</li>
            ) : (
              units.map((u) => (
                <li
                  key={u.unit_label}
                  className="flex justify-between gap-2 border-b border-slate-800/80 py-1"
                >
                  <span className="truncate text-slate-200">{u.unit_label}</span>
                  <span className="shrink-0 text-rose-300">{u.overdue_open_tasks}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 text-[10px] font-bold uppercase text-slate-400">Beban tugas terbuka per unit</div>
        <ul className="flex flex-wrap gap-2 text-[11px]">
          {workload.length === 0 ? (
            <li className="text-slate-500">—</li>
          ) : (
            workload.map((w) => (
              <li
                key={w.unit_label}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-1 text-slate-300"
              >
                {w.unit_label}: <span className="text-slate-100">{w.open_tasks}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
