import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BKSBMBCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Bimtek Konsumsi": "LY122",
    "Bimtek Keamanan Pangan": "LY123",
    "Pelatihan Pengolahan": "LY124",
    Penyuluhan: "LY125",
    "Konsultasi Teknis": "LY126",
  };

  const [formData, setFormData] = useState({
    jenis_kegiatan: "Bimtek Konsumsi",
    nama_kegiatan: "",
    tanggal_kegiatan: new Date().toISOString().split("T")[0],
    kabupaten: "",
    tempat: "",
    jumlah_peserta: "",
    metode_pelaksanaan: "Tatap Muka",
    materi_bimbingan: "",
    topik_konsultasi: "",
    jawaban_konsultasi: "",
    penanggung_jawab: "Kepala Bidang Konsumsi",
    pelaksana: "",
    is_sensitive: "Biasa",
    status: "perencanaan",
    keterangan: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      if (!user || !user.id) {
        alert("Session expired. Silakan login ulang.");
        navigate("/login");
        return;
      }

      const payload = {
        unit_kerja: "Bidang Konsumsi",
        layanan_id: layananMap[formData.jenis_kegiatan] || "LY122",
        jenis_kegiatan: formData.jenis_kegiatan,
        nama_kegiatan: formData.nama_kegiatan,
        tanggal_kegiatan: formData.tanggal_kegiatan,
        kabupaten: formData.kabupaten || undefined,
        tempat: formData.tempat || undefined,
        jumlah_peserta: formData.jumlah_peserta
          ? Number.parseInt(formData.jumlah_peserta, 10)
          : undefined,
        metode_pelaksanaan: formData.metode_pelaksanaan || undefined,
        materi_bimbingan: formData.materi_bimbingan || undefined,
        topik_konsultasi: formData.topik_konsultasi || undefined,
        jawaban_konsultasi: formData.jawaban_konsultasi || undefined,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Konsumsi",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || "",
      };

      await api.post("/bks-bmb", payload);

      alert("Data bimbingan dan pelatihan berhasil dibuat.");
      navigate("/module/bks-bmb");
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Bimbingan dan Pelatihan Konsumsi
        </h2>
        <p className="text-sm text-gray-500">Bidang Konsumsi</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kegiatan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_kegiatan"
              value={formData.jenis_kegiatan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="Bimtek Konsumsi">Bimtek Konsumsi</option>
              <option value="Bimtek Keamanan Pangan">Bimtek Keamanan Pangan</option>
              <option value="Pelatihan Pengolahan">Pelatihan Pengolahan</option>
              <option value="Penyuluhan">Penyuluhan</option>
              <option value="Konsultasi Teknis">Konsultasi Teknis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_kegiatan"
              value={formData.nama_kegiatan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_kegiatan"
              value={formData.tanggal_kegiatan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kabupaten</label>
            <input
              type="text"
              name="kabupaten"
              value={formData.kabupaten}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tempat</label>
            <input
              type="text"
              name="tempat"
              value={formData.tempat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Peserta</label>
            <input
              type="number"
              name="jumlah_peserta"
              value={formData.jumlah_peserta}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pelaksanaan</label>
            <select
              name="metode_pelaksanaan"
              value={formData.metode_pelaksanaan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="Tatap Muka">Tatap Muka</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Praktik Langsung">Praktik Langsung</option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="perencanaan">Perencanaan</option>
              <option value="pelaksanaan">Pelaksanaan</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Materi Bimbingan</label>
            <textarea
              name="materi_bimbingan"
              value={formData.materi_bimbingan}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Topik Konsultasi</label>
            <textarea
              name="topik_konsultasi"
              value={formData.topik_konsultasi}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Jawaban Konsultasi</label>
            <textarea
              name="jawaban_konsultasi"
              value={formData.jawaban_konsultasi}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pelaksana</label>
            <input
              type="text"
              name="pelaksana"
              value={formData.pelaksana}
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
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
            onClick={() => navigate("/module/bks-bmb")}
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
