// frontend/src/ui/spj/FormSPJ.jsx
// Form create SPJ (Surat Pertanggungjawaban) untuk role Pelaksana
// POST multipart/form-data ke /api/spj
// PUT /api/spj/:id/submit untuk kirim draft ke bendahara

import React, { useState, useRef } from "react";
import api from "../../utils/api";

const STATUS_LABEL = {
  draft: { text: "Draft", cls: "bg-gray-100 text-gray-700" },
  submitted: { text: "Diajukan", cls: "bg-blue-100 text-blue-700" },
  verified: { text: "Disetujui", cls: "bg-green-100 text-green-700" },
  rejected: { text: "Ditolak", cls: "bg-red-100 text-red-700" },
};

const EMPTY_FORM = {
  judul: "",
  kegiatan: "",
  tanggal_kegiatan: "",
  total_anggaran: "",
  nomor_spj: "",
  keterangan: "",
};

export default function FormSPJ({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdSpj, setCreatedSpj] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const fileRef = useRef();

  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  const MAX_SIZE = 10 * 1024 * 1024;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    setFileError("");
    if (!f) { setFile(null); return; }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError("Hanya PDF, JPG, atau PNG yang diizinkan.");
      setFile(null);
      fileRef.current.value = "";
      return;
    }
    if (f.size > MAX_SIZE) {
      setFileError("Ukuran file maksimal 10 MB.");
      setFile(null);
      fileRef.current.value = "";
      return;
    }
    setFile(f);
  }

  async function handleSaveDraft(e) {
    e.preventDefault();
    if (!form.judul.trim()) return setError("Judul SPJ wajib diisi.");
    if (!form.kegiatan.trim()) return setError("Nama kegiatan wajib diisi.");
    if (!form.tanggal_kegiatan) return setError("Tanggal kegiatan wajib diisi.");

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (file) fd.append("file_bukti", file);

      const res = await api.post("/spj", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const saved = res.data?.data;
      setCreatedSpj(saved);
      setSuccess("SPJ berhasil disimpan sebagai Draft.");
      setForm(EMPTY_FORM);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan SPJ.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!createdSpj?.id) return;
    setSubmittingId(createdSpj.id);
    setError("");
    try {
      await api.put(`/spj/${createdSpj.id}/submit`);
      setCreatedSpj((prev) => ({ ...prev, status: "submitted" }));
      setSuccess("SPJ berhasil diajukan ke Bendahara.");
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengajukan SPJ.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
        <span>📄</span> Buat SPJ Baru
      </h2>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          {success}
        </div>
      )}

      {/* Tampil status SPJ yang baru dibuat */}
      {createdSpj && (
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-blue-500 font-semibold">SPJ tersimpan</span>
            <p className="text-sm text-gray-700 mt-0.5">{createdSpj.judul}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABEL[createdSpj.status]?.cls}`}>
              {STATUS_LABEL[createdSpj.status]?.text}
            </span>
          </div>
          {createdSpj.status === "draft" && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submittingId === createdSpj.id}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              {submittingId === createdSpj.id ? "Mengajukan…" : "Ajukan ke Bendahara"}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSaveDraft} noValidate>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Judul */}
          <div className="md:col-span-2">
            <label htmlFor="spj-judul" className="block text-sm font-medium text-gray-700 mb-1">
              Judul SPJ <span className="text-red-500">*</span>
            </label>
            <input
              id="spj-judul"
              type="text"
              name="judul"
              value={form.judul}
              onChange={handleChange}
              maxLength={300}
              required
              placeholder="Contoh: SPJ Perjalanan Dinas Pemantauan Stok Pangan"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Nama Kegiatan */}
          <div className="md:col-span-2">
            <label htmlFor="spj-kegiatan" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              id="spj-kegiatan"
              type="text"
              name="kegiatan"
              value={form.kegiatan}
              onChange={handleChange}
              maxLength={300}
              required
              placeholder="Nama sub-kegiatan terkait"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Nomor SPJ */}
          <div>
            <label htmlFor="spj-nomor" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor SPJ
            </label>
            <input
              id="spj-nomor"
              type="text"
              name="nomor_spj"
              value={form.nomor_spj}
              onChange={handleChange}
              maxLength={100}
              placeholder="Opsional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tanggal Kegiatan */}
          <div>
            <label htmlFor="spj-tgl" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              id="spj-tgl"
              type="date"
              name="tanggal_kegiatan"
              value={form.tanggal_kegiatan}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Total Anggaran */}
          <div>
            <label htmlFor="spj-anggaran" className="block text-sm font-medium text-gray-700 mb-1">
              Total Anggaran (Rp)
            </label>
            <input
              id="spj-anggaran"
              type="number"
              name="total_anggaran"
              value={form.total_anggaran}
              onChange={handleChange}
              min={0}
              step={1000}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Upload Bukti */}
          <div>
            <label htmlFor="spj-file" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Bukti (PDF / JPG / PNG, maks 10 MB)
            </label>
            <input
              id="spj-file"
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFile}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 cursor-pointer"
            />
            {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
            {file && !fileError && (
              <p className="text-xs text-green-600 mt-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
            )}
          </div>

          {/* Keterangan */}
          <div className="md:col-span-2">
            <label htmlFor="spj-ket" className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              id="spj-ket"
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              placeholder="Uraian singkat kegiatan dan penggunaan anggaran…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            {submitting ? "Menyimpan…" : "Simpan Draft"}
          </button>
          <button
            type="button"
            onClick={() => { setForm(EMPTY_FORM); setFile(null); setError(""); setSuccess(""); setCreatedSpj(null); if (fileRef.current) fileRef.current.value = ""; }}
            className="border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
