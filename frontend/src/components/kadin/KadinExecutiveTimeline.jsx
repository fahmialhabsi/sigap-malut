import React, { useMemo } from "react";

function instruksiStepIndex(status) {
  const s = String(status || "").toLowerCase();
  if (s === "selesai") return 4;
  if (s === "diproses") return 3;
  if (s === "dibaca") return 2;
  if (s === "diterbitkan") return 1;
  if (s === "terlambat") return 2;
  return 1;
}

function perintahStepIndex(status) {
  const s = String(status || "").toLowerCase();
  if (s === "closed") return 4;
  if (s === "submitted") return 3;
  if (s === "in_progress") return 2;
  if (s === "accepted") return 2;
  if (s === "assigned") return 1;
  if (s === "rejected") return 0;
  return 1;
}

function StepRail({ active, labels, variant }) {
  const danger = variant === "danger";
  return (
    <div className="mt-3 flex items-center gap-0 w-full max-w-xl">
      {labels.map((label, i) => {
        const step = i + 1;
        const done = active >= step;
        const current = active === step;
        return (
          <React.Fragment key={label}>
            {i > 0 ? (
              <div
                className={`h-0.5 flex-1 min-w-[12px] rounded ${
                  active > i ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            ) : null}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                  danger && step >= 2
                    ? "border-rose-500 bg-rose-50 text-rose-800"
                    : done
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : current
                        ? "border-amber-500 bg-amber-50 text-amber-900"
                        : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {step}
              </div>
              <span className="text-[9px] text-exec-muted text-center max-w-[72px] leading-tight">
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function KadinExecutiveTimeline({ inbox = [], perintah = [], loading }) {
  const items = useMemo(() => {
    const ig = (inbox || []).map((x) => {
      const ts = new Date(x.updated_at || x.created_at || 0).getTime();
      const st = String(x.status || "").toLowerCase();
      return {
        kind: "instruksi_gub",
        key: `ig-${x.id}`,
        title: x.judul || "Instruksi",
        meta: x.nomor_instruksi || `#${x.id}`,
        status: x.status,
        ts: Number.isFinite(ts) ? ts : 0,
        step: instruksiStepIndex(x.status),
        stepVariant: st === "terlambat" ? "danger" : "ok",
        labels: ["Terbit", "Dibaca", "Proses", "Selesai"],
      };
    });
    const pr = (perintah || []).map((t) => {
      const ts = new Date(t.updated_at || t.created_at || 0).getTime();
      const assignees =
        Array.isArray(t.assignments) && t.assignments.length
          ? t.assignments
              .map((a) => a.assignee_role || a.assignee_user_id || "")
              .filter(Boolean)
              .slice(0, 2)
              .join(", ")
          : "";
      const st = String(t.status || "").toLowerCase();
      return {
        kind: "perintah",
        key: `pr-${t.id}`,
        title: t.title || "Perintah",
        meta: assignees || "Bawahan langsung",
        status: t.status,
        ts: Number.isFinite(ts) ? ts : 0,
        step: perintahStepIndex(t.status),
        stepVariant: st === "rejected" ? "danger" : "ok",
        labels: ["Terbit", "Diterima", "Kerjakan", "Selesai"],
      };
    });
    return [...ig, ...pr].sort((a, b) => b.ts - a.ts);
  }, [inbox, perintah]);

  return (
    <div className="rounded-2xl border border-exec-border bg-white/95 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-exec-border flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-exec-ink">Timeline monitor</div>
          <div className="text-xs text-exec-muted mt-0.5">
            Instruksi Gubernur dan perintah ke bawahan — progres visual per tahap.
          </div>
        </div>
        <div className="text-[11px] text-exec-muted whitespace-nowrap">
          {loading ? "Memuat…" : `${items.length} aktivitas`}
        </div>
      </div>
      <div className="p-4 max-h-[420px] overflow-y-auto space-y-4">
        {loading ? (
          <div className="text-sm text-exec-muted py-12 text-center animate-pulse">
            Memuat timeline…
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-exec-muted py-12 text-center">
            Belum ada instruksi atau perintah untuk ditampilkan.
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.key}
              className="relative rounded-xl border border-exec-border bg-gradient-to-br from-white to-teal-50/25 p-4 pl-5 shadow-sm"
            >
              <div className="absolute left-2 top-6 bottom-6 w-px bg-teal-100" aria-hidden />
              <div
                className={`absolute left-1 top-6 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                  it.kind === "instruksi_gub" ? "bg-violet-500" : "bg-teal-600"
                }`}
              />
              <div className="flex flex-wrap items-start justify-between gap-2 pl-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                        it.kind === "instruksi_gub"
                          ? "border-violet-200 bg-violet-50 text-violet-800"
                          : "border-teal-200 bg-teal-50 text-teal-900"
                      }`}
                    >
                      {it.kind === "instruksi_gub" ? "Gubernur" : "Perintah"}
                    </span>
                    <span className="text-xs text-exec-muted">{it.meta}</span>
                  </div>
                  <div className="text-sm font-semibold text-exec-ink mt-1">{it.title}</div>
                  <div className="text-[11px] text-exec-muted mt-0.5">
                    Status:{" "}
                    <span className="text-exec-ink font-medium">{it.status}</span>
                  </div>
                </div>
              </div>
              <div className="pl-3 mt-1 overflow-x-auto">
                {it.step <= 0 ? (
                  <div className="text-xs text-rose-600 mt-2 font-medium">
                    Alur task: ditolak / berhenti.
                  </div>
                ) : (
                  <StepRail
                    active={Math.max(1, it.step)}
                    labels={it.labels}
                    variant={it.stepVariant}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
