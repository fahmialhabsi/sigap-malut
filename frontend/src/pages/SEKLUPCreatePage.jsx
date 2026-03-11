import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SEKLUPCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    layanan_id: "LY051",
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    umkm_tersertifikasi: "",
    industri_pangan_terdaftar: "",
    temuan_pangan_tidak_layak: "",
    tindakan_pengawasan: "",
    kendala_laboratorium: "",
    kebutuhan_reagen: "",
    kebutuhan_alat: "",
    analisis: "",
    rekomendasi: "",
    sumber_data: "UPTD Balai Pengawasan Mutu",
    file_laporan: "",
    penanggung_jawab: "Sekretaris",
    pelaksana: "UPTD",
    is_sensitive: "Sensitif",
    status: "draft",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toIntOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.id) {
        alert("Session expired. Silakan login ulang.");
        navigate("/login");
        return;
      }

      const payload = {
        layanan_id: formData.layanan_id,
        periode: formData.periode,
        tahun: toIntOrNull(formData.tahun),
        bulan: toIntOrNull(formData.bulan),
        umkm_tersertifikasi: toIntOrNull(formData.umkm_tersertifikasi),
        industri_pangan_terdaftar: toIntOrNull(
          formData.industri_pangan_terdaftar,
        ),
        temuan_pangan_tidak_layak: toIntOrNull(
          formData.temuan_pangan_tidak_layak,
        ),
        tindakan_pengawasan: formData.tindakan_pengawasan || null,
        kendala_laboratorium: formData.kendala_laboratorium || null,
        kebutuhan_reagen: formData.kebutuhan_reagen || null,
        kebutuhan_alat: formData.kebutuhan_alat || null,
        analisis: formData.analisis || null,
        rekomendasi: formData.rekomendasi || null,
        sumber_data: formData.sumber_data || "UPTD Balai Pengawasan Mutu",
        file_laporan: formData.file_laporan || null,
        penanggung_jawab: formData.penanggung_jawab || "Sekretaris",
        pelaksana: formData.pelaksana || "UPTD",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/sek-lup", payload);

      alert("Laporan UPTD berhasil dibuat.");
      navigate("/module/sek-lup");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Input Laporan UPTD</h2>
        <p className="text-sm text-gray-500">Sekretariat</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="periode"
              value={formData.periode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="tahun"
              value={formData.tahun}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bulan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="12"
              name="bulan"
              value={formData.bulan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UMKM Tersertifikasi
            </label>
            <input
              type="number"
              name="umkm_tersertifikasi"
              value={formData.umkm_tersertifikasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industri Pangan Terdaftar
            </label>
            <input
              type="number"
              name="industri_pangan_terdaftar"
              value={formData.industri_pangan_terdaftar}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temuan Pangan Tidak Layak
            </label>
            <input
              type="number"
              name="temuan_pangan_tidak_layak"
              value={formData.temuan_pangan_tidak_layak}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tindakan Pengawasan
            </label>
            <textarea
              name="tindakan_pengawasan"
              value={formData.tindakan_pengawasan}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kendala Laboratorium
            </label>
            <textarea
              name="kendala_laboratorium"
              value={formData.kendala_laboratorium}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kebutuhan Reagen
            </label>
            <textarea
              name="kebutuhan_reagen"
              value={formData.kebutuhan_reagen}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kebutuhan Alat
            </label>
            <textarea
              name="kebutuhan_alat"
              value={formData.kebutuhan_alat}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analisis
            </label>
            <textarea
              name="analisis"
              value={formData.analisis}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rekomendasi
            </label>
            <textarea
              name="rekomendasi"
              value={formData.rekomendasi}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sumber Data
            </label>
            <input
              type="text"
              name="sumber_data"
              value={formData.sumber_data}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Laporan (URL/Nama File)
            </label>
            <input
              type="text"
              name="file_laporan"
              value={formData.file_laporan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penanggung Jawab <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="penanggung_jawab"
              value={formData.penanggung_jawab}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pelaksana <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pelaksana"
              value={formData.pelaksana}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tingkat Sensitivitas <span className="text-red-500">*</span>
            </label>
            <select
              name="is_sensitive"
              value={formData.is_sensitive}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Biasa">Biasa</option>
              <option value="Sensitif">Sensitif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="final">Final</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/sek-lup")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
