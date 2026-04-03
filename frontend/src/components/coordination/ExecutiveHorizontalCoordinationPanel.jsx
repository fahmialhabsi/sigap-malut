import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { executiveTheme } from "../../ui/dashboards/executiveTheme";

function threadHref(id) {
  if (!id) return "#";
  return `/dashboard/execution-thread/${encodeURIComponent(id)}`;
}

/**
 * Widget eksekutif: dampak koordinasi horizontal pada thread (Gubernur / Kepala Dinas).
 */
export default function ExecutiveHorizontalCoordinationPanel({ subtitle }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get("/coordination/horizontal/dashboard/executive");
      setData(r.data?.data || null);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Gagal memuat");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const s = data?.summary || {};
  const riskThreads = data?.high_risk_threads || [];
  const sample = data?.sample_critical || [];
  const open = Number(s.total_open_horizontal || 0);
  const overdue = Number(s.overdue_horizontal || 0);
  const isCalm = !loading && !err && open === 0 && overdue === 0;

  return (
    <section className={`mb-6 ${executiveTheme.panel}`} aria-label="Koordinasi horizontal eksekutif">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <div>
          <div className={executiveTheme.panelTitle}>Dampak koordinasi lintas unit</div>
          {subtitle ? <div className={executiveTheme.panelSubtitle}>{subtitle}</div> : null}
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="rounded-lg border border-slate-600 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
        >
          Muat ulang
        </button>
      </div>

      <div className="p-4">
        {err ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
            {err}
          </div>
        ) : null}
        {loading ? (
          <p className="text-sm text-slate-500">Memuat ringkasan dampak koordinasi horizontal…</p>
        ) : (
          <>
            {isCalm ? (
              <p className="mb-4 rounded-lg border border-slate-700/60 bg-slate-900/30 px-3 py-2 text-xs text-slate-400">
                Tidak ada koordinasi horizontal terbuka dan tidak ada item melewati SLA pada agregat saat ini.
                Detail operasional ada di tingkat Sekretaris/Kabid/UPTD.
              </p>
            ) : null}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["Koordinasi terbuka", s.total_open_horizontal],
                ["Terlambat SLA", s.overdue_horizontal],
                ["Thread terdampak", s.distinct_threads_touched],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-2 text-center"
                >
                  <div className="text-xl font-bold text-slate-100">{val ?? "—"}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {s.top_slow_units?.length ? (
              <div className="mb-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Unit lambat (top 3): </span>
                {s.top_slow_units.slice(0, 3).map((u) => `${u.label} (~${u.avg_response_hours}j)`).join(" · ")}
              </div>
            ) : null}

            {riskThreads.length ? (
              <div className="mb-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  Thread risiko koordinasi (top 3)
                </div>
                <div className="flex flex-wrap gap-2">
                  {riskThreads.slice(0, 3).map((tid) => (
                    <Link
                      key={tid}
                      to={threadHref(tid)}
                      className="rounded-md border border-rose-500/30 bg-rose-950/20 px-2 py-1 font-mono text-[10px] text-rose-100 hover:bg-rose-950/40"
                    >
                      {String(tid).slice(0, 10)}…
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {sample.length ? (
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Sampel kritis (top 3)
                </div>
                <ul className="max-h-40 space-y-2 overflow-y-auto text-xs text-slate-300">
                  {sample.slice(0, 3).map((row) => (
                    <li key={row.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-800/80 py-1">
                      <span>{row.subject || `Item #${row.id}`}</span>
                      <Link to={threadHref(row.execution_thread_id)} className="text-sky-300 hover:underline">
                        Thread
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
