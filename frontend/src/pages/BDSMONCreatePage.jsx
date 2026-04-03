import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { notifyError, notifySuccess, notifyWarning } from "../utils/notify";
import {
  fetchKomoditasOptions,
  fetchPasarStrategisMalut,
} from "../services/panganMasterDataService";

function toNumberOrUndefined(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function deriveStatusStok(stokPasar, stokNormal) {
  if (
    stokPasar === null ||
    stokPasar === undefined ||
    stokNormal === null ||
    stokNormal === undefined ||
    stokNormal <= 0
  ) {
    return "Aman";
  }
  const ratio = stokPasar / stokNormal;
  if (ratio < 0.5) return "Kritis";
  if (ratio < 0.8) return "Menipis";
  if (ratio > 1.2) return "Surplus";
  return "Aman";
}

function buildPayload(formData, user, komoditasList, pasarList, layananMap, computed) {
  const komoditas = komoditasList.find(
    (row) => Number(row.id) === Number(formData.komoditas_id),
  );
  const pasar = pasarList.find(
    (row) => Number(row.id) === Number(formData.pasar_id),
  );

  const payload = {
    unit_kerja: "Bidang Distribusi",
    layanan_id: layananMap[formData.jenis_monitoring],
    jenis_monitoring: formData.jenis_monitoring,
    periode: formData.periode,
    tahun: Number(formData.tahun),
    bulan: Number(formData.bulan),
    komoditas_id: toNumberOrUndefined(formData.komoditas_id),
    nama_komoditas: komoditas?.nama || "",
    wilayah_asal: formData.wilayah_asal,
    wilayah_tujuan: formData.wilayah_tujuan,
    volume_distribusi: toNumberOrUndefined(formData.volume_distribusi),
    satuan: formData.satuan,
    moda_transportasi: formData.moda_transportasi,
    tanggal_distribusi: formData.tanggal_distribusi,
    frekuensi_distribusi: toNumberOrUndefined(formData.frekuensi_distribusi),
    pasar_id: toNumberOrUndefined(formData.pasar_id),
    nama_pasar: pasar?.nama || formData.nama_pasar,
    stok_pasar: toNumberOrUndefined(formData.stok_pasar),
    stok_normal: toNumberOrUndefined(formData.stok_normal),
    status_stok: computed.statusStok,
    jenis_hambatan: formData.jenis_hambatan,
    lokasi_hambatan: formData.lokasi_hambatan,
    deskripsi_hambatan: formData.deskripsi_hambatan,
    dampak_hambatan: formData.dampak_hambatan,
    tingkat_hambatan: formData.tingkat_hambatan,
    solusi_hambatan: formData.solusi_hambatan,
    status_penanganan: formData.status_penanganan,
    jenis_fasilitasi: formData.jenis_fasilitasi,
    penerima_fasilitasi: formData.penerima_fasilitasi,
    tindakan_fasilitasi: formData.tindakan_fasilitasi,
    hasil_fasilitasi: formData.hasil_fasilitasi,
    instansi_koordinasi: formData.instansi_koordinasi,
    topik_koordinasi: formData.topik_koordinasi,
    hasil_koordinasi: formData.hasil_koordinasi,
    tindak_lanjut_koordinasi: formData.tindak_lanjut_koordinasi,
    analisis: formData.analisis,
    rekomendasi: formData.rekomendasi,
    penanggung_jawab: formData.penanggung_jawab,
    pelaksana: formData.pelaksana || user?.nama_lengkap || "Staff Distribusi",
    status: formData.status,
    keterangan: formData.keterangan,
    created_by: user?.id,
  };

  Object.keys(payload).forEach((key) => {
    if (
      payload[key] === "" ||
      payload[key] === null ||
      payload[key] === undefined ||
      Number.isNaN(payload[key])
    ) {
      delete payload[key];
    }
  });

  return payload;
}

export default function BDSMONCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [komoditasList, setKomoditasList] = useState([]);
  const [pasarList, setPasarList] = useState([]);

  const layananMap = {
    "Arus Distribusi": "LY082",
    "Stok Pasar": "LY083",
    "Hambatan Distribusi": "LY084",
    "Fasilitasi Kelancaran": "LY085",
    "Koordinasi Wilayah": "LY086",
  };

  const [formData, setFormData] = useState({
    jenis_monitoring: "Arus Distribusi",
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    komoditas_id: "",
    wilayah_asal: "",
    wilayah_tujuan: "",
    volume_distribusi: "",
    satuan: "kg",
    moda_transportasi: "Laut",
    tanggal_distribusi: new Date().toISOString().split("T")[0],
    frekuensi_distribusi: "",
    pasar_id: "",
    nama_pasar: "",
    stok_pasar: "",
    stok_normal: "",
    jenis_hambatan: "",
    lokasi_hambatan: "",
    deskripsi_hambatan: "",
    dampak_hambatan: "",
    tingkat_hambatan: "Sedang",
    solusi_hambatan: "",
    status_penanganan: "Belum Ditangani",
    jenis_fasilitasi: "",
    penerima_fasilitasi: "",
    tindakan_fasilitasi: "",
    hasil_fasilitasi: "",
    instansi_koordinasi: "",
    topik_koordinasi: "",
    hasil_koordinasi: "",
    tindak_lanjut_koordinasi: "",
    analisis: "",
    rekomendasi: "",
    status: "draft",
    penanggung_jawab: "Kepala Bidang Distribusi",
    pelaksana: "",
    keterangan: "",
  });

  useEffect(() => {
    Promise.all([
      fetchKomoditasOptions().catch(() => []),
      fetchPasarStrategisMalut().catch(() => []),
    ]).then(([komoditas, pasar]) => {
      setKomoditasList(Array.isArray(komoditas) ? komoditas : []);
      setPasarList(Array.isArray(pasar) ? pasar : []);
    });
  }, []);

  const computed = useMemo(() => {
    const stokPasar = toNumberOrUndefined(formData.stok_pasar);
    const stokNormal = toNumberOrUndefined(formData.stok_normal);
    return {
      statusStok: deriveStatusStok(stokPasar, stokNormal),
    };
  }, [formData.stok_normal, formData.stok_pasar]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "pasar_id") {
      const pasar = pasarList.find((row) => Number(row.id) === Number(value));
      setFormData((prev) => ({
        ...prev,
        pasar_id: value,
        nama_pasar: pasar?.nama || "",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.id) {
        notifyWarning("Session expired. Silakan login ulang.");
        navigate("/login");
        return;
      }

      const payload = buildPayload(
        formData,
        user,
        komoditasList,
        pasarList,
        layananMap,
        computed,
      );

      await api.post("/bds-mon", payload);

      notifySuccess("Data monitoring distribusi berhasil disimpan.");
      navigate("/module/bds-mon");
    } catch (error) {
      console.error("Error:", error);
      notifyError(
        "Error: " + (error.response?.data?.error || error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Monitoring Distribusi
        </h2>
        <p className="text-sm text-gray-500">Bidang Distribusi</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Identitas Monitoring
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Monitoring <span className="text-red-500">*</span>
              </label>
              <select
                name="jenis_monitoring"
                value={formData.jenis_monitoring}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {Object.keys(layananMap).map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Komoditas
              </label>
              <select
                name="komoditas_id"
                value={formData.komoditas_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Komoditas</option>
                {komoditasList.map((komoditas) => (
                  <option key={komoditas.id} value={komoditas.id}>
                    {komoditas.nama}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun
                </label>
                <input
                  type="number"
                  name="tahun"
                  value={formData.tahun}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan
                </label>
                <input
                  type="number"
                  name="bulan"
                  min="1"
                  max="12"
                  value={formData.bulan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {formData.jenis_monitoring === "Arus Distribusi" && (
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Arus Distribusi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wilayah Asal
                </label>
                <input
                  type="text"
                  name="wilayah_asal"
                  value={formData.wilayah_asal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wilayah Tujuan
                </label>
                <input
                  type="text"
                  name="wilayah_tujuan"
                  value={formData.wilayah_tujuan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Distribusi
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="volume_distribusi"
                  value={formData.volume_distribusi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan
                  </label>
                  <input
                    type="text"
                    name="satuan"
                    value={formData.satuan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frekuensi
                  </label>
                  <input
                    type="number"
                    name="frekuensi_distribusi"
                    value={formData.frekuensi_distribusi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moda Transportasi
                </label>
                <select
                  name="moda_transportasi"
                  value={formData.moda_transportasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Darat">Darat</option>
                  <option value="Laut">Laut</option>
                  <option value="Udara">Udara</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Distribusi
                </label>
                <input
                  type="date"
                  name="tanggal_distribusi"
                  value={formData.tanggal_distribusi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        )}

        {formData.jenis_monitoring === "Stok Pasar" && (
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Stok Pasar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pasar
                </label>
                <select
                  name="pasar_id"
                  value={formData.pasar_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Pasar</option>
                  {pasarList.map((pasar) => (
                    <option key={pasar.id} value={pasar.id}>
                      {pasar.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Pasar
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="stok_pasar"
                  value={formData.stok_pasar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Normal
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="stok_normal"
                  value={formData.stok_normal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Status Stok
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-900">
                  {computed.statusStok}
                </p>
              </div>
            </div>
          </section>
        )}

        {formData.jenis_monitoring === "Hambatan Distribusi" && (
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Hambatan Distribusi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Hambatan
                </label>
                <select
                  name="jenis_hambatan"
                  value={formData.jenis_hambatan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Cuaca">Cuaca</option>
                  <option value="Administrasi">Administrasi</option>
                  <option value="Keamanan">Keamanan</option>
                  <option value="Biaya">Biaya</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi Hambatan
                </label>
                <input
                  type="text"
                  name="lokasi_hambatan"
                  value={formData.lokasi_hambatan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Hambatan
                </label>
                <select
                  name="tingkat_hambatan"
                  value={formData.tingkat_hambatan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ringan">Ringan</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Berat">Berat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Penanganan
                </label>
                <select
                  name="status_penanganan"
                  value={formData.status_penanganan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Belum Ditangani">Belum Ditangani</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Hambatan
                </label>
                <textarea
                  name="deskripsi_hambatan"
                  value={formData.deskripsi_hambatan}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dampak Hambatan
                </label>
                <textarea
                  name="dampak_hambatan"
                  value={formData.dampak_hambatan}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solusi Hambatan
                </label>
                <textarea
                  name="solusi_hambatan"
                  value={formData.solusi_hambatan}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        )}

        {formData.jenis_monitoring === "Fasilitasi Kelancaran" && (
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Fasilitasi Kelancaran Distribusi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Fasilitasi
                </label>
                <select
                  name="jenis_fasilitasi"
                  value={formData.jenis_fasilitasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="Perizinan">Perizinan</option>
                  <option value="Koordinasi">Koordinasi</option>
                  <option value="Bantuan Logistik">Bantuan Logistik</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penerima Fasilitasi
                </label>
                <input
                  type="text"
                  name="penerima_fasilitasi"
                  value={formData.penerima_fasilitasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tindakan Fasilitasi
                </label>
                <textarea
                  name="tindakan_fasilitasi"
                  value={formData.tindakan_fasilitasi}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasil Fasilitasi
                </label>
                <textarea
                  name="hasil_fasilitasi"
                  value={formData.hasil_fasilitasi}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        )}

        {formData.jenis_monitoring === "Koordinasi Wilayah" && (
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Koordinasi Wilayah
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instansi Koordinasi
                </label>
                <textarea
                  name="instansi_koordinasi"
                  value={formData.instansi_koordinasi}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topik Koordinasi
                </label>
                <textarea
                  name="topik_koordinasi"
                  value={formData.topik_koordinasi}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasil Koordinasi
                </label>
                <textarea
                  name="hasil_koordinasi"
                  value={formData.hasil_koordinasi}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tindak Lanjut Koordinasi
                </label>
                <textarea
                  name="tindak_lanjut_koordinasi"
                  value={formData.tindak_lanjut_koordinasi}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        )}

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Analisis dan Penanggung Jawab
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analisis
              </label>
              <textarea
                name="analisis"
                value={formData.analisis}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rekomendasi
              </label>
              <textarea
                name="rekomendasi"
                value={formData.rekomendasi}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penanggung Jawab
              </label>
              <input
                type="text"
                name="penanggung_jawab"
                value={formData.penanggung_jawab}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
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
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/module/bds-mon")}
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
