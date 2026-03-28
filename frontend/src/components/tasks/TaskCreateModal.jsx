// components/tasks/TaskCreateModal.jsx
import React, { useState } from "react";
import { taskService } from "../../services/taskService";
import { notifySuccess, notifyError } from "../../utils/notify";

const PRIORITY = [
  { value: 1, label: "Mendesak" },
  { value: 2, label: "Tinggi" },
  { value: 3, label: "Normal" },
  { value: 4, label: "Rendah" },
];

const MODULE_LIST = [
  "Sekretariat",
  "Bidang PHP",
  "Bidang HKP",
  "Bidang PDAK",
  "UPTD BPSMB",
  "UPTD Kebun Benih",
  "Keuangan",
  "Kepegawaian",
];

export default function TaskCreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    module: "",
    source_unit: "",
    priority: 3,
    due_date: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return notifyError("Judul tugas wajib diisi");
    setLoading(true);
    try {
      const res = await taskService.create(form);
      notifySuccess("Tugas berhasil dibuat");
      onCreated && onCreated(res.data.data);
      onClose && onClose();
    } catch (err) {
      notifyError(err.response?.data?.message || "Gagal membuat tugas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          width: 520,
          padding: 32,
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Buat Tugas Baru</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
            >
              Judul *
            </label>
            <input
              style={iStyle}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Judul tugas"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
            >
              Deskripsi
            </label>
            <textarea
              style={{ ...iStyle, height: 80, resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Detail tugas..."
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Modul
              </label>
              <select
                style={iStyle}
                value={form.module}
                onChange={(e) => set("module", e.target.value)}
              >
                <option value="">— Pilih Modul —</option>
                {MODULE_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Unit Sumber
              </label>
              <input
                style={iStyle}
                value={form.source_unit}
                onChange={(e) => set("source_unit", e.target.value)}
                placeholder="Ex: Bidang PHP"
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 22,
            }}
          >
            <div>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Prioritas
              </label>
              <select
                style={iStyle}
                value={form.priority}
                onChange={(e) => set("priority", Number(e.target.value))}
              >
                {PRIORITY.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Tenggat Waktu
              </label>
              <input
                style={iStyle}
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={btnSecondary}
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" style={btnPrimary} disabled={loading}>
              {loading ? "Menyimpan..." : "Buat Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const iStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",
};
const btnPrimary = {
  padding: "9px 22px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};
const btnSecondary = {
  padding: "9px 22px",
  background: "#f1f5f9",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  cursor: "pointer",
};
