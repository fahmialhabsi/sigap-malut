// frontend/src/components/tasks/TaskList.jsx
import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700",
  assigned: "bg-yellow-100 text-yellow-700",
  accepted: "bg-purple-100 text-purple-700",
  submitted: "bg-orange-100 text-orange-700",
  verified: "bg-teal-100 text-teal-700",
  reviewed: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-600",
  rejected: "bg-red-100 text-red-700",
};

export default function TaskList({ filter = {}, onSelect }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(filter).toString();
    setLoading(true);
    api
      .get(`/tasks${params ? `?${params}` : ""}`)
      .then((res) => setTasks(res.data?.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.assigned_to, filter.status, filter.layanan_id]);

  if (loading) return <div className="p-4 text-slate-400 animate-pulse">Memuat tugas…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!tasks.length) return <div className="p-4 text-slate-400">Tidak ada tugas ditemukan.</div>;

  return (
    <div className="divide-y divide-slate-200">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onSelect?.(task)}
          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-800 truncate">{task.title}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_COLORS[task.status] ?? "bg-gray-100 text-gray-500"}`}
            >
              {task.status}
            </span>
          </div>
          {task.layanan_id && (
            <div className="text-xs text-slate-400 mt-0.5">Layanan: {task.layanan_id}</div>
          )}
          {task.due_at && (
            <div className="text-xs text-slate-400">
              Tenggat: {new Date(task.due_at).toLocaleDateString("id-ID")}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
