import React, { useEffect, useState } from "react";
import api from "../../services/api";

/**
 * Ringkasan hub eksekusi multi-level (GET /api/execution-thread/hub/summary).
 */
export default function ExecutionThreadHubStrip({ className = "" }) {
  const [hub, setHub] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/execution-thread/hub/summary")
      .then((r) => {
        if (!cancelled) setHub(r.data?.data || null);
      })
      .catch((e) => {
        if (!cancelled) setErr(e?.message || "Gagal memuat hub");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div
        className={`rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-100 ${className}`}
      >
        Hub eksekusi: {err}
      </div>
    );
  }

  if (!hub) {
    return (
      <div
        className={`rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-500 ${className}`}
      >
        Memuat ringkasan thread eksekusi…
      </div>
    );
  }

  const perspective = hub.perspective || hub.role_tier || "—";
  const threads = Array.isArray(hub.threads) ? hub.threads : [];

  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 ${className}`}
      aria-label="Hub kontrol eksekusi"
    >
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Thread eksekusi · {perspective.replace(/_/g, " ")}
      </div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-400">
        <span>
          Thread:{" "}
          <strong className="text-slate-200">{hub.totals?.threads ?? 0}</strong>
        </span>
        <span>
          Tugas terbuka (sampel):{" "}
          <strong className="text-slate-200">
            {hub.totals?.open_tasks_sampled ?? 0}
          </strong>
        </span>
      </div>
      {threads.length === 0 ? (
        <p className="text-xs text-slate-500">Belum ada thread untuk peran Anda.</p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto text-xs">
          {threads.slice(0, 8).map((t) => (
            <li
              key={t.thread_id}
              className="flex flex-col gap-0.5 border-b border-slate-800/80 pb-2 last:border-0"
            >
              <span className="font-medium text-slate-200">{t.label}</span>
              <span className="font-mono text-[10px] text-slate-500">
                {t.thread_id}
              </span>
              {t.kpi_hierarki?.chain ? (
                <span className="text-slate-500">
                  KPI: UPTD {t.kpi_hierarki.chain[0]?.open_assignments ?? 0} terbuka
                  · Kabid {t.kpi_hierarki.chain[1]?.open_assignments ?? 0}
                  · Sekr. {t.kpi_hierarki.chain[2]?.open_assignments ?? 0}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
