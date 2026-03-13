import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BKSKMNCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Pembinaan Pangan Segar": "LY117",
    "Sosialisasi Pangan Aman": "LY118",
    "Fasilitasi PSAT": "LY119",
    "Koordinasi Pengawasan": "LY120",
    "Rekomendasi Teknis": "LY121",
  };

  const [formData, setFormData] = useState({
    jenis_kegiatan_keamanan: "Pembinaan Pangan Segar",
    tanggal_kegiatan: new Date().toISOString().split("T")[0],
    lokasi: "",
    objek_pembinaan: "",
    materi_sosialisasi: "",
    rekomendasi_teknis: "",
    status_rekomendasi: "Diproses",
    penanggung_jawab: "Kepala Bidang Konsumsi",
    pelaksana: "",
    is_sensitive: "Sensitif",
    status: "draft",
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
        layanan_id: layananMap[formData.jenis_kegiatan_keamanan] || "LY117",
        jenis_kegiatan_keamanan: formData.jenis_kegiatan_keamanan,
        tanggal_kegiatan: formData.tanggal_kegiatan || undefined,
        lokasi: formData.lokasi || undefined,
        objek_pembinaan: formData.objek_pembinaan || undefined,
        materi_sosialisasi: formData.materi_sosialisasi || undefined,
        rekomendasi_teknis: formData.rekomendasi_teknis || undefined,
        status_rekomendasi: formData.status_rekomendasi || undefined,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Konsumsi",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || "",
      };

      await api.post("/bks-kmn", payload);

      alert("Data keamanan pangan berhasil dibuat.");
      navigate("/module/bks-kmn");
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
        <h2 className="text-2xl font-bold text-gray-800">Input Keamanan Pangan</h2>
        <p className="text-sm text-gray-500">Bidang Konsumsi</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kegiatan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_kegiatan_keamanan"
              value={formData.jenis_kegiatan_keamanan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="Pembinaan Pangan Segar">Pembinaan Pangan Segar</option>
              <option value="Sosialisasi Pangan Aman">Sosialisasi Pangan Aman</option>
              <option value="Fasilitasi PSAT">Fasilitasi PSAT</option>
              <option value="Koordinasi Pengawasan">Koordinasi Pengawasan</option>
              <option value="Rekomendasi Teknis">Rekomendasi Teknis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Kegiatan</label>
            <input
              type="date"
              name="tanggal_kegiatan"
              value={formData.tanggal_kegiatan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objek Pembinaan</label>
            <input
              type="text"
              name="objek_pembinaan"
              value={formData.objek_pembinaan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Rekomendasi</label>
            <select
              name="status_rekomendasi"
              value={formData.status_rekomendasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="Diproses">Diproses</option>
              <option value="Diterbitkan">Diterbitkan</option>
              <option value="Ditolak">Ditolak</option>
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
              <option value="draft">Draft</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Materi Sosialisasi</label>
            <textarea
              name="materi_sosialisasi"
              value={formData.materi_sosialisasi}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rekomendasi Teknis</label>
            <textarea
              name="rekomendasi_teknis"
              value={formData.rekomendasi_teknis}
              onChange={handleChange}
              rows={3}
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
            onClick={() => navigate("/module/bks-kmn")}
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
