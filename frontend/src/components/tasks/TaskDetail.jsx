// frontend/src/components/tasks/TaskDetail.jsx
import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const ACTION_LABEL = {
  assign: "Tugaskan",
  accept: "Terima",
  submit: "Kirim",
  verify: "Verifikasi",
  review: "Setujui",
};

const NEXT_ACTION = {
  open: "assign",
  assigned: "accept",
  accepted: "submit",
  submitted: "verify",
  verified: "review",
};

export default function TaskDetail({ taskId, onBack }) {
  const [task, setTask] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchTask = () => {
    if (!taskId) return;
    setLoading(true);
    api
      .get(`/tasks/${taskId}`)
      .then((res) => {
        setTask(res.data?.data);
        setLogs(res.data?.data?.logs ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleTransition = async (action) => {
    setActing(true);
    try {
      await api.post(`/tasks/${taskId}/${action}`, { notes });
      setNotes("");
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message ?? err.message);
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-400 animate-pulse">Memuat detail tugas…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!task) return null;

  const nextAction = NEXT_ACTION[task.status];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4">
        ← Kembali
      </button>

      <h2 className="text-xl font-bold text-slate-800 mb-1">{task.title}</h2>
      <div className="flex gap-2 flex-wrap mb-4">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          Status: {task.status}
        </span>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          Prioritas: {task.priority}
        </span>
        {task.layanan_id && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            Layanan: {task.layanan_id}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">{task.description}</p>
      )}

      {task.due_at && (
        <div className="text-sm text-slate-500 mb-4">
          Tenggat: {new Date(task.due_at).toLocaleString("id-ID")}
        </div>
      )}

      {nextAction && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
          <textarea
            className="w-full border border-slate-300 rounded-lg p-2 text-sm resize-none"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opsional"
          />
          <button
            onClick={() => handleTransition(nextAction)}
            disabled={acting}
            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {acting ? "Memproses…" : ACTION_LABEL[nextAction]}
          </button>
        </div>
      )}

      {logs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Riwayat</h3>
          <ol className="space-y-2">
            {logs.map((log) => (
              <li key={log.id} className="text-xs text-slate-500 flex gap-2">
                <span className="shrink-0 text-slate-400">
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </span>
                <span>
                  <strong className="text-slate-700">{log.action}</strong>
                  {log.notes && `: ${log.notes}`}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
