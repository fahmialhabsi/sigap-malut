/**
 * frontend/src/components/sekretaris/ReviewTugasVerifiedPanel.jsx
 *
 * BL-001 fix: Panel "Perlu Persetujuan Sekretaris"
 * Menampilkan tugas dengan status "verified" dan memungkinkan Sekretaris untuk:
 * - Menyetujui → status: approved_by_secretary
 * - Mengembalikan untuk revisi → status: in_progress
 * - Meneruskan ke Kadis → status: forwarded_to_kadin
 *
 * Menggunakan endpoint:
 *   GET  /api/sekretaris/tugas-terverifikasi
 *   POST /api/tasks/:id/review  { decision: "approve" | "back" | "forward", note }
 */

import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

function Badge({ status }) {
  const map = {
    verified: "bg-blue-50 text-blue-700 border border-blue-200",
    in_progress: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full mx-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ReviewTugasVerifiedPanel({ refreshTick = 0 }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("approve");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/sekretaris/tugas-terverifikasi", { params: { limit: 50 } });
      setTasks(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat tugas terverifikasi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks, refreshTick]);

  const openModal = (task) => {
    setSelected(task);
    setDecision("approve");
    setNote("");
    setSubmitError(null);
  };

  const closeModal = () => { setSelected(null); setSubmitError(null); };

  const handleSubmit = async () => {
    if (!selected) return;
    if (decision === "back" && !note.trim()) {
      setSubmitError("Catatan wajib diisi saat mengembalikan tugas.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post(`/tasks/${selected.id}/review`, { decision, note: note.trim() || undefined });
      closeModal();
      fetchTasks();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Gagal memproses keputusan");
    } finally {
      setSubmitting(false);
    }
  };

  const decisionLabel = {
    approve: "Setujui (approved_by_secretary)",
    back: "Kembalikan untuk revisi",
    forward: "Teruskan ke Kepala Dinas",
  };

  const decisionColor = {
    approve: "bg-emerald-600 hover:bg-emerald-700",
    back: "bg-amber-500 hover:bg-amber-600",
    forward: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-base">✅</span>
          <span className="font-semibold text-sm text-gray-800">Perlu Persetujuan Sekretaris</span>
          {tasks.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{tasks.length}</span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchTasks}
          className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          ↻ Muat ulang
        </button>
      </div>

      <div className="p-4">
        {loading && (
          <div className="text-center py-6 text-gray-400 text-sm">Memuat…</div>
        )}
        {!loading && error && (
          <div className="text-center py-4 text-red-500 text-sm">{error}</div>
        )}
        {!loading && !error && tasks.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            Tidak ada tugas yang menunggu persetujuan Sekretaris
          </div>
        )}
        {!loading && tasks.length > 0 && (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge status={task.status} />
                    {task.due_date && (
                      <span className="text-[11px] text-gray-400">
                        Deadline: {new Date(task.due_date).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Unit: {task.source_unit || "-"} · Diperbarui: {new Date(task.updated_at).toLocaleDateString("id-ID")}
                  </p>
                  {task.metadata?.pelaksana_submit?.output_ringkas && (
                    <p className="text-[11px] text-gray-600 mt-1 italic line-clamp-2">
                      "{task.metadata.pelaksana_submit.output_ringkas}"
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openModal(task)}
                  className="shrink-0 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Proses
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={!!selected}
        title={`Keputusan untuk: ${selected?.title || ""}`}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Keputusan</label>
            <div className="space-y-2">
              {["approve", "back", "forward"].map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value={d}
                    checked={decision === d}
                    onChange={() => setDecision(d)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{decisionLabel[d]}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Catatan {decision === "back" ? <span className="text-red-500">*</span> : "(opsional)"}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={decision === "back" ? "Jelaskan alasan pengembalian…" : "Catatan tambahan (opsional)"}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {submitError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`text-sm px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${decisionColor[decision]}`}
            >
              {submitting ? "Memproses…" : "Kirim Keputusan"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
