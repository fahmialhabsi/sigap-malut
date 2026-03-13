import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const layananMap = {
  "Penjaminan Mutu": "LY161",
  "Verifikasi Kepatuhan": "LY162",
  "Pengendalian Mutu": "LY163",
  "Pengelolaan Temuan": "LY164",
  "Penyusunan SOP": "LY165",
  "Review SOP": "LY166",
  "Standar Layanan": "LY167",
  Sosialisasi: "LY168",
  "Pelatihan Auditor": "LY169",
  "Sertifikasi Auditor": "LY170",
  "Evaluasi Auditor": "LY171",
  "Database Auditor": "LY172",
  "Supervisi Audit": "LY173",
  "Evaluasi Sertifikasi": "LY174",
  "Rekomendasi Mutu": "LY175",
  "Laporan Mutu": "LY176",
};

export default function UPTMTUCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    jenis_layanan_mutu: "Penjaminan Mutu",
    layanan_id: "LY161",
    nomor_dokumen_mutu: "",
    judul_dokumen: "",
    tanggal_dokumen: new Date().toISOString().split("T")[0],
    versi: "1.0",
    status_dokumen: "Draft",
    objek_verifikasi: "",
    hasil_verifikasi: "",
    jenis_audit_mutu: "Audit Internal",
    tanggal_audit_mutu: "",
    hasil_audit_mutu: "",
    periode_laporan_mutu: "",
    ringkasan_laporan_mutu: "",
    penanggung_jawab: "Kasi Manajemen Mutu",
    pelaksana: "",
    is_sensitive: "Sensitif",
    status: "draft",
    keterangan: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "jenis_layanan_mutu") {
        next.layanan_id = layananMap[value] || prev.layanan_id || "LY161";
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/upt-mtu", {
        layanan_id:
          layananMap[formData.jenis_layanan_mutu] ||
          formData.layanan_id ||
          "LY161",
        jenis_layanan_mutu: formData.jenis_layanan_mutu,
        nomor_dokumen_mutu: formData.nomor_dokumen_mutu || undefined,
        judul_dokumen: formData.judul_dokumen || undefined,
        tanggal_dokumen: formData.tanggal_dokumen || undefined,
        versi: formData.versi || undefined,
        status_dokumen: formData.status_dokumen || undefined,
        objek_verifikasi: formData.objek_verifikasi || undefined,
        hasil_verifikasi: formData.hasil_verifikasi || undefined,
        jenis_audit_mutu: formData.jenis_audit_mutu || undefined,
        tanggal_audit_mutu: formData.tanggal_audit_mutu || undefined,
        hasil_audit_mutu: formData.hasil_audit_mutu || undefined,
        periode_laporan_mutu: formData.periode_laporan_mutu || undefined,
        ringkasan_laporan_mutu: formData.ringkasan_laporan_mutu || undefined,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || "Staff Manajemen Mutu",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || undefined,
      });

      alert("Data Manajemen Mutu UPTD berhasil dibuat.");
      navigate("/module/upt-mtu");
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
          Input Manajemen Mutu & SOP
        </h2>
        <p className="text-sm text-gray-500">
          UPTD Balai Pengawasan Mutu dan Keamanan Pangan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan Mutu <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_mutu"
              value={formData.jenis_layanan_mutu}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              {Object.keys(layananMap).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layanan ID
            </label>
            <input
              type="text"
              name="layanan_id"
              value={formData.layanan_id}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Dokumen Mutu
            </label>
            <input
              type="text"
              name="nomor_dokumen_mutu"
              value={formData.nomor_dokumen_mutu}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Dokumen
            </label>
            <input
              type="text"
              name="judul_dokumen"
              value={formData.judul_dokumen}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Dokumen
            </label>
            <input
              type="date"
              name="tanggal_dokumen"
              value={formData.tanggal_dokumen}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Dokumen
            </label>
            <select
              name="status_dokumen"
              value={formData.status_dokumen}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Review">Review</option>
              <option value="Approved">Approved</option>
              <option value="Active">Active</option>
              <option value="Obsolete">Obsolete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objek Verifikasi
            </label>
            <input
              type="text"
              name="objek_verifikasi"
              value={formData.objek_verifikasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasil Verifikasi
            </label>
            <select
              name="hasil_verifikasi"
              value={formData.hasil_verifikasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="">Pilih Hasil</option>
              <option value="Sesuai">Sesuai</option>
              <option value="Tidak Sesuai">Tidak Sesuai</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Audit Mutu
            </label>
            <select
              name="jenis_audit_mutu"
              value={formData.jenis_audit_mutu}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="Audit Internal">Audit Internal</option>
              <option value="Audit Eksternal">Audit Eksternal</option>
              <option value="Surveillance">Surveillance</option>
              <option value="Witnessing">Witnessing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Audit Mutu
            </label>
            <input
              type="date"
              name="tanggal_audit_mutu"
              value={formData.tanggal_audit_mutu}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasil Audit Mutu
            </label>
            <textarea
              name="hasil_audit_mutu"
              value={formData.hasil_audit_mutu}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode Laporan Mutu
            </label>
            <input
              type="date"
              name="periode_laporan_mutu"
              value={formData.periode_laporan_mutu}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ringkasan Laporan Mutu
            </label>
            <textarea
              name="ringkasan_laporan_mutu"
              value={formData.ringkasan_laporan_mutu}
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
              <option value="approved">Approved</option>
              <option value="active">Active</option>
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
            onClick={() => navigate("/module/upt-mtu")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
