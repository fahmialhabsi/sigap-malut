import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const PRIORITAS_OPTIONS = ["Rendah", "Normal", "Tinggi", "Urgent"];

export default function FormDisposisiPage() {
  const { id: suratId } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    kepada_user_id: "",
    kepada_unit: "",
    instruksi: "",
    catatan: "",
    batas_waktu: "",
    prioritas: "Normal",
  });

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        const res = await api.get(`/api/surat/masuk/${suratId}`);
        const data = res.data.data;
        setSurat(data);
        // Pre-fill kepada_unit dengan ai_routing jika ada
        if (data.ai_routing) {
          setForm((prev) => ({ ...prev, kepada_unit: data.ai_routing }));
        }
      } catch (error) {
        notifyError("Gagal memuat data surat.");
      } finally {
        setLoading(false);
      }
    };
    fetchSurat();
  }, [suratId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.instruksi.trim()) {
      notifyError("Instruksi wajib diisi.");
      return;
    }
    if (!form.kepada_user_id) {
      notifyError("ID penerima wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/surat/masuk/disposisi", {
        surat_masuk_id: suratId,
        kepada_user_id: parseInt(form.kepada_user_id),
        kepada_unit: form.kepada_unit || undefined,
        instruksi: form.instruksi,
        catatan: form.catatan || undefined,
        batas_waktu: form.batas_waktu || undefined,
        prioritas: form.prioritas,
      });

      notifySuccess("Disposisi berhasil dibuat.");
      navigate("/surat/masuk");
    } catch (error) {
      notifyError(error.response?.data?.message || "Gagal membuat disposisi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Memuat data surat...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(`/surat/masuk/${suratId}`)} className="text-gray-500 hover:text-gray-700">
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-800">Buat Disposisi</h1>
      </div>

      {/* Info Surat */}
      {surat && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-sm">
          <p className="font-mono font-bold text-blue-700 mb-1">{surat.nomor_agenda}</p>
          <p className="font-medium text-gray-800">{surat.perihal}</p>
          <p className="text-gray-500 mt-1">Dari: {surat.asal_surat}</p>
          {surat.ai_routing && (
            <p className="text-indigo-600 mt-1">🤖 Rekomendasi AI: <strong>{surat.ai_routing}</strong></p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        {/* Kepada Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Tujuan
          </label>
          <input
            type="text"
            value={form.kepada_unit}
            onChange={(e) => setForm({ ...form, kepada_unit: e.target.value })}
            placeholder="Contoh: Bidang Ketersediaan Pangan"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Kepada User ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Penerima <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.kepada_user_id}
            onChange={(e) => setForm({ ...form, kepada_user_id: e.target.value })}
            placeholder="ID User penerima disposisi"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Instruksi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instruksi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.instruksi}
            onChange={(e) => setForm({ ...form, instruksi: e.target.value })}
            rows={3}
            required
            placeholder="Tuliskan instruksi disposisi..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Prioritas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
          <select
            value={form.prioritas}
            onChange={(e) => setForm({ ...form, prioritas: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITAS_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Batas Waktu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu</label>
          <input
            type="date"
            value={form.batas_waktu}
            onChange={(e) => setForm({ ...form, batas_waktu: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea
            value={form.catatan}
            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            rows={2}
            placeholder="Catatan tambahan (opsional)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/surat/masuk/${suratId}`)}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "📨 Kirim Disposisi"}
          </button>
        </div>
      </form>
    </div>
  );
}
