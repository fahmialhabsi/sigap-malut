import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SEKRENCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    Renstra: "LY040",
    Renja: "LY041",
    "Fasilitasi Program": "LY042",
    Sinkronisasi: "LY043",
    "LKJIP/LAKIP": "LY044",
    "Laporan Kinerja": "LY045",
  };

  const [formData, setFormData] = useState({
    layanan_id: "LY040",
    jenis_layanan_perencanaan: "Renstra",
    tahun_perencanaan: new Date().getFullYear(),
    periode_renstra: "",
    nama_program: "",
    nama_kegiatan: "",
    indikator_kinerja: "",
    target_kinerja: "",
    pagu_anggaran: "",
    status_sinkronisasi: "Belum",
    penanggung_jawab: "Fungsional Perencana",
    pelaksana: "",
    is_sensitive: "Sensitif",
    status: "draft",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "jenis_layanan_perencanaan") {
      setFormData({
        ...formData,
        jenis_layanan_perencanaan: value,
        layanan_id: layananMap[value] || "LY040",
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
        jenis_layanan_perencanaan: formData.jenis_layanan_perencanaan,
        tahun_perencanaan: parseInt(formData.tahun_perencanaan, 10),
        periode_renstra: formData.periode_renstra || null,
        nama_program: formData.nama_program || null,
        nama_kegiatan: formData.nama_kegiatan || null,
        indikator_kinerja: formData.indikator_kinerja || null,
        target_kinerja: formData.target_kinerja || null,
        pagu_anggaran: formData.pagu_anggaran || null,
        status_sinkronisasi: formData.status_sinkronisasi || null,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana:
          formData.pelaksana || user.nama_lengkap || "Staff Perencanaan",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/sek-ren", payload);

      alert("Data perencanaan berhasil dibuat.");
      navigate("/module/sek-ren");
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
          Input Perencanaan & Evaluasi
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
              name="jenis_layanan_perencanaan"
              value={formData.jenis_layanan_perencanaan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Renstra">Renstra</option>
              <option value="Renja">Renja</option>
              <option value="Fasilitasi Program">Fasilitasi Program</option>
              <option value="Sinkronisasi">Sinkronisasi</option>
              <option value="LKJIP/LAKIP">LKJIP/LAKIP</option>
              <option value="Laporan Kinerja">Laporan Kinerja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Perencanaan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="tahun_perencanaan"
              value={formData.tahun_perencanaan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode Renstra
            </label>
            <input
              type="text"
              name="periode_renstra"
              value={formData.periode_renstra}
              onChange={handleChange}
              placeholder="Contoh: 2024-2029"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Program
            </label>
            <input
              type="text"
              name="nama_program"
              value={formData.nama_program}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Kegiatan
            </label>
            <input
              type="text"
              name="nama_kegiatan"
              value={formData.nama_kegiatan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indikator Kinerja
            </label>
            <input
              type="text"
              name="indikator_kinerja"
              value={formData.indikator_kinerja}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Kinerja
            </label>
            <input
              type="text"
              name="target_kinerja"
              value={formData.target_kinerja}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pagu Anggaran
            </label>
            <input
              type="number"
              name="pagu_anggaran"
              value={formData.pagu_anggaran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Sinkronisasi
            </label>
            <select
              name="status_sinkronisasi"
              value={formData.status_sinkronisasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Belum">Belum</option>
              <option value="Proses">Proses</option>
              <option value="Sesuai">Sesuai</option>
              <option value="Tidak Sesuai">Tidak Sesuai</option>
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
              <option value="draft">Draft</option>
              <option value="finalisasi">Finalisasi</option>
              <option value="disetujui">Disetujui</option>
              <option value="final">Final</option>
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
            onClick={() => navigate("/module/sek-ren")}
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
