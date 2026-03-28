/**
 * ModuleWizard — Wizard multi-langkah untuk membuat modul baru
 * Dokumen sumber: 03-dashboard-uiux.md
 *
 * 4 langkah:
 *  1. Info Dasar (nama, kode, ikon, kategori)
 *  2. Konfigurasi Field (field-field formulir modul)
 *  3. Pengaturan Akses (peran yang berhak)
 *  4. Konfirmasi & Simpan
 */

import { useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

const ROLES = [
  "superadmin", "kepala_dinas", "sekretaris", "kepala_bidang",
  "kepala_uptd", "kasubbag", "fungsional", "pelaksana",
];

const FIELD_TYPES = [
  { value: "text", label: "Teks Pendek" },
  { value: "textarea", label: "Teks Panjang" },
  { value: "number", label: "Angka" },
  { value: "date", label: "Tanggal" },
  { value: "select", label: "Pilihan (dropdown)" },
  { value: "file", label: "Upload File" },
  { value: "boolean", label: "Ya/Tidak" },
];

const CATEGORIES = [
  "Ketahanan Pangan", "Distribusi", "Konsumsi", "Harga & Inflasi",
  "Kepegawaian", "Keuangan", "UPTD", "Lainnya",
];

const STEP_LABELS = [
  "Info Dasar", "Konfigurasi Field", "Pengaturan Akses", "Konfirmasi",
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < current
                  ? "bg-green-500 text-white"
                  : i === current
                  ? "text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
              style={i === current ? { backgroundColor: "var(--color-primary)" } : {}}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-xs mt-1 whitespace-nowrap ${i === current ? "font-semibold text-blue-600" : "text-slate-500"}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mt-0 mb-4 ${i < current ? "bg-green-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nama Modul <span className="text-red-500">*</span>
          </label>
          <input
            value={data.namaModul}
            onChange={(e) => onChange("namaModul", e.target.value)}
            placeholder="cth: Laporan Stok Pangan"
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Kode Modul <span className="text-red-500">*</span>
          </label>
          <input
            value={data.kodeMOdul}
            onChange={(e) =>
              onChange("kodeMOdul", e.target.value.toLowerCase().replace(/\s+/g, "_"))
            }
            placeholder="cth: laporan_stok_pangan"
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ikon (emoji)</label>
          <input
            value={data.icon}
            onChange={(e) => onChange("icon", e.target.value)}
            placeholder="📋"
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-2xl focus:outline-none focus:border-blue-500"
            maxLength={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
          <select
            value={data.kategori}
            onChange={(e) => onChange("kategori", e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Pilih kategori...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
        <textarea
          value={data.deskripsi}
          onChange={(e) => onChange("deskripsi", e.target.value)}
          rows={2}
          placeholder="Deskripsi singkat fungsi modul ini..."
          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>
    </div>
  );
}

function Step2({ fields, onAddField, onRemoveField, onUpdateField }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Definisikan field formulir untuk modul ini.
        </p>
        <button
          onClick={onAddField}
          className="text-sm px-3 py-1.5 rounded-xl text-white font-medium"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          + Tambah Field
        </button>
      </div>
      {fields.length === 0 && (
        <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          Belum ada field. Klik "+ Tambah Field".
        </div>
      )}
      {fields.map((f, i) => (
        <div key={i} className="flex gap-2 items-start bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <input
              value={f.label}
              onChange={(e) => onUpdateField(i, "label", e.target.value)}
              placeholder="Label field"
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              value={f.name}
              onChange={(e) => onUpdateField(i, "name", e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              placeholder="nama_field"
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
            />
            <select
              value={f.type}
              onChange={(e) => onUpdateField(i, "type", e.target.value)}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            >
              {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-1 text-xs text-slate-500 mt-1.5 shrink-0">
            <input
              type="checkbox"
              checked={f.required}
              onChange={(e) => onUpdateField(i, "required", e.target.checked)}
              className="rounded"
            />
            Wajib
          </label>
          <button onClick={() => onRemoveField(i)} className="text-red-400 hover:text-red-600 text-lg mt-0.5 shrink-0">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function Step3({ selectedRoles, onChange }) {
  const toggle = (role) =>
    onChange(
      selectedRoles.includes(role)
        ? selectedRoles.filter((r) => r !== role)
        : [...selectedRoles, role]
    );
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Pilih peran yang dapat mengakses modul ini:</p>
      <div className="grid grid-cols-2 gap-2">
        {ROLES.map((role) => (
          <label
            key={role}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
              selectedRoles.includes(role)
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => toggle(role)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                selectedRoles.includes(role)
                  ? "border-blue-500 bg-blue-500"
                  : "border-slate-300"
              }`}
            >
              {selectedRoles.includes(role) && (
                <span className="text-white text-xs font-bold">✓</span>
              )}
            </div>
            <span className="text-sm capitalize">{role.replace(/_/g, " ")}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Step4({ data, fields, roles }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="text-2xl">{data.icon || "📋"}</span>
          <div>
            <p className="font-semibold text-slate-800">{data.namaModul}</p>
            <p className="text-slate-500 font-mono text-xs">{data.kodeMOdul}</p>
          </div>
        </div>
        {data.kategori && <p className="text-slate-600">📂 {data.kategori}</p>}
        {data.deskripsi && <p className="text-slate-600">{data.deskripsi}</p>}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 mb-1">
          Field Formulir ({fields.length})
        </p>
        {fields.length === 0 ? (
          <p className="text-slate-400 text-sm italic">Tidak ada field yang didefinisikan</p>
        ) : (
          <div className="space-y-1">
            {fields.map((f, i) => (
              <div key={i} className="text-sm bg-slate-50 px-3 py-1.5 rounded-lg flex gap-2 items-center">
                <span className="font-mono text-slate-600">{f.name}</span>
                <span className="text-slate-400">—</span>
                <span>{f.label}</span>
                <span className="text-xs text-slate-400">({f.type})</span>
                {f.required && <span className="text-xs text-red-500 font-medium">WAJIB</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 mb-1">
          Akses Peran ({roles.length})
        </p>
        <div className="flex flex-wrap gap-1">
          {roles.map((r) => (
            <span key={r} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium capitalize">
              {r.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ModuleWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [info, setInfo] = useState({
    namaModul: "",
    kodeMOdul: "",
    icon: "📋",
    kategori: "",
    deskripsi: "",
  });

  const [fields, setFields] = useState([]);
  const [roles, setRoles] = useState(["pelaksana", "fungsional"]);

  const updateInfo = (key, val) => setInfo((p) => ({ ...p, [key]: val }));

  const addField = () =>
    setFields((p) => [...p, { label: "", name: "", type: "text", required: false }]);
  const removeField = (i) => setFields((p) => p.filter((_, idx) => idx !== i));
  const updateField = (i, key, val) =>
    setFields((p) => p.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));

  const canNext = () => {
    if (step === 0) return info.namaModul.trim() && info.kodeMOdul.trim();
    if (step === 2) return roles.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/modules/wizard", {
        nama: info.namaModul,
        kode: info.kodeMOdul,
        icon: info.icon,
        kategori: info.kategori,
        deskripsi: info.deskripsi,
        fields,
        roles,
      });
      toast.success(`Modul "${info.namaModul}" berhasil dibuat`);
      onCreated?.(info);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat modul");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <h2 className="text-white font-bold text-lg">🧩 Wizard Modul Baru</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">×</button>
        </div>

        <div className="p-6">
          <StepIndicator current={step} />

          <div className="min-h-[280px]">
            {step === 0 && <Step1 data={info} onChange={updateInfo} />}
            {step === 1 && (
              <Step2
                fields={fields}
                onAddField={addField}
                onRemoveField={removeField}
                onUpdateField={updateField}
              />
            )}
            {step === 2 && <Step3 selectedRoles={roles} onChange={setRoles} />}
            {step === 3 && <Step4 data={info} fields={fields} roles={roles} />}
          </div>

          <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              ← Kembali
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="px-5 py-2.5 rounded-xl text-white font-semibold disabled:opacity-40 transition"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Lanjut →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-white font-semibold disabled:opacity-40 transition"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {loading ? "Menyimpan..." : "✅ Buat Modul"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
