import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const JENIS_NASKAH_OPTIONS = [
  "SK",
  "SE",
  "ST",
  "SU",
  "ND",
  "MEMO",
  "BA",
  "LAP",
  "SP",
  "SKET",
  "Lainnya",
];

const EMPTY_FORM = {
  jenis_naskah: "ST",
  tanggal_surat: new Date().toISOString().split("T")[0],
  kepada: "",
  tembusan: "",
  perihal: "",
  isi_surat: "",
  dasar: "",
  penandatangan: "",
  jabatan_ttd: "",
  keterangan: "",
};

export default function FormSuratKeluarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      const fetchSurat = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/surat/keluar/${id}`);
          const d = res.data.data;
          setForm({
            jenis_naskah: d.jenis_naskah || "ST",
            tanggal_surat: d.tanggal_surat || "",
            kepada: d.kepada || "",
            tembusan: Array.isArray(d.tembusan)
              ? d.tembusan.join(", ")
              : d.tembusan || "",
            perihal: d.perihal || "",
            isi_surat: d.isi_surat || "",
            dasar: d.dasar || "",
            penandatangan: d.penandatangan || "",
            jabatan_ttd: d.jabatan_ttd || "",
            keterangan: d.keterangan || "",
          });
        } catch (error) {
          notifyError("Gagal memuat data surat keluar.");
        } finally {
          setLoading(false);
        }
      };
      fetchSurat();
    }
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async (status) => {
    if (
      !form.jenis_naskah ||
      !form.tanggal_surat ||
      !form.kepada ||
      !form.perihal
    ) {
      notifyError(
        "Jenis naskah, tanggal surat, kepada, dan perihal wajib diisi.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== "") formData.append(key, val);
      });
      formData.set("status", status);
      if (file) formData.append("file_draft", file);

      if (isEdit) {
        const updateData = { ...form, status };
        if (form.tembusan) {
          updateData.tembusan = form.tembusan
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        await api.put(`/surat/keluar/${id}`, updateData);
        notifySuccess("Surat keluar berhasil diperbarui.");
      } else {
        const res = await api.post("/surat/keluar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notifySuccess(
          status === "draft"
            ? "Draft surat keluar berhasil disimpan."
            : "Surat keluar berhasil disubmit untuk review.",
        );
        navigate(`/surat/keluar/${res.data.data.id}/edit`);
        return;
      }

      navigate("/surat/keluar");
    } catch (error) {
      notifyError(
        error.response?.data?.message || "Gagal menyimpan surat keluar.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">Memuat data...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate("/surat/keluar")}
          className="text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          {isEdit ? "Edit Surat Keluar" : "Buat Surat Keluar Baru"}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        {/* Jenis Naskah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Naskah <span className="text-red-500">*</span>
          </label>
          <select
            value={form.jenis_naskah}
            onChange={(e) => handleChange("jenis_naskah", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {JENIS_NASKAH_OPTIONS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* Tanggal Surat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Surat <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.tanggal_surat}
            onChange={(e) => handleChange("tanggal_surat", e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Kepada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kepada <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.kepada}
            onChange={(e) => handleChange("kepada", e.target.value)}
            required
            placeholder="Nama/instansi penerima"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Perihal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Perihal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.perihal}
            onChange={(e) => handleChange("perihal", e.target.value)}
            required
            placeholder="Subjek/perihal surat"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Isi Surat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Isi Surat
          </label>
          <textarea
            value={form.isi_surat}
            onChange={(e) => handleChange("isi_surat", e.target.value)}
            rows={4}
            placeholder="Isi/konten surat"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dasar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dasar Hukum
          </label>
          <textarea
            value={form.dasar}
            onChange={(e) => handleChange("dasar", e.target.value)}
            rows={2}
            placeholder="Dasar hukum/peraturan yang mendasari"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tembusan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tembusan{" "}
            <span className="text-xs text-gray-400">(pisah dengan koma)</span>
          </label>
          <textarea
            value={form.tembusan}
            onChange={(e) => handleChange("tembusan", e.target.value)}
            rows={2}
            placeholder="Contoh: Gubernur, Sekda, Arsip"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Penandatangan */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penandatangan
            </label>
            <input
              type="text"
              value={form.penandatangan}
              onChange={(e) => handleChange("penandatangan", e.target.value)}
              placeholder="Nama penandatangan"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jabatan TTD
            </label>
            <input
              type="text"
              value={form.jabatan_ttd}
              onChange={(e) => handleChange("jabatan_ttd", e.target.value)}
              placeholder="Jabatan"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Upload File Draft */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Draft (opsional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 text-sm text-gray-500"
            >
              {file ? `📄 ${file.name}` : "Klik untuk upload file draft"}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        )}

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan
          </label>
          <textarea
            value={form.keterangan}
            onChange={(e) => handleChange("keterangan", e.target.value)}
            rows={2}
            placeholder="Catatan tambahan"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => submitForm("draft")}
            disabled={submitting}
            className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            💾 Simpan Draft
          </button>
          <button
            type="button"
            onClick={() => submitForm("review")}
            disabled={submitting}
            className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "📤 Submit untuk Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
