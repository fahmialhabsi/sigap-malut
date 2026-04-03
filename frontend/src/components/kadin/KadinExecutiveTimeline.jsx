import React, { useMemo } from "react";
import { executiveTheme } from "../../ui/dashboards/executiveTheme";

function instruksiStepIndex(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "selesai") return 4;
  if (normalized === "diproses") return 3;
  if (normalized === "dibaca") return 2;
  if (normalized === "diterbitkan") return 1;
  if (normalized === "terlambat") return 2;
  return 1;
}

function perintahStepIndex(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "closed") return 4;
  if (normalized === "submitted") return 3;
  if (normalized === "in_progress") return 2;
  if (normalized === "accepted") return 2;
  if (normalized === "assigned") return 1;
  if (normalized === "rejected") return 0;
  return 1;
}

function StepRail({ active, labels, variant }) {
  const isDanger = variant === "danger";

  return (
    <div className="mt-3 flex w-full max-w-xl items-center gap-0">
      {labels.map((label, index) => {
        const step = index + 1;
        const isDone = active >= step;
        const isCurrent = active === step;

        return (
          <React.Fragment key={label}>
            {index > 0 ? (
              <div
                className={`h-0.5 min-w-[12px] flex-1 rounded ${
                  active > index ? "bg-sky-400" : "bg-slate-700"
                }`}
              />
            ) : null}

            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                  isDanger && step >= 2
                    ? "border-rose-500 bg-rose-500/10 text-rose-200"
                    : isDone
                      ? "border-sky-400 bg-sky-500/15 text-sky-100"
                      : isCurrent
                        ? "border-amber-400 bg-amber-500/10 text-amber-100"
                        : "border-slate-700 bg-slate-900 text-slate-400"
                }`}
              >
                {step}
              </div>
              <span className="max-w-[72px] text-center text-[10px] leading-tight text-slate-400">
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function KadinExecutiveTimeline({
  inbox = [],
  perintah = [],
  loading,
}) {
  const items = useMemo(() => {
    const inboxItems = (inbox || []).map((item) => {
      const timestamp = new Date(item.updated_at || item.created_at || 0).getTime();
      const normalizedStatus = String(item.status || "").toLowerCase();

      return {
        kind: "instruksi_gub",
        key: `ig-${item.id}`,
        title: item.judul || "Instruksi",
        meta: item.nomor_instruksi || `#${item.id}`,
        status: item.status,
        ts: Number.isFinite(timestamp) ? timestamp : 0,
        step: instruksiStepIndex(item.status),
        stepVariant: normalizedStatus === "terlambat" ? "danger" : "ok",
        labels: ["Terbit", "Dibaca", "Proses", "Selesai"],
      };
    });

    const perintahItems = (perintah || []).map((item) => {
      const timestamp = new Date(item.updated_at || item.created_at || 0).getTime();
      const assignees =
        Array.isArray(item.assignments) && item.assignments.length
          ? item.assignments
              .map((assignment) => assignment.assignee_role || assignment.assignee_user_id || "")
              .filter(Boolean)
              .slice(0, 2)
              .join(", ")
          : "";
      const normalizedStatus = String(item.status || "").toLowerCase();

      return {
        kind: "perintah",
        key: `pr-${item.id}`,
        title: item.title || "Perintah",
        meta: assignees || "Bawahan langsung",
        status: item.status,
        ts: Number.isFinite(timestamp) ? timestamp : 0,
        step: perintahStepIndex(item.status),
        stepVariant: normalizedStatus === "rejected" ? "danger" : "ok",
        labels: ["Terbit", "Diterima", "Kerjakan", "Selesai"],
      };
    });

    return [...inboxItems, ...perintahItems].sort((a, b) => b.ts - a.ts);
  }, [inbox, perintah]);

  return (
    <div className={executiveTheme.panel}>
      <div className={executiveTheme.panelHeader}>
        <div>
          <div className={executiveTheme.panelTitle}>Timeline monitor</div>
          <div className={executiveTheme.panelSubtitle}>
            Instruksi Gubernur dan perintah ke bawahan dengan progres per tahap.
          </div>
        </div>
        <div className={executiveTheme.panelMeta}>
          {loading ? "Memuat..." : `${items.length} aktivitas`}
        </div>
      </div>

      <div className="max-h-[420px] space-y-4 overflow-y-auto p-4">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
            Memuat timeline...
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Belum ada instruksi atau perintah untuk ditampilkan.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.key} className={`relative pl-5 ${executiveTheme.itemCard}`}>
              <div
                className="absolute bottom-6 left-2 top-6 w-px bg-slate-700"
                aria-hidden
              />
              <div
                className={`absolute left-1 top-6 h-2.5 w-2.5 rounded-full ring-4 ring-slate-900 ${
                  item.kind === "instruksi_gub" ? "bg-sky-400" : "bg-amber-300"
                }`}
              />

              <div className="flex flex-wrap items-start justify-between gap-2 pl-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        item.kind === "instruksi_gub"
                          ? executiveTheme.badgeInfo
                          : executiveTheme.badgeNeutral
                      }
                    >
                      {item.kind === "instruksi_gub" ? "Gubernur" : "Perintah"}
                    </span>
                    <span className="text-xs text-slate-400">{item.meta}</span>
                  </div>

                  <div className="mt-1 text-sm font-semibold text-slate-100">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    Status:{" "}
                    <span className="font-medium text-slate-100">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-1 overflow-x-auto pl-3">
                {item.step <= 0 ? (
                  <div className="mt-2 text-xs font-medium text-rose-300">
                    Alur task berhenti karena ditolak.
                  </div>
                ) : (
                  <StepRail
                    active={Math.max(1, item.step)}
                    labels={item.labels}
                    variant={item.stepVariant}
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
