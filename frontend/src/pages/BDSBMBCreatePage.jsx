import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BDSBMBCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kabupatenList, setKabupatenList] = useState([]);

  const layananMap = {
    "Bimtek Distribusi": "LY097",
    "Bimtek CPPD": "LY098",
    "Supervisi Lapangan": "LY099",
    "Konsultasi Teknis": "LY100",
    "Fasilitasi Stakeholder": "LY101",
  };

  const [formData, setFormData] = useState({
    jenis_bimbingan: "Bimtek Distribusi",
    nama_kegiatan: "",
    tanggal_kegiatan: new Date().toISOString().split("T")[0],
    kabupaten: "",
    tempat: "",
    jumlah_peserta: "",
    materi_bimbingan: "",
    metode_pelaksanaan: "Tatap Muka",
    penanggung_jawab: "Kepala Bidang Distribusi",
    pelaksana: "",
    is_sensitive: "Biasa",
    status: "perencanaan",
    keterangan: "",
  });

  useEffect(() => {
    setKabupatenList([
      { id: 1, nama: "Halmahera Barat" },
      { id: 2, nama: "Halmahera Tengah" },
      { id: 3, nama: "Kepulauan Sula" },
      { id: 4, nama: "Halmahera Selatan" },
      { id: 5, nama: "Halmahera Utara" },
      { id: 6, nama: "Halmahera Timur" },
      { id: 7, nama: "Pulau Morotai" },
      { id: 8, nama: "Pulau Taliabu" },
      { id: 9, nama: "Kota Ternate" },
      { id: 10, nama: "Kota Tidore Kepulauan" },
    ]);
  }, []);

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
        layanan_id: layananMap[formData.jenis_bimbingan],
        jenis_bimbingan: formData.jenis_bimbingan,
        nama_kegiatan: formData.nama_kegiatan,
        tanggal_kegiatan: formData.tanggal_kegiatan,
        kabupaten: formData.kabupaten || undefined,
        tempat: formData.tempat || undefined,
        jumlah_peserta: formData.jumlah_peserta
          ? parseInt(formData.jumlah_peserta, 10)
          : undefined,
        materi_bimbingan: formData.materi_bimbingan || undefined,
        metode_pelaksanaan: formData.metode_pelaksanaan || undefined,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana:
          formData.pelaksana || user.nama_lengkap || "Staff Distribusi",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || "",
        created_by: user.id,
      };

      await api.post("/bds-bmb", payload);

      alert("✅ Data bimbingan distribusi berhasil dibuat.");
      navigate("/module/bds-bmb");
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
          Input Bimbingan & Pendampingan Distribusi
        </h2>
        <p className="text-sm text-gray-500">Bidang Distribusi</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Bimbingan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_bimbingan"
              value={formData.jenis_bimbingan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="Bimtek Distribusi">Bimtek Distribusi</option>
              <option value="Bimtek CPPD">Bimtek CPPD</option>
              <option value="Supervisi Lapangan">Supervisi Lapangan</option>
              <option value="Konsultasi Teknis">Konsultasi Teknis</option>
              <option value="Fasilitasi Stakeholder">
                Fasilitasi Stakeholder
              </option>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kabupaten/Kota
            </label>
            <select
              name="kabupaten"
              value={formData.kabupaten}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="">Pilih Kabupaten/Kota</option>
              {kabupatenList.map((k) => (
                <option key={k.id} value={k.nama}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempat
            </label>
            <input
              type="text"
              name="tempat"
              value={formData.tempat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Peserta
            </label>
            <input
              type="number"
              name="jumlah_peserta"
              value={formData.jumlah_peserta}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pelaksanaan
            </label>
            <select
              name="metode_pelaksanaan"
              value={formData.metode_pelaksanaan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="Tatap Muka">Tatap Muka</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Kunjungan Lapangan">Kunjungan Lapangan</option>
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
              Materi Bimbingan
            </label>
            <textarea
              name="materi_bimbingan"
              value={formData.materi_bimbingan}
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
            onClick={() => navigate("/module/bds-bmb")}
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
