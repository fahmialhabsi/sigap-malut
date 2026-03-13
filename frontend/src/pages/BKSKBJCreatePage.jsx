import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BKSKBJCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Kebijakan Konsumsi": "LY107",
    "Pedoman B2SA": "LY108",
    "Penganekaragaman Pangan": "LY109",
    Sinkronisasi: "LY110",
    "Rekomendasi Intervensi": "LY111",
  };

  const [formData, setFormData] = useState({
    jenis_kebijakan: "Kebijakan Konsumsi",
    tanggal_dokumen: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    judul_kebijakan: "",
    latar_belakang: "",
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
        layanan_id: layananMap[formData.jenis_kebijakan] || "LY107",
        jenis_kebijakan: formData.jenis_kebijakan,
        tanggal_dokumen: formData.tanggal_dokumen,
        tahun: Number.parseInt(formData.tahun, 10),
        judul_kebijakan: formData.judul_kebijakan,
        latar_belakang: formData.latar_belakang || undefined,
        rekomendasi: formData.rekomendasi || undefined,
        tindak_lanjut: formData.tindak_lanjut || undefined,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Konsumsi",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || "",
      };

      await api.post("/bks-kbj", payload);

      alert("Data kebijakan konsumsi berhasil dibuat.");
      navigate("/module/bks-kbj");
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
        <h2 className="text-2xl font-bold text-gray-800">Input Kebijakan Konsumsi Pangan</h2>
        <p className="text-sm text-gray-500">Bidang Konsumsi</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kebijakan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_kebijakan"
              value={formData.jenis_kebijakan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="Kebijakan Konsumsi">Kebijakan Konsumsi</option>
              <option value="Pedoman B2SA">Pedoman B2SA</option>
              <option value="Penganekaragaman Pangan">Penganekaragaman Pangan</option>
              <option value="Sinkronisasi">Sinkronisasi</option>
              <option value="Rekomendasi Intervensi">Rekomendasi Intervensi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Dokumen <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_dokumen"
              value={formData.tanggal_dokumen}
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
              <option value="finalisasi">Finalisasi</option>
              <option value="disetujui">Disetujui</option>
              <option value="final">Final</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Kebijakan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul_kebijakan"
              value={formData.judul_kebijakan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Latar Belakang</label>
            <textarea
              name="latar_belakang"
              value={formData.latar_belakang}
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
            onClick={() => navigate("/module/bks-kbj")}
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
