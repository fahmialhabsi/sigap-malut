import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BDSCPDCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingRecords, setExistingRecords] = useState([]);
  // Fetch all existing records for duplicate check
  useEffect(() => {
    api
      .get("/bds-cpd")
      .then((res) => {
        if (res.data && res.data.data) setExistingRecords(res.data.data);
      })
      .catch(() => {});
  }, []);

  const layananMap = {
    Perencanaan: "LY092",
    Pengadaan: "LY093",
    "Pengelolaan Stok": "LY094",
    "Penyaluran Darurat": "LY095",
    Evaluasi: "LY096",
  };

  const [formData, setFormData] = useState({
    jenis_layanan_cppd: "Perencanaan",
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    bulan: "",
    penanggung_jawab: "Kepala Bidang Distribusi",
    pelaksana: "",
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
        alert("Session expired. Silakan login ulang.");
        navigate("/login");
        return;
      }

      // Prevent duplicate: periode + jenis_layanan_cppd
      const isDuplicate = existingRecords.some(
        (rec) =>
          rec.periode === formData.periode &&
          rec.jenis_layanan_cppd === formData.jenis_layanan_cppd,
      );
      if (isDuplicate) {
        alert(
          "Data untuk periode dan jenis layanan ini sudah ada di modul lain. Tidak boleh duplikasi!",
        );
        setLoading(false);
        return;
      }

      const payload = {
        unit_kerja: "Bidang Distribusi",
        layanan_id: layananMap[formData.jenis_layanan_cppd],
        jenis_layanan_cppd: formData.jenis_layanan_cppd,
        periode: formData.periode,
        tahun: parseInt(formData.tahun, 10),
        bulan: formData.bulan ? parseInt(formData.bulan, 10) : undefined,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff CPPD",
        status: formData.status,
        keterangan: formData.keterangan || "",
        created_by: user.id,
      };

      await api.post("/bds-cpd", payload);

      alert("Data CPPD berhasil dibuat.");
      navigate("/module/bds-cpd");
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
          Input Cadangan Pangan Daerah
        </h2>
        <p className="text-sm text-gray-500">Bidang Distribusi</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_cppd"
              value={formData.jenis_layanan_cppd}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Perencanaan">Perencanaan</option>
              <option value="Pengadaan">Pengadaan</option>
              <option value="Pengelolaan Stok">Pengelolaan Stok</option>
              <option value="Penyaluran Darurat">Penyaluran Darurat</option>
              <option value="Evaluasi">Evaluasi</option>
            </select>
          </div>

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
              Bulan
            </label>
            <input
              type="number"
              name="bulan"
              value={formData.bulan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="final">Final</option>
              <option value="approved">Approved</option>
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
            onClick={() => navigate("/module/bds-cpd")}
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
