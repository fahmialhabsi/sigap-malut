import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BKTPGDCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [komoditasList, setKomoditasList] = useState([]);
  const [kabupatenList, setKabupatenList] = useState([]);

  const layananMap = {
    "Pemantauan Produksi": "LY057",
    "Pemantauan Pasokan": "LY058",
    "Neraca Pangan": "LY059",
    "Early Warning": "LY060",
    "Sistem Informasi": "LY061",
  };

  const [formData, setFormData] = useState({
    komoditas_id: "",
    nama_komoditas: "",
    jenis_pengendalian: "Pemantauan Produksi",
    periode: "",
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    kabupaten: "",
    luas_tanam: "",
    luas_panen: "",
    produksi: "",
    produktivitas: "",
    keterangan: "",
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      // Fetch komoditas (dari master data atau hardcode)
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

      setKabupatenList([
        { id: 1, nama: "Halmahera Barat" },
        { id: 2, nama: "Halmahera Tengah" },
        { id: 3, nama: "Kepulauan Sula" },
        { id: 4, nama: "Halmahera Selatan" },
        { id: 5, nama: "Halmahera Utara" },
        { id: 9, nama: "Kota Ternate" },
        { id: 10, nama: "Kota Tidore Kepulauan" },
      ]);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-fill nama_komoditas when komoditas_id changes
    if (name === "komoditas_id") {
      const komoditas = komoditasList.find((k) => k.id === parseInt(value));
      setFormData({
        ...formData,
        komoditas_id: value,
        nama_komoditas: komoditas?.nama || "",
      });
    } else if (name === "kabupaten") {
      setFormData({ ...formData, kabupaten: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // DEBUG: Check localStorage
      console.log("=== DEBUG START ===");
      console.log("localStorage token:", localStorage.getItem("token"));
      console.log("localStorage user:", localStorage.getItem("user"));

      // Get user from localStorage
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      console.log("Parsed user:", user);
      console.log("User ID:", user?.id);
      console.log("=== DEBUG END ===");

      if (!user || !user.id) {
        alert(
          "❌ Error: User tidak terautentikasi.\n\nSilakan logout dan login ulang.",
        );
        setLoading(false);
        navigate("/login");
        return;
      }

      // Submit ke Bidang Ketersediaan (BKT-PGD)
      const bktPgdData = {
        unit_kerja: "Bidang Ketersediaan",
        layanan_id: layananMap[formData.jenis_pengendalian],
        jenis_pengendalian: formData.jenis_pengendalian,
        komoditas_id: parseInt(formData.komoditas_id),
        nama_komoditas: formData.nama_komoditas,
        periode: formData.periode,
        tahun: parseInt(formData.tahun),
        bulan: parseInt(formData.bulan),
        kabupaten: formData.kabupaten,
        luas_tanam: parseFloat(formData.luas_tanam),
        luas_panen: parseFloat(formData.luas_panen),
        produksi_total: parseFloat(formData.produksi),
        produktivitas: parseFloat(formData.produktivitas || 0),
        penanggung_jawab: "Kepala Bidang Ketersediaan",
        pelaksana: user.nama_lengkap || "Staff Pendataan",
        status: "final",
        keterangan: formData.keterangan || "",
        created_by: user.id,
      };

      console.log("Sending BKT-PGD data:", bktPgdData);

      // 1. Submit ke BKT-PGD
      await api.post("/bkt-pgd", bktPgdData);

      // 2. AUTO-SYNC: Kirim ke Bidang Distribusi
      await api.post("/bds-hrg", {
        unit_kerja: "Bidang Distribusi",
        layanan_id: "LY087",
        jenis_layanan_harga: "Pemantauan Harga",
        periode: formData.periode,
        tahun: parseInt(formData.tahun),
        bulan: parseInt(formData.bulan),
        komoditas_id: parseInt(formData.komoditas_id),
        nama_komoditas: formData.nama_komoditas,
        nama_pasar: "Pasar Utama",
        tanggal_pantau: formData.periode,
        harga: 0,
        satuan: "kg",
        tren_harga: "Stabil",
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: "Pengumpul Data Harga",
        status: "draft",
        created_by: user.id,
      });

      // 3. AUTO-REPORT: Kirim ke Sekretariat
      await api.post("/sek-adm", {
        unit_kerja: "Sekretariat",
        layanan_id: "LY001",
        nomor_surat: `AUTO/${Date.now()}`,
        jenis_naskah: "Lainnya",
        tanggal_surat: new Date().toISOString().split("T")[0],
        pengirim_penerima: "Bidang Ketersediaan",
        perihal: `Data Produksi ${formData.nama_komoditas} Periode ${formData.periode}`,
        penanggung_jawab: "Sekretaris",
        pelaksana: "Staff Administrasi",
        status: "proses",
        created_by: user.id,
      });

      alert(
        "✅ Data produksi berhasil disimpan!\n\n" +
          "📊 Auto-sync ke Bidang Distribusi (draft - menunggu input harga)\n" +
          "📨 Auto-report ke Sekretariat (status: proses)",
      );

      navigate("/module/bkt-pgd");
    } catch (error) {
      console.error("Submit error:", error);

      // Better error message
      let errorMsg = "Gagal menyimpan data";

      if (error.response?.data) {
        errorMsg =
          error.response.data.error || error.response.data.message || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }

      alert("❌ Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Data Produksi Pangan
        </h2>
        <p className="text-sm text-gray-500">
          Bidang Ketersediaan dan Kerawanan Pangan
        </p>
      </div>

      {/* Workflow Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Workflow Otomatis
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Setelah submit, sistem akan otomatis:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>✅ Menyimpan data produksi di Bidang Ketersediaan</li>
                <li>
                  📊 Mengirim data komoditas ke Bidang Distribusi (status:
                  draft, menunggu input harga)
                </li>
                <li>📨 Membuat laporan otomatis ke Sekretariat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Jenis Pengendalian */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Pengendalian <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_pengendalian"
              value={formData.jenis_pengendalian}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Pemantauan Produksi">Pemantauan Produksi</option>
              <option value="Pemantauan Pasokan">Pemantauan Pasokan</option>
              <option value="Neraca Pangan">Neraca Pangan</option>
              <option value="Early Warning">Early Warning</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
            </select>
          </div>

          {/* Periode */}
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

          {/* Kabupaten */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kabupaten/Kota <span className="text-red-500">*</span>
            </label>
            <select
              name="kabupaten"
              value={formData.kabupaten}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Kabupaten/Kota</option>
              {kabupatenList.map((k) => (
                <option key={k.id} value={k.nama}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Luas Tanam */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Luas Tanam (Ha) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="luas_tanam"
              value={formData.luas_tanam}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Luas Panen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Luas Panen (Ha) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="luas_panen"
              value={formData.luas_panen}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Produksi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produksi (Ton) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="produksi"
              value={formData.produksi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Produktivitas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produktivitas (Ton/Ha)
            </label>
            <input
              type="number"
              step="0.01"
              name="produktivitas"
              value={formData.produktivitas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/bkt-pgd")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan & Auto-Sync"}
          </button>
        </div>
      </form>
    </div>
  );
}
