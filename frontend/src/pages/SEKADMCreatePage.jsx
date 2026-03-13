import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SEKADMCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    layanan_id: "LY001",
    nomor_surat: "",
    jenis_naskah: "Surat Masuk",
    tanggal_surat: new Date().toISOString().split("T")[0],
    pengirim_penerima: "",
    perihal: "",
    penanggung_jawab: "Kasubbag Umum",
    pelaksana: "",
    status: "pending",
    keterangan: "",
  });

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
        unit_kerja: "Sekretariat",
        layanan_id: formData.layanan_id,
        nomor_surat: formData.nomor_surat || null,
        jenis_naskah: formData.jenis_naskah,
        tanggal_surat: formData.tanggal_surat,
        pengirim_penerima: formData.pengirim_penerima || null,
        perihal: formData.perihal,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana:
          formData.pelaksana || user.nama_lengkap || "Staff Administrasi",
        status: formData.status,
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/sek-adm", payload);

      alert("✅ Surat administrasi berhasil dibuat!");
      navigate("/module/sek-adm");
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
          Input Administrasi Umum
        </h2>
        <p className="text-sm text-gray-500">Sekretariat</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="layanan_id"
              value={formData.layanan_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option value="LY001" style={{ color: "#111827" }}>
                Administrasi Umum
              </option>
              <option value="LY002" style={{ color: "#111827" }}>
                Tata Naskah Dinas
              </option>
              <option value="LY003" style={{ color: "#111827" }}>
                Kearsipan Dinamis & Statis
              </option>
              <option value="LY004" style={{ color: "#111827" }}>
                Agenda & Disposisi Pimpinan
              </option>
              <option value="LY005" style={{ color: "#111827" }}>
                Administrasi Rapat
              </option>
              <option value="LY006" style={{ color: "#111827" }}>
                Dokumentasi Administrasi
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Surat
            </label>
            <input
              type="text"
              name="nomor_surat"
              value={formData.nomor_surat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Naskah <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_naskah"
              value={formData.jenis_naskah}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option value="Surat Masuk" style={{ color: "#111827" }}>
                Surat Masuk
              </option>
              <option value="Surat Keluar" style={{ color: "#111827" }}>
                Surat Keluar
              </option>
              <option value="SK" style={{ color: "#111827" }}>
                SK
              </option>
              <option value="SE" style={{ color: "#111827" }}>
                SE
              </option>
              <option value="ST" style={{ color: "#111827" }}>
                ST
              </option>
              <option value="SU" style={{ color: "#111827" }}>
                SU
              </option>
              <option value="ND" style={{ color: "#111827" }}>
                ND
              </option>
              <option value="MEMO" style={{ color: "#111827" }}>
                MEMO
              </option>
              <option value="BA" style={{ color: "#111827" }}>
                BA
              </option>
              <option value="Nota Dinas" style={{ color: "#111827" }}>
                Nota Dinas
              </option>
              <option value="Laporan" style={{ color: "#111827" }}>
                Laporan
              </option>
              <option value="Lainnya" style={{ color: "#111827" }}>
                Lainnya
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Surat <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_surat"
              value={formData.tanggal_surat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pengirim/Penerima
            </label>
            <input
              type="text"
              name="pengirim_penerima"
              value={formData.pengirim_penerima}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option value="pending" style={{ color: "#111827" }}>
                Pending
              </option>
              <option value="proses" style={{ color: "#111827" }}>
                Proses
              </option>
              <option value="selesai" style={{ color: "#111827" }}>
                Selesai
              </option>
              <option value="arsip" style={{ color: "#111827" }}>
                Arsip
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perihal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="perihal"
              value={formData.perihal}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
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
            onClick={() => navigate("/module/sek-adm")}
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
