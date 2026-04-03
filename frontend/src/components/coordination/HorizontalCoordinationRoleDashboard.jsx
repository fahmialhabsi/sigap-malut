import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  HCOORD_WORKFLOW_STATUSES,
  HCOORD_TERMINAL_STATUSES,
  labelHCoordStatus,
} from "../../constants/horizontalCoordinationStatus.js";

const ENDPOINTS = {
  sekretaris: "/coordination/horizontal/dashboard/sekretaris",
  kabid: "/coordination/horizontal/dashboard/kabid",
  uptd: "/coordination/horizontal/dashboard/uptd",
};

function threadHref(id) {
  if (!id) return "#";
  return `/dashboard/execution-thread/${encodeURIComponent(id)}`;
}

function fmtDate(s) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return s;
  }
}

const PRIORITY_TOP_N = 5;
const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Semua status" },
  ...HCOORD_WORKFLOW_STATUSES.map((v) => ({ value: v, label: labelHCoordStatus(v) })),
  ...HCOORD_TERMINAL_STATUSES.map((v) => ({ value: v, label: labelHCoordStatus(v) })),
];

function emptyCopyForVariant(variant) {
  if (variant === "sekretaris") {
    return "Tidak ada koordinasi lintas bidang yang cocok dengan filter. Jika ini normal, tidak ada antrean sinkronisasi terbuka.";
  }
  if (variant === "kabid") {
    return "Tidak ada permintaan koordinasi masuk/keluar untuk bidang Anda pada filter ini. Periksa filter status atau unit.";
  }
  return "Tidak ada permintaan lapangan/verifikasi terkait UPTD Anda. Sesuaikan filter bila perlu.";
}

/**
 * Dashboard matang koordinasi horizontal per peran (Sekretaris / Kabid / UPTD).
 */
export default function HorizontalCoordinationRoleDashboard({
  variant,
  title,
  className = "",
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState("");
  const [sla, setSla] = useState("");
  const [unit, setUnit] = useState("");

  const ep = ENDPOINTS[variant];
  const defaultTitle =
    variant === "sekretaris"
      ? "Koordinasi lintas bidang (thread)"
      : variant === "kabid"
        ? "Koordinasi & dependensi lintas unit"
        : "Koordinasi lapangan & verifikasi (UPTD)";

  const load = useCallback(async () => {
    if (!ep) return;
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      if (status.trim()) params.set("status", status.trim());
      if (sla) params.set("sla", sla);
      if (unit.trim()) params.set("unit", unit.trim());
      const qs = params.toString();
      const r = await api.get(`${ep}${qs ? `?${qs}` : ""}`);
      setData(r.data?.data || null);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Gagal memuat");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ep, status, sla, unit]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};
  const priority = data?.priority_queue || data?.critical_overdue || [];
  const insights = data?.insights || {};

  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
      aria-label={title || defaultTitle}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title || defaultTitle}</h2>
          <p className="mt-1 text-xs text-gray-500">
            Satu jalur dengan <strong>execution thread</strong> — filter ringkas untuk kerja harian.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-[10px] font-medium uppercase text-gray-500">
            Status
            <select
              className="mt-0.5 min-w-[9rem] rounded border border-gray-300 px-2 py-1 text-xs text-gray-800"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-[10px] font-medium uppercase text-gray-500">
            SLA
            <select
              className="mt-0.5 rounded border border-gray-300 px-2 py-1 text-xs text-gray-800"
              value={sla}
              onChange={(e) => setSla(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="overdue">Terlambat</option>
            </select>
          </label>
          <label className="flex flex-col text-[10px] font-medium uppercase text-gray-500">
            Unit
            <input
              className="mt-0.5 rounded border border-gray-300 px-2 py-1 text-xs text-gray-800"
              placeholder="cari unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => load()}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
          >
            Terapkan
          </button>
        </div>
      </div>

      {err ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{err}</div>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">Memuat koordinasi horizontal…</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {Object.keys(summary).length === 0 ? (
              <p className="col-span-full text-xs text-gray-500">Ringkasan belum tersedia.</p>
            ) : (
              Object.entries(summary).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg border border-gray-100 bg-slate-50 px-3 py-2 text-center"
                >
                  <div className="text-lg font-bold text-slate-800">{v ?? "—"}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {k.replace(/_/g, " ")}
                  </div>
                </div>
              ))
            )}
          </div>

          {insights.slowest_responding_units?.length ? (
            <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
              <div className="font-semibold text-amber-900">Unit relatif lambat merespons (top 3)</div>
              <ul className="mt-1 list-disc pl-4 text-amber-900/90">
                {insights.slowest_responding_units.slice(0, 3).map((u) => (
                  <li key={u.unit_key}>
                    {u.label}: ~{u.avg_response_hours} jam (n={u.sample_count})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mb-3 text-xs text-gray-500">
              Belum ada sampel respons historis untuk peringkat unit (normal jika data baru).
            </p>
          )}

          {(insights.bottleneck_by_source_level?.length || insights.bottleneck_bidang_level?.length) ? (
            <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs text-rose-950">
              <div className="font-semibold text-rose-900">Bottleneck koordinasi (level sumber · terlambat)</div>
              <ul className="mt-1 flex flex-wrap gap-2">
                {(insights.bottleneck_by_source_level || insights.bottleneck_bidang_level || [])
                  .slice(0, 5)
                  .map((b) => (
                  <li
                    key={b.org_level}
                    className="rounded-full bg-white px-2 py-0.5 font-medium text-rose-800 shadow-sm"
                  >
                    {b.org_level}: {b.overdue_count}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mb-4 text-xs text-gray-500">
              Tidak ada bottleneck terlambat pada level sumber untuk data saat ini.
            </p>
          )}

          {variant === "sekretaris" ? (
            insights.threads_blocked_by_overdue_coordination?.length ? (
              <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs">
                <div className="font-semibold text-orange-900">Thread tertahan SLA koordinasi (prioritas)</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {insights.threads_blocked_by_overdue_coordination.slice(0, 5).map((tid) => (
                    <Link
                      key={tid}
                      to={threadHref(tid)}
                      className="font-mono text-[10px] text-sky-700 underline hover:text-sky-900"
                    >
                      {String(tid).slice(0, 8)}…
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mb-4 text-xs text-gray-500">
                Tidak ada thread yang tertahan karena SLA koordinasi lewat waktu (sesuai data saat ini).
              </p>
            )
          ) : null}

          {variant === "kabid" ? (
            insights.threads_waiting_this_bidang?.length ? (
              <div className="mb-4 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs">
                <div className="font-semibold text-sky-900">Thread menunggu respons bidang ini</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {insights.threads_waiting_this_bidang.slice(0, 5).map((tid) => (
                    <Link
                      key={tid}
                      to={threadHref(tid)}
                      className="font-mono text-[10px] text-sky-700 underline hover:text-sky-900"
                    >
                      {String(tid).slice(0, 8)}…
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mb-4 text-xs text-gray-500">
                Tidak ada thread yang secara eksplisit menunggu respons bidang Anda pada snapshot ini.
              </p>
            )
          ) : null}

          {((variant === "sekretaris" && data?.field_tasks_linked?.length) ||
            (variant === "uptd" && data?.field_tasks?.length)) ? (
            <div className="mb-4">
              <div className="mb-1 text-[11px] font-semibold uppercase text-gray-500">
                Tugas lapangan terkait thread (terbuka)
              </div>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-gray-700">
                {(variant === "uptd" ? data.field_tasks : data.field_tasks_linked).slice(0, 5).map((t) => (
                  <li key={t.id} className="flex flex-wrap justify-between gap-2 border-b border-gray-100 py-1">
                    <span>{t.title || `Tugas #${t.id}`}</span>
                    <Link to={threadHref(t.execution_thread_id)} className="text-sky-600 hover:underline">
                      Buka thread
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase text-gray-500">
              Antrean prioritas (mendesak dulu)
            </div>
            {!priority.length ? (
              <p className="text-sm text-gray-600">{emptyCopyForVariant(variant)}</p>
            ) : (
              <>
                <ul className="max-h-64 space-y-2 overflow-y-auto text-xs">
                  {priority.slice(0, PRIORITY_TOP_N).map((row) => (
                    <li
                      key={row.id}
                      className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-gray-800"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-gray-900">{row.subject || "Tanpa subjek"}</span>
                          <span
                            className="ml-2 rounded bg-white px-1.5 py-0.5 text-[10px] text-gray-600"
                            title={row.status}
                          >
                            {labelHCoordStatus(row.status)}
                          </span>
                        </div>
                        <Link
                          to={threadHref(row.execution_thread_id)}
                          className="shrink-0 text-sky-600 hover:underline"
                        >
                          Thread
                        </Link>
                      </div>
                      <div className="mt-1 text-[10px] text-gray-500">
                        {row.from_unit || "—"} → {row.to_unit || row.to_user_label || "—"} · SLA:{" "}
                        {fmtDate(row.sla_due_at)}
                      </div>
                    </li>
                  ))}
                </ul>
                {priority.length > PRIORITY_TOP_N ? (
                  <p className="mt-2 text-[10px] text-gray-500">
                    +{priority.length - PRIORITY_TOP_N} item lain pada antrean (sesuaikan filter status/SLA untuk
                    mempersempit).
                  </p>
                ) : null}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
