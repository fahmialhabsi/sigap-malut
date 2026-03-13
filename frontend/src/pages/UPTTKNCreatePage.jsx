import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const layananMap = {
  "Pengujian Sampel Pangan Berisiko": "LY132",
  "Hasil Pengujian GMP/GHP/NKV": "LY133",
  "Audit Produk": "LY134",
  "Pelaporan Teknis": "LY135",
};

export default function UPTTKNCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    jenis_layanan_teknis: "Pengujian Sampel Pangan Berisiko",
    nomor_pengujian: "",
    tanggal_pengujian: new Date().toISOString().split("T")[0],
    pemohon: "",
    instansi_pemohon: "",
    jenis_sampel: "",
    jumlah_sampel: "",
    parameter_uji: "",
    metode_uji: "",
    hasil_uji: "",
    kesimpulan_uji: "Memenuhi Syarat",
    rekomendasi_uji: "",
    analis: "",
    verifikator: "",
    tanggal_verifikasi: "",
    jenis_sertifikasi: "",
    nama_usaha: "",
    jenis_usaha: "",
    alamat_usaha: "",
    pemilik_usaha: "",
    tanggal_audit: "",
    tim_auditor: "",
    hasil_audit: "",
    nomor_sertifikat: "",
    status_sertifikat: "",
    tanggal_terbit_sertifikat: "",
    jenis_produk_audit: "Domestik",
    negara_asal: "Indonesia",
    skor_audit: "",
    catatan_audit: "",
    tindakan_korektif: "",
    periode_laporan: "",
    jenis_laporan: "Bulanan",
    total_pengujian: "",
    total_audit: "",
    total_sertifikat: "",
    persentase_kelulusan: "",
    ringkasan_laporan: "",
    penanggung_jawab: "Kepala UPTD",
    pelaksana: "",
    is_sensitive: "Sensitif",
    status: "pending",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        layanan_id: layananMap[formData.jenis_layanan_teknis] || "LY132",
        jenis_layanan_teknis: formData.jenis_layanan_teknis,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Tim Teknis",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || undefined,
      };

      const j = formData.jenis_layanan_teknis;

      if (j === "Pengujian Sampel Pangan Berisiko") {
        Object.assign(payload, {
          nomor_pengujian: formData.nomor_pengujian || undefined,
          tanggal_pengujian: formData.tanggal_pengujian || undefined,
          pemohon: formData.pemohon || undefined,
          instansi_pemohon: formData.instansi_pemohon || undefined,
          jenis_sampel: formData.jenis_sampel || undefined,
          jumlah_sampel: formData.jumlah_sampel
            ? parseInt(formData.jumlah_sampel, 10)
            : undefined,
          parameter_uji: formData.parameter_uji || undefined,
          metode_uji: formData.metode_uji || undefined,
          hasil_uji: formData.hasil_uji || undefined,
          kesimpulan_uji: formData.kesimpulan_uji || undefined,
          rekomendasi_uji: formData.rekomendasi_uji || undefined,
          analis: formData.analis || undefined,
          verifikator: formData.verifikator || undefined,
          tanggal_verifikasi: formData.tanggal_verifikasi || undefined,
        });
      } else if (j === "Hasil Pengujian GMP/GHP/NKV") {
        Object.assign(payload, {
          pemohon: formData.pemohon || undefined,
          instansi_pemohon: formData.instansi_pemohon || undefined,
          tanggal_audit: formData.tanggal_audit || undefined,
          jenis_sertifikasi: formData.jenis_sertifikasi || undefined,
          nama_usaha: formData.nama_usaha || undefined,
          jenis_usaha: formData.jenis_usaha || undefined,
          alamat_usaha: formData.alamat_usaha || undefined,
          pemilik_usaha: formData.pemilik_usaha || undefined,
          tim_auditor: formData.tim_auditor || undefined,
          hasil_audit: formData.hasil_audit || undefined,
          nomor_sertifikat: formData.nomor_sertifikat || undefined,
          status_sertifikat: formData.status_sertifikat || undefined,
          tanggal_terbit_sertifikat:
            formData.tanggal_terbit_sertifikat || undefined,
        });
      } else if (j === "Audit Produk") {
        Object.assign(payload, {
          tanggal_audit: formData.tanggal_audit || undefined,
          jenis_sertifikasi: formData.jenis_sertifikasi || undefined,
          nama_usaha: formData.nama_usaha || undefined,
          tim_auditor: formData.tim_auditor || undefined,
          jenis_produk_audit: formData.jenis_produk_audit || undefined,
          negara_asal: formData.negara_asal || undefined,
          skor_audit: formData.skor_audit
            ? parseFloat(formData.skor_audit)
            : undefined,
          hasil_audit: formData.hasil_audit || undefined,
          catatan_audit: formData.catatan_audit || undefined,
          tindakan_korektif: formData.tindakan_korektif || undefined,
        });
      } else if (j === "Pelaporan Teknis") {
        Object.assign(payload, {
          periode_laporan: formData.periode_laporan || undefined,
          jenis_laporan: formData.jenis_laporan || undefined,
          total_pengujian: formData.total_pengujian
            ? parseInt(formData.total_pengujian, 10)
            : undefined,
          total_audit: formData.total_audit
            ? parseInt(formData.total_audit, 10)
            : undefined,
          total_sertifikat: formData.total_sertifikat
            ? parseInt(formData.total_sertifikat, 10)
            : undefined,
          persentase_kelulusan: formData.persentase_kelulusan
            ? parseFloat(formData.persentase_kelulusan)
            : undefined,
          ringkasan_laporan: formData.ringkasan_laporan || undefined,
        });
      }

      await api.post("/upt-tkn", payload);
      alert("Data Layanan Teknis UPTD berhasil dibuat.");
      navigate("/module/upt-tkn");
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const j = formData.jenis_layanan_teknis;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Layanan Teknis UPTD
        </h2>
        <p className="text-sm text-gray-500">
          UPTD Balai Pengawasan Mutu dan Keamanan Pangan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan Teknis <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_teknis"
              value={formData.jenis_layanan_teknis}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            >
              <option value="Pengujian Sampel Pangan Berisiko">
                Pengujian Sampel Pangan Berisiko
              </option>
              <option value="Hasil Pengujian GMP/GHP/NKV">
                Hasil Pengujian GMP/GHP/NKV
              </option>
              <option value="Audit Produk">Audit Produk</option>
              <option value="Pelaporan Teknis">Pelaporan Teknis</option>
            </select>
          </div>

          {/* Pengujian Sampel fields */}
          {j === "Pengujian Sampel Pangan Berisiko" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Pengujian
                </label>
                <input
                  type="text"
                  name="nomor_pengujian"
                  value={formData.nomor_pengujian}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pengujian
                </label>
                <input
                  type="date"
                  name="tanggal_pengujian"
                  value={formData.tanggal_pengujian}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pemohon
                </label>
                <input
                  type="text"
                  name="pemohon"
                  value={formData.pemohon}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instansi Pemohon
                </label>
                <input
                  type="text"
                  name="instansi_pemohon"
                  value={formData.instansi_pemohon}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Sampel
                </label>
                <input
                  type="text"
                  name="jenis_sampel"
                  value={formData.jenis_sampel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Sampel
                </label>
                <input
                  type="number"
                  name="jumlah_sampel"
                  value={formData.jumlah_sampel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parameter Uji
                </label>
                <textarea
                  name="parameter_uji"
                  value={formData.parameter_uji}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Uji
                </label>
                <input
                  type="text"
                  name="metode_uji"
                  value={formData.metode_uji}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kesimpulan Uji
                </label>
                <select
                  name="kesimpulan_uji"
                  value={formData.kesimpulan_uji}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                >
                  <option value="Memenuhi Syarat">Memenuhi Syarat</option>
                  <option value="Tidak Memenuhi Syarat">
                    Tidak Memenuhi Syarat
                  </option>
                  <option value="Perlu Uji Lanjutan">Perlu Uji Lanjutan</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasil Uji
                </label>
                <textarea
                  name="hasil_uji"
                  value={formData.hasil_uji}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analis
                </label>
                <input
                  type="text"
                  name="analis"
                  value={formData.analis}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verifikator
                </label>
                <input
                  type="text"
                  name="verifikator"
                  value={formData.verifikator}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* GMP/GHP/NKV fields */}
          {j === "Hasil Pengujian GMP/GHP/NKV" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Usaha
                </label>
                <input
                  type="text"
                  name="nama_usaha"
                  value={formData.nama_usaha}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pemilik Usaha
                </label>
                <input
                  type="text"
                  name="pemilik_usaha"
                  value={formData.pemilik_usaha}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Sertifikasi
                </label>
                <select
                  name="jenis_sertifikasi"
                  value={formData.jenis_sertifikasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                >
                  <option value="">Pilih Sertifikasi</option>
                  <option value="GMP">GMP</option>
                  <option value="GHP">GHP</option>
                  <option value="NKV">NKV</option>
                  <option value="Prima 1">Prima 1</option>
                  <option value="Prima 2">Prima 2</option>
                  <option value="Prima 3">Prima 3</option>
                  <option value="GFP">GFP</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Audit
                </label>
                <input
                  type="date"
                  name="tanggal_audit"
                  value={formData.tanggal_audit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasil Audit
                </label>
                <select
                  name="hasil_audit"
                  value={formData.hasil_audit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                >
                  <option value="">Pilih Hasil</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Tidak Lulus">Tidak Lulus</option>
                  <option value="Lulus Bersyarat">Lulus Bersyarat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Sertifikat
                </label>
                <input
                  type="text"
                  name="nomor_sertifikat"
                  value={formData.nomor_sertifikat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Sertifikat
                </label>
                <select
                  name="status_sertifikat"
                  value={formData.status_sertifikat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                >
                  <option value="">Pilih Status</option>
                  <option value="Proses">Proses</option>
                  <option value="Diterbitkan">Diterbitkan</option>
                  <option value="Ditolak">Ditolak</option>
                  <option value="Dicabut">Dicabut</option>
                </select>
              </div>
            </>
          )}

          {/* Audit Produk fields */}
          {j === "Audit Produk" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Usaha
                </label>
                <input
                  type="text"
                  name="nama_usaha"
                  value={formData.nama_usaha}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Produk Audit
                </label>
                <select
                  name="jenis_produk_audit"
                  value={formData.jenis_produk_audit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                >
                  <option value="Domestik">Domestik</option>
                  <option value="Impor">Impor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Negara Asal
                </label>
                <input
                  type="text"
                  name="negara_asal"
                  value={formData.negara_asal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Audit
                </label>
                <input
                  type="date"
                  name="tanggal_audit"
                  value={formData.tanggal_audit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Sertifikasi
                </label>
                <select
                  name="jenis_sertifikasi"
                  value={formData.jenis_sertifikasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="GMP">GMP</option>
                  <option value="GHP">GHP</option>
                  <option value="NKV">NKV</option>
                  <option value="Prima 1">Prima 1</option>
                  <option value="Prima 2">Prima 2</option>
                  <option value="Prima 3">Prima 3</option>
                  <option value="GFP">GFP</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skor Audit
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="skor_audit"
                  value={formData.skor_audit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasil Audit
                </label>
                <select
                  name="hasil_audit"
                  value={formData.hasil_audit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                >
                  <option value="">Pilih Hasil</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Tidak Lulus">Tidak Lulus</option>
                  <option value="Lulus Bersyarat">Lulus Bersyarat</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tindakan Korektif
                </label>
                <textarea
                  name="tindakan_korektif"
                  value={formData.tindakan_korektif}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Pelaporan Teknis fields */}
          {j === "Pelaporan Teknis" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periode Laporan
                </label>
                <input
                  type="date"
                  name="periode_laporan"
                  value={formData.periode_laporan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Laporan
                </label>
                <select
                  name="jenis_laporan"
                  value={formData.jenis_laporan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                >
                  <option value="Bulanan">Bulanan</option>
                  <option value="Triwulanan">Triwulanan</option>
                  <option value="Semesteran">Semesteran</option>
                  <option value="Tahunan">Tahunan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Pengujian
                </label>
                <input
                  type="number"
                  name="total_pengujian"
                  value={formData.total_pengujian}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Audit
                </label>
                <input
                  type="number"
                  name="total_audit"
                  value={formData.total_audit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Sertifikat
                </label>
                <input
                  type="number"
                  name="total_sertifikat"
                  value={formData.total_sertifikat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persentase Kelulusan (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="persentase_kelulusan"
                  value={formData.persentase_kelulusan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ringkasan Laporan
                </label>
                <textarea
                  name="ringkasan_laporan"
                  value={formData.ringkasan_laporan}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Common fields */}
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
              Sensitivitas Data
            </label>
            <select
              name="is_sensitive"
              value={formData.is_sensitive}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="Sensitif">Sensitif</option>
              <option value="Biasa">Biasa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
              <option value="verifikasi">Verifikasi</option>
              <option value="approved">Approved</option>
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
              rows={2}
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
            onClick={() => navigate("/module/upt-tkn")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
