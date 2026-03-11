// frontend/src/components/tasks/TaskCreateModal.jsx
import React, { useState } from "react";
import api from "../../utils/api";

const PRIORITIES = ["low", "medium", "high", "critical"];

export default function TaskCreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    layanan_id: "",
    priority: "medium",
    sla_seconds: "",
    due_at: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        sla_seconds: form.sla_seconds ? Number(form.sla_seconds) : null,
        due_at: form.due_at || null,
      };
      const res = await api.post("/tasks", payload);
      onCreated?.(res.data?.data);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message ?? err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Buat Tugas Baru</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-0.5">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Judul tugas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-0.5">Deskripsi</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="Deskripsi tugas (opsional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-0.5">Layanan ID</label>
              <input
                name="layanan_id"
                value={form.layanan_id}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="mis. M001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-0.5">Prioritas</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-0.5">
                SLA (detik)
              </label>
              <input
                name="sla_seconds"
                type="number"
                min={0}
                value={form.sla_seconds}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="mis. 86400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-0.5">Tenggat</label>
              <input
                name="due_at"
                type="datetime-local"
                value={form.due_at}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
