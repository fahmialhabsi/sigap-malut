import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function BKTBMBCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    Bimtek: "LY067",
    Pemetaan: "LY068",
    Supervisi: "LY069",
    Pendampingan: "LY070",
    Konsultasi: "LY071",
  };

  const [formData, setFormData] = useState({
    jenis_bimbingan: "Bimtek",
    nama_kegiatan: "",
    tanggal_kegiatan: new Date().toISOString().split("T")[0],
    waktu_mulai: "",
    waktu_selesai: "",
    tempat: "",
    kabupaten: "",
    sasaran_peserta: "",
    jumlah_peserta: "",
    narasumber: "",
    fasilitator: "",
    materi_bimbingan: "",
    metode_pelaksanaan: "Tatap Muka",
    topik_pemetaan: "",
    hasil_pemetaan: "",
    area_supervisi: "",
    temuan_supervisi: "",
    rekomendasi_supervisi: "",
    topik_konsultasi: "",
    pemohon_konsultasi: "",
    jawaban_konsultasi: "",
    durasi_pendampingan: "",
    frekuensi_pendampingan: "",
    output_kegiatan: "",
    outcome_kegiatan: "",
    evaluasi_kegiatan: "",
    tindak_lanjut: "",
    biaya_kegiatan: "",
    sumber_anggaran: "",
    penanggung_jawab: "Kepala Bidang Ketersediaan",
    pelaksana: "",
    is_sensitive: "Biasa",
    status: "perencanaan",
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
        layanan_id: layananMap[formData.jenis_bimbingan] || "LY067",
        jenis_bimbingan: formData.jenis_bimbingan,
        nama_kegiatan: formData.nama_kegiatan,
        tanggal_kegiatan: formData.tanggal_kegiatan,
        waktu_mulai: formData.waktu_mulai || null,
        waktu_selesai: formData.waktu_selesai || null,
        tempat: formData.tempat || null,
        kabupaten: formData.kabupaten || null,
        sasaran_peserta: formData.sasaran_peserta || null,
        jumlah_peserta: formData.jumlah_peserta
          ? Number.parseInt(formData.jumlah_peserta, 10)
          : null,
        narasumber: formData.narasumber || null,
        fasilitator: formData.fasilitator || null,
        materi_bimbingan: formData.materi_bimbingan || null,
        metode_pelaksanaan: formData.metode_pelaksanaan || null,
        topik_pemetaan: formData.topik_pemetaan || null,
        hasil_pemetaan: formData.hasil_pemetaan || null,
        area_supervisi: formData.area_supervisi || null,
        temuan_supervisi: formData.temuan_supervisi || null,
        rekomendasi_supervisi: formData.rekomendasi_supervisi || null,
        topik_konsultasi: formData.topik_konsultasi || null,
        pemohon_konsultasi: formData.pemohon_konsultasi || null,
        jawaban_konsultasi: formData.jawaban_konsultasi || null,
        durasi_pendampingan: formData.durasi_pendampingan || null,
        frekuensi_pendampingan: formData.frekuensi_pendampingan
          ? Number.parseInt(formData.frekuensi_pendampingan, 10)
          : null,
        output_kegiatan: formData.output_kegiatan || null,
        outcome_kegiatan: formData.outcome_kegiatan || null,
        evaluasi_kegiatan: formData.evaluasi_kegiatan || null,
        tindak_lanjut: formData.tindak_lanjut || null,
        biaya_kegiatan: formData.biaya_kegiatan
          ? Number.parseFloat(formData.biaya_kegiatan)
          : null,
        sumber_anggaran: formData.sumber_anggaran || null,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Bimtek",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/bkt-bmb", payload);

      alert("Data bimbingan dan pendampingan berhasil dibuat.");
      navigate("/module/bkt-bmb");
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
          Input Bimbingan dan Pendampingan
        </h2>
        <p className="text-sm text-gray-500">Bidang Ketersediaan</p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option value="Bimtek" style={{ color: "#111827" }}>
                Bimtek
              </option>
              <option value="Supervisi" style={{ color: "#111827" }}>
                Supervisi
              </option>
              <option value="Pemetaan" style={{ color: "#111827" }}>
                Pemetaan
              </option>
              <option value="Pendampingan" style={{ color: "#111827" }}>
                Pendampingan
              </option>
              <option value="Konsultasi" style={{ color: "#111827" }}>
                Konsultasi
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
              required
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
            >
              <option value="Tatap Muka" style={{ color: "#111827" }}>
                Tatap Muka
              </option>
              <option value="Online" style={{ color: "#111827" }}>
                Online
              </option>
              <option value="Hybrid" style={{ color: "#111827" }}>
                Hybrid
              </option>
              <option value="Kunjungan Lapangan" style={{ color: "#111827" }}>
                Kunjungan Lapangan
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Mulai
            </label>
            <input
              type="time"
              name="waktu_mulai"
              value={formData.waktu_mulai}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Selesai
            </label>
            <input
              type="time"
              name="waktu_selesai"
              value={formData.waktu_selesai}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kabupaten
            </label>
            <input
              type="text"
              name="kabupaten"
              value={formData.kabupaten}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sasaran Peserta
            </label>
            <input
              type="text"
              name="sasaran_peserta"
              value={formData.sasaran_peserta}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Narasumber
            </label>
            <input
              type="text"
              name="narasumber"
              value={formData.narasumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fasilitator
            </label>
            <input
              type="text"
              name="fasilitator"
              value={formData.fasilitator}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topik Pemetaan
            </label>
            <input
              type="text"
              name="topik_pemetaan"
              value={formData.topik_pemetaan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Supervisi
            </label>
            <input
              type="text"
              name="area_supervisi"
              value={formData.area_supervisi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topik Konsultasi
            </label>
            <input
              type="text"
              name="topik_konsultasi"
              value={formData.topik_konsultasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durasi Pendampingan
            </label>
            <input
              type="text"
              name="durasi_pendampingan"
              value={formData.durasi_pendampingan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frekuensi Pendampingan
            </label>
            <input
              type="number"
              name="frekuensi_pendampingan"
              value={formData.frekuensi_pendampingan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biaya Kegiatan
            </label>
            <input
              type="number"
              step="0.01"
              name="biaya_kegiatan"
              value={formData.biaya_kegiatan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sumber Anggaran
            </label>
            <input
              type="text"
              name="sumber_anggaran"
              value={formData.sumber_anggaran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Kegiatan
            </label>
            <textarea
              name="output_kegiatan"
              value={formData.output_kegiatan}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outcome Kegiatan
            </label>
            <textarea
              name="outcome_kegiatan"
              value={formData.outcome_kegiatan}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evaluasi Kegiatan
            </label>
            <textarea
              name="evaluasi_kegiatan"
              value={formData.evaluasi_kegiatan}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tindak Lanjut
            </label>
            <textarea
              name="tindak_lanjut"
              value={formData.tindak_lanjut}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option value="Biasa" style={{ color: "#111827" }}>
                Biasa
              </option>
              <option value="Sensitif" style={{ color: "#111827" }}>
                Sensitif
              </option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500 bg-white"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900  focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/bkt-bmb")}
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
