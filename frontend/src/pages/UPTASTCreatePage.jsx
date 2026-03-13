import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function UPTASTCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    unit_kerja: "UPTD",
    lokasi_unit: "UPTD Balai Pengawasan Mutu",
    kategori_aset_uptd: "Peralatan Lab",
    akses_terbatas: "true",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/upt-ast", {
        unit_kerja: formData.unit_kerja,
        lokasi_unit: formData.lokasi_unit,
        kategori_aset_uptd: formData.kategori_aset_uptd,
        akses_terbatas: formData.akses_terbatas === "true",
      });

      alert("Data Aset UPTD berhasil dibuat.");
      navigate("/module/upt-ast");
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
          Input Aset & Perlengkapan UPTD
        </h2>
        <p className="text-sm text-gray-500">
          UPTD Balai Pengawasan Mutu dan Keamanan Pangan
        </p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="UPTD">UPTD</option>
              <option value="Sekretariat">Sekretariat</option>
              <option value="Bidang Ketersediaan">Bidang Ketersediaan</option>
              <option value="Bidang Distribusi">Bidang Distribusi</option>
              <option value="Bidang Konsumsi">Bidang Konsumsi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Unit
            </label>
            <input
              type="text"
              name="lokasi_unit"
              value={formData.lokasi_unit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Aset UPTD
            </label>
            <select
              name="kategori_aset_uptd"
              value={formData.kategori_aset_uptd}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="Alat Inspeksi">Alat Inspeksi</option>
              <option value="Peralatan Lab">Peralatan Lab</option>
              <option value="Alat Kantor">Alat Kantor</option>
              <option value="Kendaraan">Kendaraan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Akses Terbatas <span className="text-red-500">*</span>
            </label>
            <select
              name="akses_terbatas"
              value={formData.akses_terbatas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="true">Ya</option>
              <option value="false">Tidak</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Data"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/module/upt-ast")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
