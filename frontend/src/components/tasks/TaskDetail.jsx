import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const STATUS_LABELS = {
  draft: "Draft",
  assigned: "Ditugaskan",
  in_progress: "Dikerjakan",
  submitted: "Diajukan",
  verified: "Diverifikasi",
  closed: "Selesai",
};

const STATUS_COLOR = {
  draft: "bg-slate-700 text-slate-200",
  assigned: "bg-blue-800 text-blue-100",
  in_progress: "bg-yellow-800 text-yellow-100",
  submitted: "bg-orange-800 text-orange-100",
  verified: "bg-green-800 text-green-100",
  closed: "bg-slate-600 text-slate-200",
};

const ROLE_LABELS = {
  sekretaris: "Sekretaris",
  kasubag_umum: "Kasubag Umum & Kepegawaian",
  jabatan_fungsional: "Pejabat Fungsional",
  pelaksana: "Pelaksana",
  bendahara: "Bendahara",
  super_admin: "Super Admin",
};

// Which transitions are available per (currentStatus, userRole)
const AVAILABLE_TRANSITIONS = {
  draft: {
    sekretaris: [{ to: "assigned", label: "Tugaskan" }],
    kasubag_umum: [{ to: "assigned", label: "Tugaskan" }],
    super_admin: [{ to: "assigned", label: "Tugaskan" }],
  },
  assigned: {
    pelaksana: [{ to: "in_progress", label: "Mulai Kerjakan" }],
    bendahara: [{ to: "in_progress", label: "Mulai Kerjakan" }],
    jabatan_fungsional: [{ to: "in_progress", label: "Mulai Kerjakan" }],
    kasubag_umum: [{ to: "in_progress", label: "Mulai Kerjakan" }],
    super_admin: [{ to: "in_progress", label: "Mulai Kerjakan" }],
  },
  in_progress: {
    pelaksana: [{ to: "submitted", label: "Ajukan ke Sekretaris" }],
    bendahara: [{ to: "submitted", label: "Ajukan ke Sekretaris" }],
    jabatan_fungsional: [{ to: "submitted", label: "Ajukan ke Sekretaris" }],
    kasubag_umum: [{ to: "submitted", label: "Ajukan ke Sekretaris" }],
    super_admin: [{ to: "submitted", label: "Ajukan ke Sekretaris" }],
  },
  submitted: {
    sekretaris: [
      { to: "verified", label: "Verifikasi & Setujui", style: "bg-green-700 hover:bg-green-600" },
      { to: "in_progress", label: "Kembalikan (Revisi)", style: "bg-amber-700 hover:bg-amber-600" },
    ],
    kasubag_umum: [
      { to: "verified", label: "Verifikasi & Setujui", style: "bg-green-700 hover:bg-green-600" },
    ],
    super_admin: [
      { to: "verified", label: "Verifikasi & Setujui", style: "bg-green-700 hover:bg-green-600" },
    ],
  },
  verified: {
    sekretaris: [{ to: "closed", label: "Tutup Tugas", style: "bg-slate-700 hover:bg-slate-600" }],
    super_admin: [{ to: "closed", label: "Tutup Tugas", style: "bg-slate-700 hover:bg-slate-600" }],
  },
  closed: {},
};

function AssignPanel({ taskId, userRole, onAssigned }) {
  const [assigneeRole, setAssigneeRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canAssign = ["sekretaris", "kasubag_umum", "super_admin"].includes(userRole);
  if (!canAssign) return null;

  async function handleAssign() {
    if (!assigneeRole) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/tasks/${taskId}/assign`, { assignee_role: assigneeRole });
      onAssigned && onAssigned();
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menugaskan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 p-4 bg-slate-900/80 rounded-xl border border-slate-700">
      <h4 className="font-semibold text-slate-200 mb-3 text-sm">Tugaskan ke Role</h4>
      {error && <div className="mb-2 text-red-400 text-xs">{error}</div>}
      <div className="flex gap-2">
        <select
          value={assigneeRole}
          onChange={(e) => setAssigneeRole(e.target.value)}
          className="flex-1 bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
        >
          <option value="">Pilih Role</option>
          {Object.entries(ROLE_LABELS).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
        <button
          onClick={handleAssign}
          disabled={loading || !assigneeRole}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "..." : "Tugaskan"}
        </button>
      </div>
    </div>
  );
}

/**
 * TaskDetail
 * Can be used standalone (reads id from URL params) or embedded (pass taskId prop)
 */
export default function TaskDetail({ taskId: propTaskId, userRole, onBack }) {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const taskId = propTaskId || paramId;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  async function loadTask() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/tasks/${taskId}`);
      setTask(res.data?.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal memuat detail tugas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (taskId) loadTask();
  }, [taskId]);

  async function handleTransition(toStatus) {
    setTransitioning(true);
    try {
      await api.post(`/tasks/${taskId}/transition`, {
        to_status: toStatus,
        note: transitionNote,
      });
      setTransitionNote("");
      await loadTask();
    } catch (err) {
      alert(err?.response?.data?.message || "Gagal mengubah status");
    } finally {
      setTransitioning(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 animate-pulse">
        Memuat detail tugas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-400 bg-red-900/30 rounded-xl">
        {error}
      </div>
    );
  }

  if (!task) return null;

  const statusInfo = STATUS_COLOR[task.status] || "bg-slate-700 text-slate-200";
  const transitions = (AVAILABLE_TRANSITIONS[task.status] || {})[userRole] || [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => onBack ? onBack() : navigate("/sekretariat/tasks")}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition"
      >
        ← Kembali ke Daftar Tugas
      </button>

      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{task.title}</h2>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span>Modul: <span className="font-mono text-slate-300">{task.modul_id || "-"}</span></span>
              <span>•</span>
              <span>Prioritas: <span className="font-semibold text-yellow-400">{task.priority}</span></span>
              {task.due_date && (
                <>
                  <span>•</span>
                  <span>Batas: {new Date(task.due_date).toLocaleDateString("id-ID")}</span>
                </>
              )}
              {task.is_sensitive && (
                <span className="px-2 py-0.5 bg-red-900/60 text-red-300 rounded-full">SENSITIF</span>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo}`}>
            {STATUS_LABELS[task.status] || task.status}
          </span>
        </div>

        {task.description && (
          <p className="text-slate-300 text-sm leading-relaxed">{task.description}</p>
        )}
      </div>

      {/* Assignments */}
      {task.assignments && task.assignments.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 mb-3">Penugasan</h3>
          <div className="space-y-2">
            {task.assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-slate-300">
                  {ROLE_LABELS[a.assignee_role] || a.assignee_role}
                </span>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                  a.status === "done"
                    ? "bg-green-800 text-green-200"
                    : "bg-slate-700 text-slate-300"
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Panel (for sekretaris/kasubag) */}
      <AssignPanel taskId={task.id} userRole={userRole} onAssigned={loadTask} />

      {/* Transition actions */}
      {transitions.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 mb-3">Tindakan</h3>
          <div className="mb-3">
            <textarea
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
              rows={2}
              placeholder="Catatan (opsional)..."
              className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {transitions.map((t) => (
              <button
                key={t.to}
                onClick={() => handleTransition(t.to)}
                disabled={transitioning}
                className={`px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition ${
                  t.style || "bg-blue-700 hover:bg-blue-600"
                }`}
              >
                {transitioning ? "..." : t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline / Logs */}
      {task.logs && task.logs.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 mb-4">Riwayat / Timeline</h3>
          <ol className="relative border-l border-slate-700 space-y-6 ml-2">
            {task.logs.map((log) => (
              <li key={log.id} className="ml-6">
                <span className="absolute -left-2 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-900 flex-shrink-0" />
                <div className="text-xs text-slate-400 mb-1">
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </div>
                <div className="font-semibold text-slate-200 text-sm">{log.action}</div>
                {log.note && (
                  <div className="text-slate-400 text-xs mt-1">{log.note}</div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Approvals */}
      {task.approvals && task.approvals.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 mb-3">Riwayat Persetujuan</h3>
          <div className="space-y-2">
            {task.approvals.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  a.decision === "approved"
                    ? "bg-green-800 text-green-200"
                    : a.decision === "rejected"
                    ? "bg-red-800 text-red-200"
                    : "bg-yellow-800 text-yellow-200"
                }`}>
                  {a.decision || "Menunggu"}
                </span>
                <span className="text-slate-300">{ROLE_LABELS[a.approver_role] || a.approver_role}</span>
                {a.decided_at && (
                  <span className="ml-auto text-xs text-slate-400">
                    {new Date(a.decided_at).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
