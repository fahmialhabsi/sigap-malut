import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { notifyError, notifySuccess, notifyWarning } from "../utils/notify";
import { fetchKabupatenMalut } from "../services/panganMasterDataService";

function toNumberOrUndefined(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function statusFromPrioritas(prioritas) {
  switch (prioritas) {
    case "Prioritas 1":
      return "Sangat Rawan";
    case "Prioritas 2":
    case "Prioritas 3":
      return "Rawan";
    case "Prioritas 4":
      return "Waspada";
    default:
      return "Aman";
  }
}

function buildPayload(formData, user, layananMap, computed) {
  const payload = {
    unit_kerja: "Bidang Ketersediaan",
    layanan_id: layananMap[formData.jenis_kerawanan],
    jenis_kerawanan: formData.jenis_kerawanan,
    periode: formData.periode,
    tahun: Number(formData.tahun),
    kabupaten: formData.kabupaten,
    kecamatan: formData.kecamatan,
    desa: formData.desa,
    latitude: toNumberOrUndefined(formData.latitude),
    longitude: toNumberOrUndefined(formData.longitude),
    tingkat_kerawanan: formData.tingkat_kerawanan,
    skor_kerawanan: computed.skorKerawanan,
    indikator_ketersediaan_pangan: toNumberOrUndefined(
      formData.indikator_ketersediaan_pangan,
    ),
    indikator_akses_pangan: toNumberOrUndefined(formData.indikator_akses_pangan),
    indikator_pemanfaatan_pangan: toNumberOrUndefined(
      formData.indikator_pemanfaatan_pangan,
    ),
    indikator_kerawanan_kesehatan: toNumberOrUndefined(
      formData.indikator_kerawanan_kesehatan,
    ),
    jumlah_penduduk: toNumberOrUndefined(formData.jumlah_penduduk),
    jumlah_kk: toNumberOrUndefined(formData.jumlah_kk),
    jumlah_kk_miskin: toNumberOrUndefined(formData.jumlah_kk_miskin),
    persentase_kemiskinan: computed.persentaseKemiskinan,
    stunting_prevalensi: toNumberOrUndefined(formData.stunting_prevalensi),
    wasting_prevalensi: toNumberOrUndefined(formData.wasting_prevalensi),
    underweight_prevalensi: toNumberOrUndefined(formData.underweight_prevalensi),
    jenis_pangan_rawan: formData.jenis_pangan_rawan,
    stok_pangan: toNumberOrUndefined(formData.stok_pangan),
    tanggal_update_stok: formData.tanggal_update_stok,
    status_ketersediaan: computed.statusKetersediaan,
    penyebab_kerawanan: formData.penyebab_kerawanan,
    dampak_kerawanan: formData.dampak_kerawanan,
    rencana_aksi: formData.rencana_aksi,
    target_intervensi: formData.target_intervensi,
    waktu_pelaksanaan: formData.waktu_pelaksanaan,
    anggaran_kebutuhan: toNumberOrUndefined(formData.anggaran_kebutuhan),
    sumber_anggaran: formData.sumber_anggaran,
    instansi_terkait: formData.instansi_terkait,
    koordinasi_dengan: formData.koordinasi_dengan,
    hasil_koordinasi: formData.hasil_koordinasi,
    tindak_lanjut_koordinasi: formData.tindak_lanjut_koordinasi,
    penanggung_jawab: formData.penanggung_jawab,
    pelaksana: formData.pelaksana || user?.nama_lengkap || "Staff Kerawanan",
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

export default function BKTKRWCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kabupatenList, setKabupatenList] = useState([]);

  const layananMap = {
    Identifikasi: "LY062",
    "Peta Kerawanan": "LY063",
    "Rencana Aksi": "LY064",
    "Koordinasi Lintas Sektor": "LY065",
  };

  const [formData, setFormData] = useState({
    jenis_kerawanan: "Identifikasi",
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    kabupaten: "",
    kecamatan: "",
    desa: "",
    latitude: "",
    longitude: "",
    tingkat_kerawanan: "Prioritas 3",
    indikator_ketersediaan_pangan: "",
    indikator_akses_pangan: "",
    indikator_pemanfaatan_pangan: "",
    indikator_kerawanan_kesehatan: "",
    jumlah_penduduk: "",
    jumlah_kk: "",
    jumlah_kk_miskin: "",
    stunting_prevalensi: "",
    wasting_prevalensi: "",
    underweight_prevalensi: "",
    jenis_pangan_rawan: "",
    stok_pangan: "",
    tanggal_update_stok: new Date().toISOString().split("T")[0],
    penyebab_kerawanan: "",
    dampak_kerawanan: "",
    rencana_aksi: "",
    target_intervensi: "",
    waktu_pelaksanaan: "",
    anggaran_kebutuhan: "",
    sumber_anggaran: "",
    instansi_terkait: "",
    koordinasi_dengan: "",
    hasil_koordinasi: "",
    tindak_lanjut_koordinasi: "",
    status: "draft",
    penanggung_jawab: "Kepala Bidang Ketersediaan",
    pelaksana: "",
    keterangan: "",
  });

  useEffect(() => {
    fetchKabupatenMalut()
      .then((data) => setKabupatenList(Array.isArray(data) ? data : []))
      .catch(() => setKabupatenList([]));
  }, []);

  const computed = useMemo(() => {
    const indikator = [
      toNumberOrUndefined(formData.indikator_ketersediaan_pangan),
      toNumberOrUndefined(formData.indikator_akses_pangan),
      toNumberOrUndefined(formData.indikator_pemanfaatan_pangan),
      toNumberOrUndefined(formData.indikator_kerawanan_kesehatan),
    ].filter((value) => value !== undefined);

    const skorKerawanan =
      indikator.length > 0
        ? Number(
            (
              indikator.reduce((sum, value) => sum + value, 0) /
              indikator.length
            ).toFixed(2),
          )
        : null;
    const jumlahKk = toNumberOrUndefined(formData.jumlah_kk);
    const jumlahKkMiskin = toNumberOrUndefined(formData.jumlah_kk_miskin);
    const persentaseKemiskinan =
      jumlahKk && jumlahKk > 0 && jumlahKkMiskin !== undefined
        ? Number(((jumlahKkMiskin / jumlahKk) * 100).toFixed(2))
        : null;
    const statusKetersediaan = statusFromPrioritas(formData.tingkat_kerawanan);

    return {
      skorKerawanan,
      persentaseKemiskinan,
      statusKetersediaan,
    };
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
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

      const payload = buildPayload(formData, user, layananMap, computed);
      await api.post("/bkt-krw", payload);

      notifySuccess("Data kerawanan pangan berhasil disimpan.");
      navigate("/module/bkt-krw");
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
          Input Kerawanan dan Intervensi Pangan
        </h2>
        <p className="text-sm text-gray-500">
          Bidang Ketersediaan dan Kerawanan Pangan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Lokasi dan Prioritas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kerawanan <span className="text-red-500">*</span>
              </label>
              <select
                name="jenis_kerawanan"
                value={formData.jenis_kerawanan}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kabupaten/Kota <span className="text-red-500">*</span>
              </label>
              <select
                name="kabupaten"
                value={formData.kabupaten}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Kabupaten/Kota</option>
                {kabupatenList.map((kabupaten) => (
                  <option key={kabupaten.id} value={kabupaten.nama}>
                    {kabupaten.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kecamatan
              </label>
              <input
                type="text"
                name="kecamatan"
                value={formData.kecamatan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desa/Kelurahan
              </label>
              <input
                type="text"
                name="desa"
                value={formData.desa}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.00000001"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.00000001"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tingkat Kerawanan <span className="text-red-500">*</span>
              </label>
              <select
                name="tingkat_kerawanan"
                value={formData.tingkat_kerawanan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Prioritas 1">Prioritas 1</option>
                <option value="Prioritas 2">Prioritas 2</option>
                <option value="Prioritas 3">Prioritas 3</option>
                <option value="Prioritas 4">Prioritas 4</option>
                <option value="Prioritas 5">Prioritas 5</option>
                <option value="Prioritas 6">Prioritas 6</option>
              </select>
            </div>

            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Status Wilayah
              </p>
              <p className="mt-2 text-2xl font-bold text-red-900">
                {computed.statusKetersediaan}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Indikator Kerawanan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indikator Ketersediaan Pangan
              </label>
              <input
                type="number"
                step="0.01"
                name="indikator_ketersediaan_pangan"
                value={formData.indikator_ketersediaan_pangan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indikator Akses Pangan
              </label>
              <input
                type="number"
                step="0.01"
                name="indikator_akses_pangan"
                value={formData.indikator_akses_pangan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indikator Pemanfaatan Pangan
              </label>
              <input
                type="number"
                step="0.01"
                name="indikator_pemanfaatan_pangan"
                value={formData.indikator_pemanfaatan_pangan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indikator Kerawanan Kesehatan
              </label>
              <input
                type="number"
                step="0.01"
                name="indikator_kerawanan_kesehatan"
                value={formData.indikator_kerawanan_kesehatan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Skor Kerawanan
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-900">
                {computed.skorKerawanan == null ? "-" : computed.skorKerawanan}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Sosial, Gizi, dan Stok
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Penduduk
              </label>
              <input
                type="number"
                name="jumlah_penduduk"
                value={formData.jumlah_penduduk}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah KK
              </label>
              <input
                type="number"
                name="jumlah_kk"
                value={formData.jumlah_kk}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah KK Miskin
              </label>
              <input
                type="number"
                name="jumlah_kk_miskin"
                value={formData.jumlah_kk_miskin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Persentase Kemiskinan
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {computed.persentaseKemiskinan == null
                  ? "-"
                  : `${computed.persentaseKemiskinan}%`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prevalensi Stunting (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="stunting_prevalensi"
                value={formData.stunting_prevalensi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prevalensi Wasting (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="wasting_prevalensi"
                value={formData.wasting_prevalensi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prevalensi Underweight (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="underweight_prevalensi"
                value={formData.underweight_prevalensi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stok Pangan (Kg/Ton sesuai catatan)
              </label>
              <input
                type="number"
                step="0.01"
                name="stok_pangan"
                value={formData.stok_pangan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Update Stok
              </label>
              <input
                type="date"
                name="tanggal_update_stok"
                value={formData.tanggal_update_stok}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Pangan Rawan
              </label>
              <textarea
                name="jenis_pangan_rawan"
                value={formData.jenis_pangan_rawan}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Penyebab dan Intervensi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penyebab Kerawanan
              </label>
              <textarea
                name="penyebab_kerawanan"
                value={formData.penyebab_kerawanan}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dampak Kerawanan
              </label>
              <textarea
                name="dampak_kerawanan"
                value={formData.dampak_kerawanan}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rencana Aksi
              </label>
              <textarea
                name="rencana_aksi"
                value={formData.rencana_aksi}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Intervensi
              </label>
              <input
                type="text"
                name="target_intervensi"
                value={formData.target_intervensi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu Pelaksanaan
              </label>
              <input
                type="text"
                name="waktu_pelaksanaan"
                value={formData.waktu_pelaksanaan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kebutuhan Anggaran
              </label>
              <input
                type="number"
                step="0.01"
                name="anggaran_kebutuhan"
                value={formData.anggaran_kebutuhan}
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
                placeholder="Jika belum ada, bisa dikosongkan"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Koordinasi dan Status Dokumen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instansi Terkait
              </label>
              <textarea
                name="instansi_terkait"
                value={formData.instansi_terkait}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Koordinasi Dengan
              </label>
              <textarea
                name="koordinasi_dengan"
                value={formData.koordinasi_dengan}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
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
            <div className="md:col-span-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Dokumen
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
                <option value="publish">Publish</option>
              </select>
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
        </section>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/module/bkt-krw")}
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
