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
    tingkat_fluktuasi: "",
    penyebab_fluktuasi: "",
    dampak_fluktuasi: "",
    analisis_harga: "",
    prediksi_harga: "",
    rekomendasi_stabilisasi: "",
    jenis_operasi_pasar: "",
    tanggal_operasi_pasar: "",
    lokasi_operasi_pasar: "",
    komoditas_operasi_pasar: "",
    harga_pasar_normal: "",
    harga_operasi_pasar: "",
    subsidi_per_unit: "",
    volume_operasi_pasar: "",
    jumlah_pembeli: "",
    total_nilai_subsidi: "",
    sumber_anggaran: "",
    tanggal_rapat_tpid: "",
    tempat_rapat_tpid: "",
    peserta_tpid: "",
    agenda_tpid: "",
    hasil_rapat_tpid: "",
    rekomendasi_tpid: "",
    tindak_lanjut_tpid: "",
    inflasi_pangan: "",
    target_inflasi_tpid: "",
    status_inflasi: "",
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

      const toNumber = (value) =>
        value === "" || value === null || value === undefined
          ? undefined
          : parseFloat(value);
      const toInt = (value) =>
        value === "" || value === null || value === undefined
          ? undefined
          : parseInt(value, 10);

      const payload = {
        unit_kerja: "Bidang Distribusi",
        layanan_id: layananMap[formData.jenis_layanan_harga],
        jenis_layanan_harga: formData.jenis_layanan_harga,
        komoditas_id: toInt(formData.komoditas_id),
        nama_komoditas: formData.nama_komoditas,
        nama_pasar: formData.nama_pasar,
        tanggal_pantau: formData.tanggal_pantau,
        periode: formData.periode,
        tahun: toInt(formData.tahun),
        bulan: toInt(formData.bulan),
        harga: toNumber(formData.harga),
        satuan: formData.satuan,
        tren_harga: formData.tren_harga,
        tingkat_fluktuasi: formData.tingkat_fluktuasi,
        penyebab_fluktuasi: formData.penyebab_fluktuasi,
        dampak_fluktuasi: formData.dampak_fluktuasi,
        analisis_harga: formData.analisis_harga,
        prediksi_harga: formData.prediksi_harga,
        rekomendasi_stabilisasi: formData.rekomendasi_stabilisasi,
        jenis_operasi_pasar: formData.jenis_operasi_pasar,
        tanggal_operasi_pasar: formData.tanggal_operasi_pasar,
        lokasi_operasi_pasar: formData.lokasi_operasi_pasar,
        komoditas_operasi_pasar: formData.komoditas_operasi_pasar,
        harga_pasar_normal: toNumber(formData.harga_pasar_normal),
        harga_operasi_pasar: toNumber(formData.harga_operasi_pasar),
        subsidi_per_unit: toNumber(formData.subsidi_per_unit),
        volume_operasi_pasar: toNumber(formData.volume_operasi_pasar),
        jumlah_pembeli: toInt(formData.jumlah_pembeli),
        total_nilai_subsidi: toNumber(formData.total_nilai_subsidi),
        sumber_anggaran: formData.sumber_anggaran,
        tanggal_rapat_tpid: formData.tanggal_rapat_tpid,
        tempat_rapat_tpid: formData.tempat_rapat_tpid,
        peserta_tpid: formData.peserta_tpid,
        agenda_tpid: formData.agenda_tpid,
        hasil_rapat_tpid: formData.hasil_rapat_tpid,
        rekomendasi_tpid: formData.rekomendasi_tpid,
        tindak_lanjut_tpid: formData.tindak_lanjut_tpid,
        inflasi_pangan: toNumber(formData.inflasi_pangan),
        target_inflasi_tpid: toNumber(formData.target_inflasi_tpid),
        status_inflasi: formData.status_inflasi,
        penanggung_jawab: "Kepala Bidang Distribusi",
        pelaksana: user.nama_lengkap || "Pengumpul Data Harga",
        status: "final",
        keterangan: formData.keterangan || "",
        created_by: user.id,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || Number.isNaN(payload[key])) {
          delete payload[key];
        }
      });

      await api.post("/bds-hrg", payload);

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
              <option value="Rekomendasi Stabilisasi">
                Rekomendasi Stabilisasi
              </option>
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

          {formData.jenis_layanan_harga === "Analisis Fluktuasi" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Fluktuasi
                </label>
                <select
                  name="tingkat_fluktuasi"
                  value={formData.tingkat_fluktuasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penyebab Fluktuasi
                </label>
                <textarea
                  name="penyebab_fluktuasi"
                  value={formData.penyebab_fluktuasi}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dampak Fluktuasi
                </label>
                <textarea
                  name="dampak_fluktuasi"
                  value={formData.dampak_fluktuasi}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analisis Harga
                </label>
                <textarea
                  name="analisis_harga"
                  value={formData.analisis_harga}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prediksi Harga
                </label>
                <textarea
                  name="prediksi_harga"
                  value={formData.prediksi_harga}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {formData.jenis_layanan_harga === "Rekomendasi Stabilisasi" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rekomendasi Stabilisasi
              </label>
              <textarea
                name="rekomendasi_stabilisasi"
                value={formData.rekomendasi_stabilisasi}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {formData.jenis_layanan_harga === "Operasi Pasar" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Operasi Pasar
                </label>
                <select
                  name="jenis_operasi_pasar"
                  value={formData.jenis_operasi_pasar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="Pasar Murah">Pasar Murah</option>
                  <option value="Subsidi">Subsidi</option>
                  <option value="Bantuan Langsung">Bantuan Langsung</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Operasi Pasar
                </label>
                <input
                  type="date"
                  name="tanggal_operasi_pasar"
                  value={formData.tanggal_operasi_pasar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi Operasi Pasar
                </label>
                <input
                  type="text"
                  name="lokasi_operasi_pasar"
                  value={formData.lokasi_operasi_pasar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komoditas Operasi Pasar
                </label>
                <textarea
                  name="komoditas_operasi_pasar"
                  value={formData.komoditas_operasi_pasar}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Pasar Normal (Rp)
                </label>
                <input
                  type="number"
                  name="harga_pasar_normal"
                  value={formData.harga_pasar_normal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Operasi Pasar (Rp)
                </label>
                <input
                  type="number"
                  name="harga_operasi_pasar"
                  value={formData.harga_operasi_pasar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subsidi per Unit (Rp)
                </label>
                <input
                  type="number"
                  name="subsidi_per_unit"
                  value={formData.subsidi_per_unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume (Ton)
                </label>
                <input
                  type="number"
                  name="volume_operasi_pasar"
                  value={formData.volume_operasi_pasar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Pembeli
                </label>
                <input
                  type="number"
                  name="jumlah_pembeli"
                  value={formData.jumlah_pembeli}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Nilai Subsidi (Rp)
                </label>
                <input
                  type="number"
                  name="total_nilai_subsidi"
                  value={formData.total_nilai_subsidi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {formData.jenis_layanan_harga === "Koordinasi TPID" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Rapat TPID
                </label>
                <input
                  type="date"
                  name="tanggal_rapat_tpid"
                  value={formData.tanggal_rapat_tpid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempat Rapat
                </label>
                <input
                  type="text"
                  name="tempat_rapat_tpid"
                  value={formData.tempat_rapat_tpid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peserta TPID
                </label>
                <textarea
                  name="peserta_tpid"
                  value={formData.peserta_tpid}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agenda TPID
                </label>
                <textarea
                  name="agenda_tpid"
                  value={formData.agenda_tpid}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasil Rapat TPID
                </label>
                <textarea
                  name="hasil_rapat_tpid"
                  value={formData.hasil_rapat_tpid}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rekomendasi TPID
                </label>
                <textarea
                  name="rekomendasi_tpid"
                  value={formData.rekomendasi_tpid}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tindak Lanjut TPID
                </label>
                <textarea
                  name="tindak_lanjut_tpid"
                  value={formData.tindak_lanjut_tpid}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inflasi Pangan (%)
                </label>
                <input
                  type="number"
                  name="inflasi_pangan"
                  value={formData.inflasi_pangan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target TPID (%)
                </label>
                <input
                  type="number"
                  name="target_inflasi_tpid"
                  value={formData.target_inflasi_tpid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Inflasi
                </label>
                <select
                  name="status_inflasi"
                  value={formData.status_inflasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="On Target">On Target</option>
                  <option value="Warning">Warning</option>
                  <option value="Alert">Alert</option>
                </select>
              </div>
            </>
          )}

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
