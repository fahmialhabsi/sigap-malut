import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

function statusPill(status) {
  const s = String(status || "").toLowerCase();
  if (s === "assigned") return { text: "DITERBITKAN", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  if (s === "accepted") return { text: "DIBACA", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (s === "in_progress") return { text: "DIPROSES", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (s === "submitted") return { text: "MENUNGGU REVIEW", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (s === "closed") return { text: "SELESAI", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (s === "rejected") return { text: "DITOLAK", cls: "bg-red-50 text-red-700 border-red-200" };
  return { text: status || "—", cls: "bg-gray-50 text-gray-700 border-gray-200" };
}

export default function MonitorPerintahTimeline() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/sekretaris/perintah/timeline", {
        params: { limit: 80 },
      });
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t) => {
      const title = String(t.title || "").toLowerCase();
      const desc = String(t.description || "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [rows, search]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">📋 Monitor Perintah (Timeline)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Timeline perintah yang dibuat Sekretaris / turunan dari KaDin.
          </p>
        </div>
        <button
          onClick={fetchTimeline}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          ↺ Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul/uraian…"
          className="w-full md:max-w-sm px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="text-xs text-gray-500 md:ml-auto flex items-center">
          {loading ? "Memuat…" : `${filtered.length} item`}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-10 text-center animate-pulse">Memuat timeline…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-400 py-10 text-center">Belum ada perintah.</div>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, 80).map((t) => {
            const pill = statusPill(t.status);
            const assignees =
              Array.isArray(t.assignments) && t.assignments.length
                ? t.assignments
                    .map((a) => a.assignee?.nama_lengkap || a.assignee?.username || a.assignee_role)
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(", ")
                : "—";
            const created = t.created_at ? new Date(t.created_at).toLocaleString("id-ID") : "—";
            const due = t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID") : "—";
            return (
              <div
                key={t.id}
                className="border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:bg-emerald-50/20 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{t.title || "—"}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.description || ""}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${pill.cls}`}>
                    {pill.text}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    <strong className="text-gray-700">Penerima:</strong> {assignees}
                  </span>
                  <span>
                    <strong className="text-gray-700">Dibuat:</strong> {created}
                  </span>
                  <span>
                    <strong className="text-gray-700">Deadline:</strong> {due}
                  </span>
                  {t.sumber_perintah_kadin ? (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                      Turunan KaDin #{t.sumber_perintah_kadin}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

