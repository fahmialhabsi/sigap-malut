import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BDSHRGCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [komoditasList, setKomoditasList] = useState([]);
  const [pasarList, setPasarList] = useState([]);

  const layananMap = {
    "Pemantauan Harga": "LY087",
    "Analisis Fluktuasi": "LY088",
    "Rekomendasi Stabilisasi": "LY089",
    "Operasi Pasar": "LY090",
    "Koordinasi TPID": "LY091",
  };

  const [formData, setFormData] = useState({
    jenis_layanan_harga: "Pemantauan Harga",
    komoditas_id: "",
    nama_komoditas: "",
    nama_pasar: "",
    tanggal_pantau: new Date().toISOString().split("T")[0],
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    harga: "",
    satuan: "kg",
    tren_harga: "Stabil",
    keterangan: "",
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    // Hardcode master data (atau bisa fetch dari API)
    setKomoditasList([
      { id: 1, nama: "Beras" },
      { id: 2, nama: "Jagung" },
      { id: 3, nama: "Kedelai" },
      { id: 4, nama: "Gula Pasir" },
      { id: 5, nama: "Minyak Goreng" },
      { id: 6, nama: "Daging Sapi" },
      { id: 7, nama: "Daging Ayam" },
      { id: 8, nama: "Telur Ayam" },
      { id: 9, nama: "Cabai Merah" },
      { id: 10, nama: "Bawang Merah" },
    ]);

    setPasarList([
      "Pasar Gamalama Ternate",
      "Pasar Tobelo",
      "Pasar Sofifi",
      "Pasar Labuha",
      "Pasar Sanana",
      "Pasar Utama",
    ]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "komoditas_id") {
      const komoditas = komoditasList.find((k) => k.id === parseInt(value));
      setFormData({
        ...formData,
        komoditas_id: value,
        nama_komoditas: komoditas?.nama || "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

      await api.post("/bds-hrg", {
        unit_kerja: "Bidang Distribusi",
        layanan_id: layananMap[formData.jenis_layanan_harga],
        jenis_layanan_harga: formData.jenis_layanan_harga,
        komoditas_id: parseInt(formData.komoditas_id),
        nama_komoditas: formData.nama_komoditas,
        nama_pasar: formData.nama_pasar,
        tanggal_pantau: formData.tanggal_pantau,
        periode: formData.periode,
        tahun: parseInt(formData.tahun),
        bulan: parseInt(formData.bulan),
        harga: parseFloat(formData.harga),
        satuan: formData.satuan,
        tren_harga: formData.tren_harga,
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: user.nama_lengkap || "Pengumpul Data Harga",
        status: "final",
        keterangan: formData.keterangan || "",
        created_by: user.id,
      });

      alert("✅ Data harga berhasil disimpan!");
      navigate("/module/bds-hrg");
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Data Harga Pangan
        </h2>
        <p className="text-sm text-gray-500">Bidang Distribusi Pangan</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_harga"
              value={formData.jenis_layanan_harga}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Pemantauan Harga">Pemantauan Harga</option>
              <option value="Analisis Fluktuasi">Analisis Fluktuasi</option>
              <option value="Rekomendasi Stabilisasi">Rekomendasi Stabilisasi</option>
              <option value="Operasi Pasar">Operasi Pasar</option>
              <option value="Koordinasi TPID">Koordinasi TPID</option>
            </select>
          </div>
          {/* Komoditas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Komoditas <span className="text-red-500">*</span>
            </label>
            <select
              name="komoditas_id"
              value={formData.komoditas_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Komoditas</option>
              {komoditasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Pasar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pasar <span className="text-red-500">*</span>
            </label>
            <select
              name="nama_pasar"
              value={formData.nama_pasar}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Pasar</option>
              {pasarList.map((pasar) => (
                <option key={pasar} value={pasar}>
                  {pasar}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Pantau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Pantau <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_pantau"
              value={formData.tanggal_pantau}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Harga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="harga"
              value={formData.harga}
              onChange={handleChange}
              placeholder="Contoh: 12500"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Satuan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Satuan <span className="text-red-500">*</span>
            </label>
            <select
              name="satuan"
              value={formData.satuan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="liter">Liter</option>
              <option value="butir">Butir</option>
              <option value="ikat">Ikat</option>
            </select>
          </div>

          {/* Tren Harga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tren Harga <span className="text-red-500">*</span>
            </label>
            <select
              name="tren_harga"
              value={formData.tren_harga}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Stabil">Stabil</option>
              <option value="Naik">Naik</option>
              <option value="Turun">Turun</option>
            </select>
          </div>

          {/* Keterangan */}
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
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/bds-hrg")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Data Harga"}
          </button>
        </div>
      </form>
    </div>
  );
}
