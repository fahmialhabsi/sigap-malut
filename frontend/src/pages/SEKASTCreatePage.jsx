import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SEKASTCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Inventarisasi BMD": "LY023",
    "Pengadaan & Penerimaan": "LY024",
    "Penatausahaan Aset": "LY025",
    "Pemeliharaan Aset": "LY026",
    "Pengamanan Aset": "LY027",
    "Penghapusan Aset": "LY028",
    "Laporan Aset": "LY029",
  };

  const [formData, setFormData] = useState({
    unit_kerja: "Sekretariat",
    layanan_label: "Inventarisasi BMD",
    layanan_id: "LY023",
    kode_aset: "",
    nama_aset: "",
    kategori_aset: "Peralatan dan Mesin",
    kondisi: "Baik",
    status_aset: "Aktif",
    lokasi: "",
    ruangan: "",
    tahun_perolehan: "",
    harga_perolehan: "",
    nilai_buku: "",
    penanggung_jawab: "Kasubbag Umum",
    pelaksana: "",
    is_sensitive: "Biasa",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "layanan_label") {
      setFormData({
        ...formData,
        layanan_label: value,
        layanan_id: layananMap[value] || "LY023",
      });
      return;
    }

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

      const payload = {
        unit_kerja: formData.unit_kerja,
        layanan_id: formData.layanan_id,
        kode_aset: formData.kode_aset || null,
        nama_aset: formData.nama_aset,
        kategori_aset: formData.kategori_aset,
        kondisi: formData.kondisi,
        status_aset: formData.status_aset,
        lokasi: formData.lokasi || null,
        ruangan: formData.ruangan || null,
        tahun_perolehan: formData.tahun_perolehan
          ? parseInt(formData.tahun_perolehan, 10)
          : null,
        harga_perolehan: formData.harga_perolehan || null,
        nilai_buku: formData.nilai_buku || null,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Aset",
        is_sensitive: formData.is_sensitive,
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/sek-ast", payload);

      alert("Data aset berhasil dibuat.");
      navigate("/module/sek-ast");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Input Aset & BMD</h2>
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
              Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="layanan_label"
              value={formData.layanan_label}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.keys(layananMap).map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Aset <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_aset"
              value={formData.nama_aset}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Aset <span className="text-red-500">*</span>
            </label>
            <select
              name="kategori_aset"
              value={formData.kategori_aset}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Tanah">Tanah</option>
              <option value="Peralatan dan Mesin">Peralatan dan Mesin</option>
              <option value="Gedung dan Bangunan">Gedung dan Bangunan</option>
              <option value="Jalan Irigasi dan Jaringan">
                Jalan Irigasi dan Jaringan
              </option>
              <option value="Aset Tetap Lainnya">Aset Tetap Lainnya</option>
              <option value="Konstruksi Dalam Pengerjaan">
                Konstruksi Dalam Pengerjaan
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kondisi <span className="text-red-500">*</span>
            </label>
            <select
              name="kondisi"
              value={formData.kondisi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Aset <span className="text-red-500">*</span>
            </label>
            <select
              name="status_aset"
              value={formData.status_aset}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Digunakan">Tidak Digunakan</option>
              <option value="Rusak">Rusak</option>
              <option value="Dalam Perbaikan">Dalam Perbaikan</option>
              <option value="Akan Dihapus">Akan Dihapus</option>
              <option value="Dihapuskan">Dihapuskan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Aset
            </label>
            <input
              type="text"
              name="kode_aset"
              value={formData.kode_aset}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ruangan
            </label>
            <input
              type="text"
              name="ruangan"
              value={formData.ruangan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Perolehan
            </label>
            <input
              type="number"
              name="tahun_perolehan"
              value={formData.tahun_perolehan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Perolehan
            </label>
            <input
              type="number"
              name="harga_perolehan"
              value={formData.harga_perolehan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nilai Buku
            </label>
            <input
              type="number"
              name="nilai_buku"
              value={formData.nilai_buku}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tingkat Sensitivitas <span className="text-red-500">*</span>
            </label>
            <select
              name="is_sensitive"
              value={formData.is_sensitive}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Biasa">Biasa</option>
              <option value="Sensitif">Sensitif</option>
            </select>
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
            onClick={() => navigate("/module/sek-ast")}
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
