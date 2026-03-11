import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
  { value: "critical", label: "Kritis" },
];

const ROLE_OPTIONS = [
  { value: "kasubag_umum", label: "Kasubag Umum & Kepegawaian" },
  { value: "jabatan_fungsional", label: "Pejabat Fungsional" },
  { value: "pelaksana", label: "Pelaksana" },
  { value: "bendahara", label: "Bendahara" },
];

/**
 * TaskCreateModal
 * Props:
 *   isOpen    - boolean
 *   onClose   - () => void
 *   onCreated - (task) => void   callback after successful create
 */
export default function TaskCreateModal({ isOpen, onClose, onCreated }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    modul_id: "",
    layanan_id: "",
    priority: "medium",
    due_date: "",
    is_sensitive: false,
    assignee_role: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    api
      .get("/modules")
      .then((res) => {
        const arr = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setModules(arr);
      })
      .catch(() => setModules([]));
  }, [isOpen]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/tasks", form);
      const task = res.data?.data;
      onCreated && onCreated(task);
      onClose && onClose();
      setForm({
        title: "",
        description: "",
        modul_id: "",
        layanan_id: "",
        priority: "medium",
        due_date: "",
        is_sensitive: false,
        assignee_role: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal membuat tugas");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold"
          aria-label="Tutup"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Buat Tugas Baru</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/60 border border-red-700 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">
              Judul Tugas <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Masukkan judul tugas..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              placeholder="Deskripsi tugas..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Modul */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Modul
              </label>
              <select
                name="modul_id"
                value={form.modul_id}
                onChange={handleChange}
                className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Pilih Modul</option>
                {modules.map((m) => (
                  <option key={m.modul_id || m.id} value={m.modul_id || m.id}>
                    {m.nama_modul || m.name || m.modul_id}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Prioritas
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Batas Waktu
              </label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Assignee Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Tugaskan Ke
              </label>
              <select
                name="assignee_role"
                value={form.assignee_role}
                onChange={handleChange}
                className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Pilih Role</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sensitive */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_sensitive"
              name="is_sensitive"
              checked={form.is_sensitive}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="is_sensitive" className="text-sm text-slate-300">
              Tugas Sensitif / Rahasia
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Buat Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
