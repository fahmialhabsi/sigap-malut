import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const STATUS_LABELS = {
  draft: { label: "Draft", color: "bg-slate-700 text-slate-200" },
  assigned: { label: "Ditugaskan", color: "bg-blue-800 text-blue-100" },
  in_progress: { label: "Dikerjakan", color: "bg-yellow-800 text-yellow-100" },
  submitted: { label: "Diajukan", color: "bg-orange-800 text-orange-100" },
  verified: { label: "Diverifikasi", color: "bg-green-800 text-green-100" },
  closed: { label: "Selesai", color: "bg-slate-600 text-slate-200" },
};

const PRIORITY_LABELS = {
  low: { label: "Rendah", color: "text-slate-400" },
  medium: { label: "Sedang", color: "text-yellow-400" },
  high: { label: "Tinggi", color: "text-orange-400" },
  critical: { label: "Kritis", color: "text-red-400" },
};

/**
 * TaskList
 * Props:
 *   userRole  - string - current user's role
 *   filterStatus - string|null  - pre-filter status
 *   onRefreshRef - optional ref to expose refresh fn
 */
export default function TaskList({ userRole, filterStatus = null, onRefreshRef }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(filterStatus || "");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (userRole) params.role = userRole;
      const res = await api.get("/tasks", { params });
      const arr = Array.isArray(res.data?.data) ? res.data.data : [];
      setTasks(arr);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal memuat daftar tugas");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, userRole]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Expose refresh to parent via ref
  useEffect(() => {
    if (onRefreshRef) onRefreshRef.current = fetchTasks;
  }, [onRefreshRef, fetchTasks]);

  function isOverdue(task) {
    if (!task.due_date) return false;
    if (["verified", "closed"].includes(task.status)) return false;
    return new Date(task.due_date) < new Date();
  }

  return (
    <div className="w-full">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-sm text-slate-400 font-semibold">Filter Status:</span>
        {["", "draft", "assigned", "in_progress", "submitted", "verified", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
              statusFilter === s
                ? "bg-blue-700 text-white border-blue-600"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {s === "" ? "Semua" : STATUS_LABELS[s]?.label || s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-10 text-center text-slate-400 animate-pulse">Memuat tugas...</div>
      )}
      {error && (
        <div className="py-6 text-center text-red-400 bg-red-900/30 rounded-xl">{error}</div>
      )}

      {!loading && !error && tasks.length === 0 && (
        <div className="py-10 text-center text-slate-500 italic">
          Tidak ada tugas ditemukan.
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90">
              <tr>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">#</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Judul</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Modul</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Prioritas</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Batas Waktu</th>
                <th className="px-4 py-3 text-left text-slate-300 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => {
                const statusInfo = STATUS_LABELS[task.status] || { label: task.status, color: "bg-slate-700 text-slate-200" };
                const priorityInfo = PRIORITY_LABELS[task.priority] || { label: task.priority, color: "text-slate-400" };
                const overdue = isOverdue(task);

                return (
                  <tr
                    key={task.id}
                    className={`border-b border-slate-800/70 last:border-none transition ${
                      overdue ? "bg-red-950/20" : "hover:bg-slate-900/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">{task.title}</span>
                      {overdue && (
                        <span className="ml-2 text-xs bg-red-800 text-red-200 px-2 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {task.modul_id || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold text-xs ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/sekretariat/tasks/${task.id}`)}
                        className="px-3 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-blue-100 text-xs font-semibold"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
