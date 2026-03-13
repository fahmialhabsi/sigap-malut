import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function UPTADMCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    unit_kerja: "UPTD Balai Pengawasan",
    akses_terbatas: "0",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        unit_kerja: formData.unit_kerja,
        akses_terbatas: parseInt(formData.akses_terbatas, 10),
      };

      await api.post("/upt-adm", payload);
      alert("Data Administrasi Umum UPTD berhasil dibuat.");
      navigate("/module/upt-adm");
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
          Input Administrasi Umum UPTD
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
            <input
              type="text"
              name="unit_kerja"
              value={formData.unit_kerja}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Akses Terbatas
            </label>
            <select
              name="akses_terbatas"
              value={formData.akses_terbatas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="0">Tidak (Publik)</option>
              <option value="1">Ya (Terbatas)</option>
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
            onClick={() => navigate("/module/upt-adm")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
