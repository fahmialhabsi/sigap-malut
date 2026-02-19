import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SEKRMHCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Perjalanan Dinas": "LY007",
    Kebersihan: "LY030",
    Keamanan: "LY031",
    Fasilitas: "LY032",
    "Ruang Rapat": "LY033",
    Kendaraan: "LY034",
  };

  const [formData, setFormData] = useState({
    layanan_id: "LY007",
    jenis_layanan_rumah_tangga: "Perjalanan Dinas",
    nomor_sppd: "",
    nomor_st: "",
    nama_pegawai: "",
    nip_pegawai: "",
    tujuan: "",
    keperluan: "",
    tanggal_berangkat: "",
    tanggal_kembali: "",
    lama_hari: "",
    area_kebersihan: "",
    pos_keamanan: "",
    jenis_fasilitas: "",
    nama_ruang_rapat: "",
    nomor_polisi: "",
    tanggal_pakai: "",
    penanggung_jawab: "Kasubbag Umum",
    pelaksana: "",
    is_sensitive: "Biasa",
    status: "pending",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "jenis_layanan_rumah_tangga") {
      setFormData({
        ...formData,
        jenis_layanan_rumah_tangga: value,
        layanan_id: layananMap[value] || "LY007",
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
        layanan_id: formData.layanan_id,
        jenis_layanan_rumah_tangga: formData.jenis_layanan_rumah_tangga,
        nomor_sppd: formData.nomor_sppd || null,
        nomor_st: formData.nomor_st || null,
        nama_pegawai: formData.nama_pegawai || null,
        nip_pegawai: formData.nip_pegawai || null,
        tujuan: formData.tujuan || null,
        keperluan: formData.keperluan || null,
        tanggal_berangkat: formData.tanggal_berangkat || null,
        tanggal_kembali: formData.tanggal_kembali || null,
        lama_hari: formData.lama_hari ? parseInt(formData.lama_hari, 10) : null,
        area_kebersihan: formData.area_kebersihan || null,
        pos_keamanan: formData.pos_keamanan || null,
        jenis_fasilitas: formData.jenis_fasilitas || null,
        nama_ruang_rapat: formData.nama_ruang_rapat || null,
        nomor_polisi: formData.nomor_polisi || null,
        tanggal_pakai: formData.tanggal_pakai || null,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Umum",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/sek-rmh", payload);

      alert("Data rumah tangga berhasil dibuat.");
      navigate("/module/sek-rmh");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Rumah Tangga & Umum
        </h2>
        <p className="text-sm text-gray-500">Sekretariat</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_rumah_tangga"
              value={formData.jenis_layanan_rumah_tangga}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Perjalanan Dinas">Perjalanan Dinas</option>
              <option value="Kebersihan">Kebersihan</option>
              <option value="Keamanan">Keamanan</option>
              <option value="Fasilitas">Fasilitas</option>
              <option value="Ruang Rapat">Ruang Rapat</option>
              <option value="Kendaraan">Kendaraan</option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor SPPD
            </label>
            <input
              type="text"
              name="nomor_sppd"
              value={formData.nomor_sppd}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor ST
            </label>
            <input
              type="text"
              name="nomor_st"
              value={formData.nomor_st}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pegawai
            </label>
            <input
              type="text"
              name="nama_pegawai"
              value={formData.nama_pegawai}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIP Pegawai
            </label>
            <input
              type="text"
              name="nip_pegawai"
              value={formData.nip_pegawai}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tujuan
            </label>
            <input
              type="text"
              name="tujuan"
              value={formData.tujuan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keperluan
            </label>
            <input
              type="text"
              name="keperluan"
              value={formData.keperluan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Berangkat
            </label>
            <input
              type="date"
              name="tanggal_berangkat"
              value={formData.tanggal_berangkat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Kembali
            </label>
            <input
              type="date"
              name="tanggal_kembali"
              value={formData.tanggal_kembali}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Kebersihan
            </label>
            <input
              type="text"
              name="area_kebersihan"
              value={formData.area_kebersihan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pos Keamanan
            </label>
            <input
              type="text"
              name="pos_keamanan"
              value={formData.pos_keamanan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Fasilitas
            </label>
            <input
              type="text"
              name="jenis_fasilitas"
              value={formData.jenis_fasilitas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Ruang Rapat
            </label>
            <input
              type="text"
              name="nama_ruang_rapat"
              value={formData.nama_ruang_rapat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Polisi
            </label>
            <input
              type="text"
              name="nomor_polisi"
              value={formData.nomor_polisi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Pakai
            </label>
            <input
              type="date"
              name="tanggal_pakai"
              value={formData.tanggal_pakai}
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
            onClick={() => navigate("/module/sek-rmh")}
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
