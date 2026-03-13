import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function parseIntegerField(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? value : parsed;
}

function parseDecimalField(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? value : parsed;
}

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
    merk_type: "",
    nomor_seri: "",
    cara_perolehan: "",
    kondisi: "Baik",
    status_aset: "Aktif",
    lokasi: "",
    ruangan: "",
    penanggung_jawab_aset: "",
    qr_code: "",
    tahun_perolehan: "",
    tanggal_inventarisasi: "",
    tanggal_pemeliharaan_terakhir: "",
    tanggal_pemeliharaan_berikutnya: "",
    jenis_pemeliharaan: "",
    biaya_pemeliharaan: "",
    alasan_penghapusan: "",
    tanggal_penghapusan: "",
    nomor_sk_penghapusan: "",
    harga_perolehan: "",
    nilai_buku: "",
    file_foto: "",
    file_bast: "",
    file_sk: "",
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

    if (name === "status_aset") {
      setFormData((prev) => {
        const next = { ...prev, status_aset: value };
        const showPenghapusanFields = ["Akan Dihapus", "Dihapuskan"].includes(
          value,
        );

        if (!showPenghapusanFields) {
          next.alasan_penghapusan = "";
          next.tanggal_penghapusan = "";
          next.nomor_sk_penghapusan = "";
        }

        return next;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
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

      const showPenghapusanFields = ["Akan Dihapus", "Dihapuskan"].includes(
        formData.status_aset,
      );

      const payload = {
        unit_kerja: formData.unit_kerja,
        layanan_id: formData.layanan_id,
        kode_aset: formData.kode_aset || null,
        nama_aset: formData.nama_aset,
        kategori_aset: formData.kategori_aset,
        merk_type: formData.merk_type || null,
        nomor_seri: formData.nomor_seri || null,
        cara_perolehan: formData.cara_perolehan || null,
        kondisi: formData.kondisi,
        status_aset: formData.status_aset,
        lokasi: formData.lokasi || null,
        ruangan: formData.ruangan || null,
        penanggung_jawab_aset: formData.penanggung_jawab_aset || null,
        qr_code: formData.qr_code || null,
        tahun_perolehan: parseIntegerField(formData.tahun_perolehan),
        tanggal_inventarisasi: formData.tanggal_inventarisasi || null,
        tanggal_pemeliharaan_terakhir:
          formData.tanggal_pemeliharaan_terakhir || null,
        tanggal_pemeliharaan_berikutnya:
          formData.tanggal_pemeliharaan_berikutnya || null,
        jenis_pemeliharaan: formData.jenis_pemeliharaan || null,
        biaya_pemeliharaan: parseDecimalField(formData.biaya_pemeliharaan),
        alasan_penghapusan: showPenghapusanFields
          ? formData.alasan_penghapusan || null
          : null,
        tanggal_penghapusan: showPenghapusanFields
          ? formData.tanggal_penghapusan || null
          : null,
        nomor_sk_penghapusan: showPenghapusanFields
          ? formData.nomor_sk_penghapusan || null
          : null,
        harga_perolehan: parseDecimalField(formData.harga_perolehan),
        nilai_buku: parseDecimalField(formData.nilai_buku),
        file_foto: formData.file_foto || null,
        file_bast: formData.file_bast || null,
        file_sk: formData.file_sk || null,
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

  const showPenghapusanFields = ["Akan Dihapus", "Dihapuskan"].includes(
    formData.status_aset,
  );

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="Sekretariat">
                Sekretariat
              </option>
              <option style={{ color: "#111827" }} value="Bidang Ketersediaan">
                Bidang Ketersediaan
              </option>
              <option style={{ color: "#111827" }} value="Bidang Distribusi">
                Bidang Distribusi
              </option>
              <option style={{ color: "#111827" }} value="Bidang Konsumsi">
                Bidang Konsumsi
              </option>
              <option style={{ color: "#111827" }} value="UPTD">
                UPTD
              </option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              {Object.keys(layananMap).map((label) => (
                <option style={{ color: "#111827" }} key={label} value={label}>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="Tanah">
                Tanah
              </option>
              <option style={{ color: "#111827" }} value="Peralatan dan Mesin">
                Peralatan dan Mesin
              </option>
              <option style={{ color: "#111827" }} value="Gedung dan Bangunan">
                Gedung dan Bangunan
              </option>
              <option
                style={{ color: "#111827" }}
                value="Jalan Irigasi dan Jaringan"
              >
                Jalan Irigasi dan Jaringan
              </option>
              <option style={{ color: "#111827" }} value="Aset Tetap Lainnya">
                Aset Tetap Lainnya
              </option>
              <option
                style={{ color: "#111827" }}
                value="Konstruksi Dalam Pengerjaan"
              >
                Konstruksi Dalam Pengerjaan
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merk/Tipe
            </label>
            <input
              type="text"
              name="merk_type"
              value={formData.merk_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Seri
            </label>
            <input
              type="text"
              name="nomor_seri"
              value={formData.nomor_seri}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cara Perolehan
            </label>
            <select
              name="cara_perolehan"
              value={formData.cara_perolehan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
            >
              <option style={{ color: "#111827" }} value="">
                Pilih Cara Perolehan
              </option>
              <option style={{ color: "#111827" }} value="Pembelian">
                Pembelian
              </option>
              <option style={{ color: "#111827" }} value="Hibah">
                Hibah
              </option>
              <option style={{ color: "#111827" }} value="Donasi">
                Donasi
              </option>
              <option style={{ color: "#111827" }} value="Transfer">
                Transfer
              </option>
              <option style={{ color: "#111827" }} value="Lainnya">
                Lainnya
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="Baik">
                Baik
              </option>
              <option style={{ color: "#111827" }} value="Rusak Ringan">
                Rusak Ringan
              </option>
              <option style={{ color: "#111827" }} value="Rusak Berat">
                Rusak Berat
              </option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="Aktif">
                Aktif
              </option>
              <option style={{ color: "#111827" }} value="Tidak Digunakan">
                Tidak Digunakan
              </option>
              <option style={{ color: "#111827" }} value="Rusak">
                Rusak
              </option>
              <option style={{ color: "#111827" }} value="Dalam Perbaikan">
                Dalam Perbaikan
              </option>
              <option style={{ color: "#111827" }} value="Akan Dihapus">
                Akan Dihapus
              </option>
              <option style={{ color: "#111827" }} value="Dihapuskan">
                Dihapuskan
              </option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penanggung Jawab Aset
            </label>
            <input
              type="text"
              name="penanggung_jawab_aset"
              value={formData.penanggung_jawab_aset}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code
            </label>
            <input
              type="text"
              name="qr_code"
              value={formData.qr_code}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Inventarisasi
            </label>
            <input
              type="date"
              name="tanggal_inventarisasi"
              value={formData.tanggal_inventarisasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Pemeliharaan Terakhir
            </label>
            <input
              type="date"
              name="tanggal_pemeliharaan_terakhir"
              value={formData.tanggal_pemeliharaan_terakhir}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Pemeliharaan Berikutnya
            </label>
            <input
              type="date"
              name="tanggal_pemeliharaan_berikutnya"
              value={formData.tanggal_pemeliharaan_berikutnya}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Pemeliharaan
            </label>
            <select
              name="jenis_pemeliharaan"
              value={formData.jenis_pemeliharaan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
            >
              <option style={{ color: "#111827" }} value="">
                Pilih Jenis Pemeliharaan
              </option>
              <option style={{ color: "#111827" }} value="Rutin">
                Rutin
              </option>
              <option style={{ color: "#111827" }} value="Berkala">
                Berkala
              </option>
              <option style={{ color: "#111827" }} value="Darurat">
                Darurat
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biaya Pemeliharaan
            </label>
            <input
              type="number"
              name="biaya_pemeliharaan"
              value={formData.biaya_pemeliharaan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          {showPenghapusanFields && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Penghapusan
              </label>
              <textarea
                name="alasan_penghapusan"
                value={formData.alasan_penghapusan}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showPenghapusanFields && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Penghapusan
              </label>
              <input
                type="date"
                name="tanggal_penghapusan"
                value={formData.tanggal_penghapusan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showPenghapusanFields && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor SK Penghapusan
              </label>
              <input
                type="text"
                name="nomor_sk_penghapusan"
                value={formData.nomor_sk_penghapusan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Foto
            </label>
            <input
              type="text"
              name="file_foto"
              value={formData.file_foto}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              placeholder="/uploads/aset-foto.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File BAST
            </label>
            <input
              type="text"
              name="file_bast"
              value={formData.file_bast}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              placeholder="/uploads/bast.pdf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File SK
            </label>
            <input
              type="text"
              name="file_sk"
              value={formData.file_sk}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              placeholder="/uploads/sk-aset.pdf"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pelaksana <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pelaksana"
              value={formData.pelaksana}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="Biasa">
                Biasa
              </option>
              <option style={{ color: "#111827" }} value="Sensitif">
                Sensitif
              </option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
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
