import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BKSEVLCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Evaluasi Program Konsumsi": "LY127",
    "Evaluasi Penganekaragaman": "LY128",
    "Evaluasi Keamanan Pangan": "LY129",
  };

  const [formData, setFormData] = useState({
    jenis_evaluasi: "Evaluasi Program Konsumsi",
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    judul_evaluasi: "",
    objek_evaluasi: "",
    metode_evaluasi: "Desk Evaluation",
    persentase_capaian: "",
    temuan_evaluasi: "",
    rekomendasi: "",
    tindak_lanjut: "",
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
        layanan_id: layananMap[formData.jenis_evaluasi] || "LY127",
        jenis_evaluasi: formData.jenis_evaluasi,
        periode: formData.periode,
        tahun: Number.parseInt(formData.tahun, 10),
        bulan: formData.bulan ? Number.parseInt(formData.bulan, 10) : undefined,
        judul_evaluasi: formData.judul_evaluasi,
        objek_evaluasi: formData.objek_evaluasi || undefined,
        metode_evaluasi: formData.metode_evaluasi || undefined,
        persentase_capaian: formData.persentase_capaian
          ? Number.parseFloat(formData.persentase_capaian)
          : undefined,
        temuan_evaluasi: formData.temuan_evaluasi || undefined,
        rekomendasi: formData.rekomendasi || undefined,
        tindak_lanjut: formData.tindak_lanjut || undefined,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Konsumsi",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || "",
      };

      await api.post("/bks-evl", payload);

      alert("Data evaluasi konsumsi berhasil dibuat.");
      navigate("/module/bks-evl");
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
        <h2 className="text-2xl font-bold text-gray-800">Input Monitoring Evaluasi Konsumsi</h2>
        <p className="text-sm text-gray-500">Bidang Konsumsi</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Evaluasi <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_evaluasi"
              value={formData.jenis_evaluasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="Evaluasi Program Konsumsi">Evaluasi Program Konsumsi</option>
              <option value="Evaluasi Penganekaragaman">Evaluasi Penganekaragaman</option>
              <option value="Evaluasi Keamanan Pangan">Evaluasi Keamanan Pangan</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <input
              type="number"
              name="bulan"
              value={formData.bulan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Evaluasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul_evaluasi"
              value={formData.judul_evaluasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objek Evaluasi</label>
            <input
              type="text"
              name="objek_evaluasi"
              value={formData.objek_evaluasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Evaluasi</label>
            <select
              name="metode_evaluasi"
              value={formData.metode_evaluasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="Desk Evaluation">Desk Evaluation</option>
              <option value="Field Visit">Field Visit</option>
              <option value="Survey">Survey</option>
              <option value="Interview">Interview</option>
              <option value="FGD">FGD</option>
              <option value="Kombinasi">Kombinasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Persentase Capaian (%)</label>
            <input
              type="number"
              step="0.01"
              name="persentase_capaian"
              value={formData.persentase_capaian}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Temuan Evaluasi</label>
            <textarea
              name="temuan_evaluasi"
              value={formData.temuan_evaluasi}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rekomendasi</label>
            <textarea
              name="rekomendasi"
              value={formData.rekomendasi}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tindak Lanjut</label>
            <textarea
              name="tindak_lanjut"
              value={formData.tindak_lanjut}
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
            onClick={() => navigate("/module/bks-evl")}
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
