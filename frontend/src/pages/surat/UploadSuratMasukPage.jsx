import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const MEDIA_TERIMA_OPTIONS = ["WA", "Email", "Pos", "Kurir", "Langsung", "SIPD"];

export default function UploadSuratMasukPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    media_terima: "Langsung",
    tanggal_surat: "",
    asal_surat: "",
    keterangan: "",
  });

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      notifyError("Pilih file surat terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file_surat", file);
      formData.append("media_terima", form.media_terima);
      if (form.tanggal_surat) formData.append("tanggal_surat", form.tanggal_surat);
      if (form.asal_surat) formData.append("asal_surat", form.asal_surat);
      if (form.keterangan) formData.append("keterangan", form.keterangan);

      const res = await api.post("/api/surat/masuk/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.data);
      notifySuccess("Surat masuk berhasil diunggah. AI sedang memproses.");
    } catch (error) {
      notifyError(error.response?.data?.message || "Gagal mengunggah surat.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-green-700 mb-2">Surat Berhasil Diunggah</h2>
        <p className="text-gray-600 mb-1">
          Nomor Agenda: <span className="font-mono font-bold">{success.nomor_agenda}</span>
        </p>
        <p className="text-sm text-blue-600 mt-2">🤖 AI sedang memproses dan menganalisis surat...</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => navigate("/surat/masuk")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lihat Inbox
          </button>
          <button
            onClick={() => { setSuccess(null); setFile(null); setPreview(null); }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Upload Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/surat/masuk")} className="text-gray-500 hover:text-gray-700">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Upload Surat Masuk</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg" />
          ) : file ? (
            <div className="text-gray-600">
              <div className="text-4xl mb-2">📄</div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <div className="text-4xl mb-2">📂</div>
              <p className="font-medium">Drag & drop file atau klik untuk memilih</p>
              <p className="text-sm mt-1">Mendukung: JPG, PNG, PDF</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />

        {/* Media Terima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Media Terima</label>
          <select
            value={form.media_terima}
            onChange={(e) => setForm({ ...form, media_terima: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MEDIA_TERIMA_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Tanggal Surat (opsional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Surat <span className="text-gray-400">(opsional — AI akan mendeteksi)</span>
          </label>
          <input
            type="date"
            value={form.tanggal_surat}
            onChange={(e) => setForm({ ...form, tanggal_surat: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Asal Surat (opsional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asal Surat <span className="text-gray-400">(opsional — AI akan mendeteksi)</span>
          </label>
          <input
            type="text"
            value={form.asal_surat}
            onChange={(e) => setForm({ ...form, asal_surat: e.target.value })}
            placeholder="Nama instansi/pengirim"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <textarea
            value={form.keterangan}
            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
            rows={2}
            placeholder="Catatan tambahan (opsional)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Mengunggah..." : "Upload Surat Masuk"}
        </button>
      </form>
    </div>
  );
}
