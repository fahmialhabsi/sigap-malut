import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const LEVEL_ORDER = [
  "gubernur",
  "kadis",
  "sekretaris",
  "kabid",
  "uptd",
  "pelaksana",
  "operasional",
  "lainnya",
];

function healthColor(s) {
  if (s === "critical") return "text-rose-300 border-rose-500/40 bg-rose-950/30";
  if (s === "warning") return "text-amber-200 border-amber-500/35 bg-amber-950/25";
  return "text-emerald-200 border-emerald-500/30 bg-emerald-950/20";
}

/**
 * Pusat observasi: hub thread, rollup KPI hierarki, health, timeline per level (GET /api/execution-thread/*).
 */
export default function ExecutionThreadObservabilityPanel({
  className = "",
  title = "Observabilitas rantai eksekusi",
  /** Jika diisi (mis. dari URL), thread ini dipilih setelah hub termuat */
  initialThreadId = "",
  /** Query `jump` untuk API (mis. first_instruksi, last_event) */
  initialJump = "",
}) {
  const [hub, setHub] = useState(null);
  const [rollup, setRollup] = useState(null);
  const [sel, setSel] = useState("");
  const [detail, setDetail] = useState(null);
  const [mode, setMode] = useState("ringkas");
  const [levelFilter, setLevelFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [markerFilter, setMarkerFilter] = useState("");
  const [horizontalOnly, setHorizontalOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    Promise.all([
      api.get("/execution-thread/hub/summary"),
      api.get("/execution-thread/kpi/hierarchy"),
    ])
      .then(([a, b]) => {
        if (cancelled) return;
        setHub(a.data?.data || null);
        setRollup(b.data?.data || null);
        const first =
          (initialThreadId && String(initialThreadId)) ||
          a.data?.data?.threads?.[0]?.thread_id;
        if (first) setSel(first);
      })
      .catch((e) => {
        if (!cancelled) setErr(e?.message || "Gagal memuat");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialThreadId]);

  useEffect(() => {
    if (initialThreadId) setSel(String(initialThreadId));
  }, [initialThreadId]);

  const loadDetail = useCallback(async (threadId, m, filters) => {
    if (!threadId) return;
    const params = new URLSearchParams();
    if (m === "ringkas") params.set("mode", "ringkas");
    if (filters?.level) params.set("level", filters.level);
    if (filters?.kind) params.set("kind", filters.kind);
    if (filters?.marker) params.set("marker", filters.marker);
    if (filters?.horizontalOnly) params.set("horizontal_only", "1");
    if (filters?.jump) params.set("jump", filters.jump);
    const qs = params.toString();
    const r = await api.get(`/execution-thread/${threadId}${qs ? `?${qs}` : ""}`);
    setDetail(r.data?.data || null);
  }, []);

  useEffect(() => {
    if (!sel) return;
    loadDetail(sel, mode, {
      level: levelFilter.trim(),
      kind: kindFilter.trim(),
      marker: markerFilter.trim(),
      horizontalOnly,
      jump: String(initialJump || "").trim(),
    }).catch(() => setDetail(null));
  }, [
    sel,
    mode,
    levelFilter,
    kindFilter,
    markerFilter,
    horizontalOnly,
    initialJump,
    loadDetail,
  ]);

  const scrollToSortKey = useCallback((sortKey) => {
    if (!sortKey) return;
    const el = document.getElementById(`thread-ev-${String(sortKey).replace(/[^a-zA-Z0-9_-]/g, "_")}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const miniMapBuckets = (() => {
    const tl = detail?.timeline || [];
    const n = 14;
    if (!tl.length) return Array(n).fill(0);
    const buckets = Array(n).fill(0);
    const chunk = Math.max(1, Math.ceil(tl.length / n));
    for (let i = 0; i < tl.length; i += 1) {
      buckets[Math.min(n - 1, Math.floor(i / chunk))] += 1;
    }
    const max = Math.max(...buckets, 1);
    return buckets.map((c) => c / max);
  })();

  if (err) {
    return (
      <div
        className={`rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-100 ${className}`}
      >
        {title}: {err}
      </div>
    );
  }

  if (loading && !hub) {
    return (
      <div
        className={`rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-500 ${className}`}
      >
        Memuat observabilitas thread…
      </div>
    );
  }

  const threads = hub?.threads || [];
  const health = detail?.cockpit?.thread_health;
  const pctComplete = detail?.kpi_hierarki?.extended?.completion_rate;
  const pctLabel =
    pctComplete != null ? `${Math.round(Number(pctComplete) * 100)}%` : "—";

  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-950/85 px-4 py-4 ${className}`}
      aria-label={title}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </div>
          {rollup?.aggregates ? (
            <div className="mt-1 text-xs text-slate-400">
              Agregat sampel: klarifikasi {rollup.aggregates.clarification_threads} ·
              eskalasi {rollup.aggregates.escalations} · SLA terbuka{" "}
              {rollup.aggregates.sla_breach_open_tasks} · laporan operasional{" "}
              {rollup.aggregates.operational_records} · beban tugas terbuka{" "}
              {rollup.aggregates.active_load_open_tasks}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="max-w-[min(100%,280px)] rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
            value={sel}
            onChange={(e) => setSel(e.target.value)}
          >
            {threads.length === 0 ? (
              <option value="">— Tidak ada thread —</option>
            ) : null}
            {threads.map((t) => (
              <option key={t.thread_id} value={t.thread_id}>
                {(t.label || "").slice(0, 72) || t.thread_id}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`rounded-lg px-2 py-1 text-xs ${mode === "ringkas" ? "bg-slate-700 text-white" : "text-slate-400"}`}
            onClick={() => setMode("ringkas")}
          >
            Ringkas
          </button>
          <button
            type="button"
            className={`rounded-lg px-2 py-1 text-xs ${mode === "detail" ? "bg-slate-700 text-white" : "text-slate-400"}`}
            onClick={() => setMode("detail")}
          >
            Detail
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-[11px] text-slate-400">
        <label className="flex items-center gap-1">
          <span className="text-slate-500">Level</span>
          <input
            className="w-28 rounded border border-slate-700 bg-slate-950 px-1 py-0.5 text-slate-200"
            placeholder="kabid,uptd"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-1">
          <span className="text-slate-500">Jenis</span>
          <input
            className="w-28 rounded border border-slate-700 bg-slate-950 px-1 py-0.5 text-slate-200"
            placeholder="task,instruksi"
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-1">
          <span className="text-slate-500">Marker</span>
          <input
            className="w-24 rounded border border-slate-700 bg-slate-950 px-1 py-0.5 text-slate-200"
            placeholder="eskalasi"
            value={markerFilter}
            onChange={(e) => setMarkerFilter(e.target.value)}
          />
        </label>
        <label className="flex cursor-pointer items-center gap-1 text-slate-300">
          <input
            type="checkbox"
            checked={horizontalOnly}
            onChange={(e) => setHorizontalOnly(e.target.checked)}
          />
          Hanya koordinasi horizontal
        </label>
      </div>

      {detail?.navigation_meta &&
      (detail.navigation_meta.jump_hint ||
        Object.values(detail.navigation_meta.jump_targets || {}).some(Boolean)) ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="text-slate-500">Loncat:</span>
          {Object.entries(detail.navigation_meta.jump_targets || {})
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <button
                key={k}
                type="button"
                className="rounded border border-slate-700 px-2 py-0.5 text-slate-300 hover:bg-slate-800"
                onClick={() => scrollToSortKey(v)}
              >
                {k.replace(/_/g, " ")}
              </button>
            ))}
          {detail.navigation_meta.jump_hint ? (
            <button
              type="button"
              className="rounded border border-indigo-600/50 px-2 py-0.5 text-indigo-200 hover:bg-indigo-950/40"
              onClick={() => scrollToSortKey(detail.navigation_meta.jump_hint)}
            >
              Target jump URL
            </button>
          ) : null}
        </div>
      ) : null}

      {detail?.timeline?.length ? (
        <div className="mb-3 flex h-6 items-end gap-px" title="Mini-map kepadatan timeline (terfilter)">
          {miniMapBuckets.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-slate-700"
              style={{ height: `${Math.max(12, h * 24)}px`, opacity: 0.35 + h * 0.55 }}
            />
          ))}
        </div>
      ) : null}

      {detail?.decision_engine ? (
        <div className="mb-3 rounded-xl border border-indigo-500/30 bg-indigo-950/25 px-3 py-2 text-xs text-indigo-100">
          <div className="font-semibold uppercase tracking-wide text-indigo-300">
            Decision engine
          </div>
          <div className="mt-1 text-sm text-white">
            Skor {detail.decision_engine.decision_score}/100 ·{" "}
            <span className="text-indigo-200">{detail.decision_engine.severity_level}</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-indigo-100/90">
            {detail.decision_engine.recommendation_text}
          </p>
          {detail.decision_engine.machine_assisted ? (
            <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-indigo-200/90">
              Keyakinan (heuristik) {Math.round((detail.decision_engine.machine_assisted.confidence_score || 0) * 100)}% ·
              risiko {Math.round((detail.decision_engine.machine_assisted.risk_score || 0) * 100)}% —{" "}
              {detail.decision_engine.machine_assisted.disclaimer}
            </div>
          ) : null}
          {detail.decision_engine.badges?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {detail.decision_engine.badges.map((b) => (
                <span
                  key={b.code}
                  className="rounded-md border border-white/10 bg-black/20 px-2 py-0.5 text-[10px]"
                >
                  {b.icon ? `${b.icon} ` : ""}
                  {b.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {detail?.insights ? (
        <div className="mb-3 rounded-xl border border-cyan-500/25 bg-cyan-950/20 px-3 py-2 text-[11px] text-cyan-100">
          <div className="font-semibold uppercase tracking-wide text-cyan-300">Insights</div>
          <div className="mt-1 text-slate-300">
            Prediktif: risiko tunda koordinasi{" "}
            <strong>{detail.insights.predictive?.coordination_delay_risk || "—"}</strong> · terbuka{" "}
            {detail.insights.predictive?.open_horizontal_items ?? "—"} · SLA lewat{" "}
            {detail.insights.predictive?.horizontal_sla_overdue ?? "—"}
          </div>
          {detail.insights.policy_engine?.flags?.length ? (
            <ul className="mt-1 list-disc pl-4 text-slate-400">
              {detail.insights.policy_engine.flags.map((f) => (
                <li key={f.id}>
                  <span className="text-slate-500">[{f.severity}]</span> {f.label}
                </li>
              ))}
            </ul>
          ) : null}
          {detail.insights.suggested_actions?.length ? (
            <ul className="mt-1 list-disc pl-4 text-amber-200/90">
              {detail.insights.suggested_actions.map((a, i) => (
                <li key={i}>
                  {a.label}
                  {a.automated_execution === false ? (
                    <span className="text-slate-500"> (manual)</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          {detail.insights.action_disclaimer ? (
            <p className="mt-1 text-[10px] text-slate-500">{detail.insights.action_disclaimer}</p>
          ) : null}
        </div>
      ) : null}

      {health ? (
        <div className={`mb-3 rounded-xl border px-3 py-2 text-xs ${healthColor(health.status)}`}>
          <strong className="uppercase tracking-wide">Kesehatan thread: {health.status}</strong>
          <span className="ml-2 opacity-90">
            {health.stale_days != null
              ? ` · aktivitas terakhir ~${health.stale_days} hari lalu`
              : ""}
          </span>
          {health.bottlenecks?.length ? (
            <ul className="mt-1 list-disc pl-4 text-[11px]">
              {health.bottlenecks.map((b) => (
                <li key={b.type}>{b.label}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {detail?.cockpit ? (
        <div className="mb-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800/90 bg-slate-900/50 p-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Mandat / instruksi
            </div>
            <div className="mt-1 font-medium text-slate-100">
              {detail.cockpit.mandat_root?.judul ||
                detail.cockpit.mandat_root?.note ||
                "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800/90 bg-slate-900/50 p-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Penanggung jawab saat ini
            </div>
            <div className="mt-1">{detail.cockpit.current_owner?.label || "—"}</div>
          </div>
          <div className="rounded-lg border border-slate-800/90 bg-slate-900/50 p-2 sm:col-span-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Aksi terakhir
            </div>
            <div className="mt-1">
              {detail.cockpit.last_action?.summary || "—"}{" "}
              <span className="text-slate-500">
                {detail.cockpit.last_action?.at
                  ? new Date(detail.cockpit.last_action.at).toLocaleString("id-ID")
                  : ""}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {detail?.kpi_hierarki?.extended ? (
        <div className="mb-3 rounded-lg border border-slate-800 bg-slate-900/40 p-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">KPI perilaku:</span> tingkat selesai{" "}
          {pctLabel} · beban terbuka {detail.kpi_hierarki.extended.active_load_open_tasks} ·
          skor kualitas rantai {detail.kpi_hierarki.extended.thread_completion_quality_score ?? "—"}{" "}
          · tren aktivitas {detail.kpi_hierarki.trends?.aktivitas_thread}
        </div>
      ) : null}

      {detail?.timeline?.length ? (
        <div className="mb-3 max-h-48 overflow-y-auto rounded-lg border border-slate-800/80 bg-slate-950/50 p-2">
          <div className="mb-2 text-[10px] font-semibold uppercase text-slate-500">
            Alur aktivitas (terfilter API, {detail.timeline_unfiltered_count ?? "?"} total)
          </div>
          <ul className="space-y-1">
            {detail.timeline.slice(-80).map((ev, i) => {
              const sid = String(ev.sort_key || i).replace(/[^a-zA-Z0-9_-]/g, "_");
              return (
                <li
                  id={`thread-ev-${sid}`}
                  key={`tl-${sid}-${i}`}
                  className="text-[11px] text-slate-400"
                >
                  <span className="text-slate-600">{ev.kind}</span> · {ev.summary || ev.activity}{" "}
                  <span className="text-slate-600">
                    {ev.occurred_at
                      ? new Date(ev.occurred_at).toLocaleString("id-ID")
                      : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {detail?.cockpit?.timeline_by_level ? (
        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <div className="mb-2 text-[10px] font-semibold uppercase text-slate-500">
            Timeline per level organisasi
          </div>
          {LEVEL_ORDER.map((lv) => {
            const arr = detail.cockpit.timeline_by_level[lv];
            if (!arr?.length) return null;
            return (
              <div key={lv} className="mb-2">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {lv.replace(/_/g, " ")}
                </div>
                <ul className="space-y-1 border-l border-slate-700 pl-2">
                  {arr.slice(-10).map((ev, i) => (
                    <li
                      key={`${lv}-${ev.sort_key || i}`}
                      className="text-[11px] text-slate-300"
                    >
                      <span
                        className={
                          ev.marker === "selesai"
                            ? "text-emerald-400"
                            : ev.marker === "eskalasi"
                              ? "text-rose-400"
                              : ev.marker === "klarifikasi"
                                ? "text-amber-300"
                                : "text-slate-500"
                        }
                      >
                        ●
                      </span>{" "}
                      {ev.summary || ev.activity}{" "}
                      <span className="text-slate-600">
                        {ev.occurred_at
                          ? new Date(ev.occurred_at).toLocaleString("id-ID")
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          {threads.length === 0
            ? "Belum ada thread terkait peran Anda."
            : "Memuat detail thread…"}
        </p>
      )}
    </section>
  );
}
