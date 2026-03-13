import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BKTFSLCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Intervensi Produksi": "LY066",
    "Intervensi Distribusi": "LY066",
    "Intervensi Konsumsi": "LY066",
    "Bantuan Pangan": "LY066",
    Lainnya: "LY066",
  };

  const [formData, setFormData] = useState({
    jenis_fasilitasi: "Intervensi Produksi",
    nama_program: "",
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    wilayah_sasaran: "",
    kelompok_sasaran: "",
    jumlah_penerima: "",
    jenis_intervensi: "Bantuan Benih",
    volume_bantuan: "",
    satuan: "",
    nilai_bantuan: "",
    sumber_bantuan: "",
    instansi_pemberi: "",
    tanggal_penyaluran: "",
    lokasi_penyaluran: "",
    penanggung_jawab_penyaluran: "",
    status: "perencanaan",
    penanggung_jawab: "Kepala Bidang Ketersediaan",
    pelaksana: "",
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
        unit_kerja: "Bidang Ketersediaan",
        layanan_id: layananMap[formData.jenis_fasilitasi] || "LY066",
        jenis_fasilitasi: formData.jenis_fasilitasi,
        nama_program: formData.nama_program,
        periode: formData.periode,
        tahun: Number.parseInt(formData.tahun, 10),
        wilayah_sasaran: formData.wilayah_sasaran || null,
        kelompok_sasaran: formData.kelompok_sasaran || null,
        jumlah_penerima: formData.jumlah_penerima
          ? Number.parseInt(formData.jumlah_penerima, 10)
          : null,
        jenis_intervensi: formData.jenis_intervensi || null,
        volume_bantuan: formData.volume_bantuan
          ? Number.parseFloat(formData.volume_bantuan)
          : null,
        satuan: formData.satuan || null,
        nilai_bantuan: formData.nilai_bantuan
          ? Number.parseFloat(formData.nilai_bantuan)
          : null,
        sumber_bantuan: formData.sumber_bantuan || null,
        instansi_pemberi: formData.instansi_pemberi || null,
        tanggal_penyaluran: formData.tanggal_penyaluran || null,
        lokasi_penyaluran: formData.lokasi_penyaluran || null,
        penanggung_jawab_penyaluran:
          formData.penanggung_jawab_penyaluran || null,
        status: formData.status,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana:
          formData.pelaksana || user.nama_lengkap || "Staff Fasilitasi",
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/bkt-fsl", payload);

      alert("Data fasilitasi berhasil dibuat.");
      navigate("/module/bkt-fsl");
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
          Input Fasilitasi dan Intervensi
        </h2>
        <p className="text-sm text-gray-500">Bidang Ketersediaan</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Fasilitasi <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_fasilitasi"
              value={formData.jenis_fasilitasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option value="Intervensi Produksi" style={{ color: "#111827" }}>
                Intervensi Produksi
              </option>
              <option
                value="Intervensi Distribusi"
                style={{ color: "#111827" }}
              >
                Intervensi Distribusi
              </option>
              <option value="Intervensi Konsumsi" style={{ color: "#111827" }}>
                Intervensi Konsumsi
              </option>
              <option value="Bantuan Pangan" style={{ color: "#111827" }}>
                Bantuan Pangan
              </option>
              <option value="Lainnya" style={{ color: "#111827" }}>
                Lainnya
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Program <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_program"
              value={formData.nama_program}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
              required
            />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wilayah Sasaran
            </label>
            <input
              type="text"
              name="wilayah_sasaran"
              value={formData.wilayah_sasaran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelompok Sasaran
            </label>
            <input
              type="text"
              name="kelompok_sasaran"
              value={formData.kelompok_sasaran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Penerima
            </label>
            <input
              type="number"
              name="jumlah_penerima"
              value={formData.jumlah_penerima}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Intervensi
            </label>
            <select
              name="jenis_intervensi"
              value={formData.jenis_intervensi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
            >
              <option value="Bantuan Benih" style={{ color: "#111827" }}>
                Bantuan Benih
              </option>
              <option value="Bantuan Pupuk" style={{ color: "#111827" }}>
                Bantuan Pupuk
              </option>
              <option value="Bantuan Alat" style={{ color: "#111827" }}>
                Bantuan Alat
              </option>
              <option value="Bantuan Pangan" style={{ color: "#111827" }}>
                Bantuan Pangan
              </option>
              <option value="Pelatihan" style={{ color: "#111827" }}>
                Pelatihan
              </option>
              <option value="Pendampingan" style={{ color: "#111827" }}>
                Pendampingan
              </option>
              <option value="Lainnya" style={{ color: "#111827" }}>
                Lainnya
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume Bantuan
            </label>
            <input
              type="number"
              step="0.01"
              name="volume_bantuan"
              value={formData.volume_bantuan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Satuan
            </label>
            <input
              type="text"
              name="satuan"
              value={formData.satuan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nilai Bantuan (Rp)
            </label>
            <input
              type="number"
              step="0.01"
              name="nilai_bantuan"
              value={formData.nilai_bantuan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sumber Bantuan
            </label>
            <input
              type="text"
              name="sumber_bantuan"
              value={formData.sumber_bantuan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instansi Pemberi
            </label>
            <input
              type="text"
              name="instansi_pemberi"
              value={formData.instansi_pemberi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Penyaluran
            </label>
            <input
              type="date"
              name="tanggal_penyaluran"
              value={formData.tanggal_penyaluran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Penyaluran
            </label>
            <input
              type="text"
              name="lokasi_penyaluran"
              value={formData.lokasi_penyaluran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penanggung Jawab Penyaluran
            </label>
            <input
              type="text"
              name="penanggung_jawab_penyaluran"
              value={formData.penanggung_jawab_penyaluran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option value="perencanaan" style={{ color: "#111827" }}>
                Perencanaan
              </option>
              <option value="pelaksanaan" style={{ color: "#111827" }}>
                Pelaksanaan
              </option>
              <option value="selesai" style={{ color: "#111827" }}>
                Selesai
              </option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
              required
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 
focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/bkt-fsl")}
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
