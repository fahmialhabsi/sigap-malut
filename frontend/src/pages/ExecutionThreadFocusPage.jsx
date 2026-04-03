import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ExecutionThreadObservabilityPanel from "../components/execution/ExecutionThreadObservabilityPanel.jsx";

/**
 * Navigasi berbasis thread: satu layar untuk timeline, KPI, decision, dan level.
 */
export default function ExecutionThreadFocusPage() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const id = threadId ? String(threadId) : "";
  const jumpTarget = searchParams.get("jump") || "";

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Thread eksekusi</h1>
          <p className="text-xs text-slate-500">
            Pusat aktivitas untuk satu <code className="text-slate-400">{id || "—"}</code>
          </p>
        </div>
        <Link
          to="/dashboard"
          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
        >
          Kembali ke dashboard
        </Link>
      </div>

      {!id ? (
        <p className="text-sm text-amber-200">UUID thread tidak valid di URL.</p>
      ) : (
        <ExecutionThreadObservabilityPanel
          title="Timeline & decision engine"
          initialThreadId={id}
          initialJump={jumpTarget}
        />
      )}
    </div>
  );
}
