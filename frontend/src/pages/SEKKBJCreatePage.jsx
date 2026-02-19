import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SEKKBJCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Bahan Kebijakan Teknis": "LY046",
    "Rekapitulasi Laporan": "LY047",
  };

  const [formData, setFormData] = useState({
    layanan_id: "LY046",
    jenis_layanan_kebijakan: "Bahan Kebijakan Teknis",
    judul: "",
    periode: "",
    tahun: new Date().getFullYear(),
    latar_belakang: "",
    permasalahan: "",
    analisis: "",
    rekomendasi_kebijakan: "",
    kesimpulan: "",
    tindak_lanjut: "",
    ditujukan_kepada: "",
    penanggung_jawab: "Sekretaris",
    pelaksana: "",
    is_sensitive: "Sensitif",
    status: "draft",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "jenis_layanan_kebijakan") {
      setFormData({
        ...formData,
        jenis_layanan_kebijakan: value,
        layanan_id: layananMap[value] || "LY046",
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
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
        jenis_layanan_kebijakan: formData.jenis_layanan_kebijakan,
        judul: formData.judul,
        periode: formData.periode,
        tahun: parseInt(formData.tahun, 10),
        latar_belakang: formData.latar_belakang || null,
        permasalahan: formData.permasalahan || null,
        analisis: formData.analisis || null,
        rekomendasi_kebijakan: formData.rekomendasi_kebijakan || null,
        kesimpulan: formData.kesimpulan || null,
        tindak_lanjut: formData.tindak_lanjut || null,
        ditujukan_kepada: formData.ditujukan_kepada || null,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana:
          formData.pelaksana || user.nama_lengkap || "Staff Sekretariat",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/sek-kbj", payload);

      alert("Data kebijakan berhasil dibuat.");
      navigate("/module/sek-kbj");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Kebijakan & Koordinasi
        </h2>
        <p className="text-sm text-gray-500">Sekretariat</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_kebijakan"
              value={formData.jenis_layanan_kebijakan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Bahan Kebijakan Teknis">
                Bahan Kebijakan Teknis
              </option>
              <option value="Rekapitulasi Laporan">Rekapitulasi Laporan</option>
            </select>
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="periode"
              value={formData.periode}
              onChange={handleChange}
              placeholder="Bulanan/Triwulan/Semester/Tahunan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ditujukan Kepada
            </label>
            <input
              type="text"
              name="ditujukan_kepada"
              value={formData.ditujukan_kepada}
              onChange={handleChange}
              placeholder="Kepala Dinas/Gubernur"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latar Belakang
            </label>
            <textarea
              name="latar_belakang"
              value={formData.latar_belakang}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permasalahan
            </label>
            <textarea
              name="permasalahan"
              value={formData.permasalahan}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analisis
            </label>
            <textarea
              name="analisis"
              value={formData.analisis}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rekomendasi Kebijakan
            </label>
            <textarea
              name="rekomendasi_kebijakan"
              value={formData.rekomendasi_kebijakan}
              onChange={handleChange}
              rows={3}
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
              <option value="finalisasi">Finalisasi</option>
              <option value="disetujui">Disetujui</option>
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
            onClick={() => navigate("/module/sek-kbj")}
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
