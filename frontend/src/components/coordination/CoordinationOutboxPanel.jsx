import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import coordinationService from "../../services/coordinationService";
import { getRoleLabel } from "./coordinationOptions";

function kindBadge(kind) {
  return kind === "perintah"
    ? "bg-blue-50 text-blue-700 border border-blue-200"
    : "bg-amber-50 text-amber-700 border border-amber-200";
}

export default function CoordinationOutboxPanel({
  title,
  subtitle,
  targetRole,
  kind,
  refreshKey,
  emptyText = "Belum ada item keluar.",
  allowClose = true,
  panelClassName = "",
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await coordinationService.listOutbox({
        limit: 40,
        ...(targetRole ? { target_role: targetRole } : {}),
        ...(kind ? { kind } : {}),
      });
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Gagal memuat outbox koordinasi.",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRole, kind, refreshKey]);

  async function handleClose(id) {
    setActingId(id);
    try {
      await coordinationService.close(id, {});
      toast.success("Item ditutup.");
      await load();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Gagal menutup item koordinasi.",
      );
    } finally {
      setActingId(null);
    }
  }

  return (
    <section
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${panelClassName}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">{title}</h2>
          {subtitle ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={load}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-10 text-center animate-pulse">
          Memuat...
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-400 py-10 text-center">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const meta = row.metadata || {};
            const latestResponse = meta.latest_response_note;
            return (
              <div
                key={row.id}
                className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${kindBadge(
                          meta.kind,
                        )}`}
                      >
                        {String(meta.kind || "koordinasi").toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {String(row.status || "assigned").toUpperCase()}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {row.title}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Kepada: {getRoleLabel(meta.to_role)} | Deadline:{" "}
                      {row.due_date
                        ? new Date(row.due_date).toLocaleDateString("id-ID")
                        : "-"}
                    </div>
                  </div>
                  {allowClose && row.status !== "closed" ? (
                    <button
                      type="button"
                      onClick={() => handleClose(row.id)}
                      disabled={actingId === row.id}
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 disabled:opacity-60"
                    >
                      {actingId === row.id ? "Menutup..." : "Tutup"}
                    </button>
                  ) : null}
                </div>

                {meta.agenda ? (
                  <div className="mt-3 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Agenda:</span>{" "}
                    {meta.agenda}
                  </div>
                ) : null}

                {meta.expected_output ? (
                  <div className="mt-1 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Output:</span>{" "}
                    {meta.expected_output}
                  </div>
                ) : null}

                {meta.reference ? (
                  <div className="mt-1 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Referensi:</span>{" "}
                    {meta.reference}
                  </div>
                ) : null}

                {row.description ? (
                  <div className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                    {row.description}
                  </div>
                ) : null}

                {latestResponse ? (
                  <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    <span className="font-semibold">
                      Respons {meta.latest_response_by_name || "terakhir"}:
                    </span>{" "}
                    {latestResponse}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
