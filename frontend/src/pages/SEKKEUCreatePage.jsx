import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SEKKEUCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    unit_kerja: "Sekretariat",
    kode_unit: "00",
    layanan_id: "LY016",
    tahun_anggaran: new Date().getFullYear(),
    jenis_layanan_keuangan: "RKA/DPA",
    penanggung_jawab: "Bendahara",
    pelaksana: "",
    status: "pending",
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
        ...formData,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Keuangan",
        created_by: user.id,
      };

      await api.post("/sek-keu", payload);

      alert("✅ Data keuangan berhasil dibuat!");
      navigate("/module/sek-keu");
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
          Input Keuangan & Anggaran
        </h2>
        <p className="text-sm text-gray-500">Sekretariat</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Kerja <span className="text-red-500">*</span>
            </label>
            <select
              name="unit_kerja"
              value={formData.unit_kerja}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Sekretariat">Sekretariat</option>
              <option value="UPTD">UPTD</option>
              <option value="Bidang Ketersediaan">Bidang Ketersediaan</option>
              <option value="Bidang Distribusi">Bidang Distribusi</option>
              <option value="Bidang Konsumsi">Bidang Konsumsi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="kode_unit"
              value={formData.kode_unit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="layanan_id"
              value={formData.layanan_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="LY016">Penyusunan RKA & DPA</option>
              <option value="LY017">Administrasi Belanja</option>
              <option value="LY018">Pencairan Anggaran</option>
              <option value="LY019">SPJ & Pertanggungjawaban</option>
              <option value="LY020">Laporan Keuangan</option>
              <option value="LY021">Revisi Anggaran</option>
              <option value="LY022">Monitoring Realisasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Anggaran <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="tahun_anggaran"
              value={formData.tahun_anggaran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_keuangan"
              value={formData.jenis_layanan_keuangan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="RKA/DPA">RKA/DPA</option>
              <option value="Belanja">Belanja</option>
              <option value="Pencairan">Pencairan</option>
              <option value="SPJ">SPJ</option>
              <option value="Laporan">Laporan</option>
              <option value="Revisi">Revisi</option>
              <option value="Monitoring">Monitoring</option>
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
              <option value="pending">Pending</option>
              <option value="proses">Proses</option>
              <option value="diverifikasi">Diverifikasi</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="selesai">Selesai</option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/sek-keu")}
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
