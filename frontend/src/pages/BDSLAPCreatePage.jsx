import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BDSLAPCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    judul_laporan: "",
    ringkasan_eksekutif: "",
    inflasi_pangan: "",
    target_inflasi: "2.5",
    volume_distribusi_total: "",
    stok_cppd: "",
    permasalahan: "",
    rekomendasi: "",
    tindak_lanjut: "",
    penanggung_jawab: "Kepala Bidang Distribusi",
    pelaksana: "",
    is_sensitive: "Sensitif",
    status: "draft",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.id) {
        alert("❌ Session expired. Silakan login ulang.");
        navigate("/login");
        return;
      }

      const payload = {
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY106",
        periode: formData.periode,
        tahun: parseInt(formData.tahun, 10),
        bulan: formData.bulan ? parseInt(formData.bulan, 10) : undefined,
        judul_laporan: formData.judul_laporan,
        ringkasan_eksekutif: formData.ringkasan_eksekutif || undefined,
        inflasi_pangan: formData.inflasi_pangan
          ? parseFloat(formData.inflasi_pangan)
          : undefined,
        target_inflasi: formData.target_inflasi
          ? parseFloat(formData.target_inflasi)
          : undefined,
        volume_distribusi_total: formData.volume_distribusi_total
          ? parseFloat(formData.volume_distribusi_total)
          : undefined,
        stok_cppd: formData.stok_cppd
          ? parseFloat(formData.stok_cppd)
          : undefined,
        permasalahan: formData.permasalahan || undefined,
        rekomendasi: formData.rekomendasi || undefined,
        tindak_lanjut: formData.tindak_lanjut || undefined,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Pelaporan",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || "",
        created_by: user.id,
      };

      await api.post("/bds-lap", payload);

      alert("✅ Laporan kinerja distribusi berhasil dibuat.");
      navigate("/module/bds-lap");
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Laporan Kinerja Distribusi
        </h2>
        <p className="text-sm text-gray-500">Bidang Distribusi</p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bulan
            </label>
            <input
              type="number"
              name="bulan"
              value={formData.bulan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="final">Final</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Laporan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul_laporan"
              value={formData.judul_laporan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ringkasan Eksekutif
            </label>
            <textarea
              name="ringkasan_eksekutif"
              value={formData.ringkasan_eksekutif}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inflasi Pangan (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="inflasi_pangan"
              value={formData.inflasi_pangan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Inflasi (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="target_inflasi"
              value={formData.target_inflasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume Distribusi Total
            </label>
            <input
              type="number"
              step="0.01"
              name="volume_distribusi_total"
              value={formData.volume_distribusi_total}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stok CPPD
            </label>
            <input
              type="number"
              step="0.01"
              name="stok_cppd"
              value={formData.stok_cppd}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sensitivitas Data <span className="text-red-500">*</span>
            </label>
            <select
              name="is_sensitive"
              value={formData.is_sensitive}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="Biasa">Biasa</option>
              <option value="Sensitif">Sensitif</option>
            </select>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pelaksana
            </label>
            <input
              type="text"
              name="pelaksana"
              value={formData.pelaksana}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rekomendasi
            </label>
            <textarea
              name="rekomendasi"
              value={formData.rekomendasi}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tindak Lanjut
            </label>
            <textarea
              name="tindak_lanjut"
              value={formData.tindak_lanjut}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/bds-lap")}
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
