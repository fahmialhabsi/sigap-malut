import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { notifyError, notifySuccess, notifyWarning } from "../utils/notify";
import {
  fetchKabupatenMalut,
  fetchKomoditasOptions,
} from "../services/panganMasterDataService";

function toNumberOrUndefined(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function deriveStatusKetersediaan(surplusDefisit, konsumsiEstimasi) {
  if (surplusDefisit === null || surplusDefisit === undefined) return "Aman";
  if (surplusDefisit < 0) {
    if (
      konsumsiEstimasi !== null &&
      konsumsiEstimasi !== undefined &&
      konsumsiEstimasi > 0 &&
      surplusDefisit > konsumsiEstimasi * -0.1
    ) {
      return "Menipis";
    }
    return "Defisit";
  }
  if (
    konsumsiEstimasi !== null &&
    konsumsiEstimasi !== undefined &&
    konsumsiEstimasi > 0 &&
    surplusDefisit >= konsumsiEstimasi * 0.1
  ) {
    return "Surplus";
  }
  return "Aman";
}

function deriveEarlyWarningStatus(statusKetersediaan, validitasData) {
  if (statusKetersediaan === "Defisit") return "Darurat";
  if (statusKetersediaan === "Menipis") return "Siaga";
  if (validitasData === "Perlu Verifikasi") return "Waspada";
  return "Normal";
}

function buildPayload(formData, user, komoditasList, layananMap, computed) {
  const komoditas = komoditasList.find(
    (row) => Number(row.id) === Number(formData.komoditas_id),
  );

  const payload = {
    unit_kerja: "Bidang Ketersediaan",
    layanan_id: layananMap[formData.jenis_pengendalian],
    jenis_pengendalian: formData.jenis_pengendalian,
    komoditas_id: toNumberOrUndefined(formData.komoditas_id),
    nama_komoditas: komoditas?.nama || "",
    periode: formData.periode,
    tahun: Number(formData.tahun),
    bulan: Number(formData.bulan),
    kabupaten: formData.kabupaten,
    kecamatan: formData.kecamatan,
    luas_tanam: toNumberOrUndefined(formData.luas_tanam),
    luas_panen: toNumberOrUndefined(formData.luas_panen),
    produksi_total: toNumberOrUndefined(formData.produksi_total),
    target_produksi: toNumberOrUndefined(formData.target_produksi),
    produktivitas: computed.produktivitas,
    persentase_capaian: computed.persentaseCapaian,
    pasokan_lokal: computed.pasokanLokal,
    pasokan_luar_daerah: toNumberOrUndefined(formData.pasokan_luar_daerah),
    pasokan_impor: toNumberOrUndefined(formData.pasokan_impor),
    stok_awal: toNumberOrUndefined(formData.stok_awal),
    total_pasokan: computed.totalPasokan,
    konsumsi_estimasi: toNumberOrUndefined(formData.konsumsi_estimasi),
    stok_akhir: computed.stokAkhir,
    surplus_defisit: computed.surplusDefisit,
    status_ketersediaan: computed.statusKetersediaan,
    early_warning_status: computed.earlyWarningStatus,
    indikator_early_warning: formData.indikator_early_warning,
    rekomendasi_ews: formData.rekomendasi_ews,
    neraca_pangan_ketersediaan: computed.totalPasokan,
    neraca_pangan_penggunaan: toNumberOrUndefined(formData.konsumsi_estimasi),
    sumber_data: formData.sumber_data,
    metode_pengumpulan: formData.metode_pengumpulan,
    validitas_data: formData.validitas_data,
    analisis: formData.analisis,
    kendala: formData.kendala,
    rekomendasi: formData.rekomendasi,
    penanggung_jawab: formData.penanggung_jawab,
    pelaksana:
      formData.pelaksana || user?.nama_lengkap || "Staff Ketersediaan",
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

export default function BKTPGDCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [komoditasList, setKomoditasList] = useState([]);
  const [kabupatenList, setKabupatenList] = useState([]);
  const [existingRecords, setExistingRecords] = useState([]);

  const layananMap = {
    "Pemantauan Produksi": "LY057",
    "Pemantauan Pasokan": "LY058",
    "Neraca Pangan": "LY059",
    "Early Warning": "LY060",
    "Sistem Informasi": "LY061",
  };

  const [formData, setFormData] = useState({
    komoditas_id: "",
    jenis_pengendalian: "Pemantauan Produksi",
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    kabupaten: "",
    kecamatan: "",
    luas_tanam: "",
    luas_panen: "",
    produksi_total: "",
    target_produksi: "",
    pasokan_luar_daerah: "",
    pasokan_impor: "",
    stok_awal: "",
    konsumsi_estimasi: "",
    sumber_data: "",
    metode_pengumpulan: "Koordinasi Instansi",
    validitas_data: "Valid",
    indikator_early_warning: "",
    rekomendasi_ews: "",
    analisis: "",
    kendala: "",
    rekomendasi: "",
    status: "draft",
    penanggung_jawab: "Kepala Bidang Ketersediaan",
    pelaksana: "",
    keterangan: "",
  });

  useEffect(() => {
    Promise.all([
      fetchKomoditasOptions().catch(() => []),
      fetchKabupatenMalut().catch(() => []),
      api.get("/bkt-pgd").catch(() => ({ data: { data: [] } })),
    ]).then(([komoditas, kabupaten, recordsResponse]) => {
      setKomoditasList(Array.isArray(komoditas) ? komoditas : []);
      setKabupatenList(Array.isArray(kabupaten) ? kabupaten : []);
      setExistingRecords(
        Array.isArray(recordsResponse.data?.data) ? recordsResponse.data.data : [],
      );
    });
  }, []);

  const computed = useMemo(() => {
    const produksiTotal = toNumberOrUndefined(formData.produksi_total);
    const targetProduksi = toNumberOrUndefined(formData.target_produksi);
    const luasPanen = toNumberOrUndefined(formData.luas_panen);
    const stokAwal = toNumberOrUndefined(formData.stok_awal) ?? 0;
    const pasokanLuarDaerah =
      toNumberOrUndefined(formData.pasokan_luar_daerah) ?? 0;
    const pasokanImpor = toNumberOrUndefined(formData.pasokan_impor) ?? 0;
    const konsumsiEstimasi = toNumberOrUndefined(formData.konsumsi_estimasi);

    const produktivitas =
      produksiTotal != null && luasPanen != null && luasPanen > 0
        ? Number((produksiTotal / luasPanen).toFixed(2))
        : null;
    const persentaseCapaian =
      produksiTotal != null && targetProduksi != null && targetProduksi > 0
        ? Number(((produksiTotal / targetProduksi) * 100).toFixed(2))
        : null;
    const pasokanLokal = produksiTotal ?? null;
    const totalPasokan =
      produksiTotal != null ||
      formData.stok_awal !== "" ||
      formData.pasokan_luar_daerah !== "" ||
      formData.pasokan_impor !== ""
        ? Number(
            (
              stokAwal +
              (pasokanLokal ?? 0) +
              pasokanLuarDaerah +
              pasokanImpor
            ).toFixed(2),
          )
        : null;
    const surplusDefisit =
      totalPasokan != null && konsumsiEstimasi != null
        ? Number((totalPasokan - konsumsiEstimasi).toFixed(2))
        : null;
    const stokAkhir = surplusDefisit;
    const statusKetersediaan = deriveStatusKetersediaan(
      surplusDefisit,
      konsumsiEstimasi,
    );
    const earlyWarningStatus = deriveEarlyWarningStatus(
      statusKetersediaan,
      formData.validitas_data,
    );

    return {
      produktivitas,
      persentaseCapaian,
      pasokanLokal,
      totalPasokan,
      surplusDefisit,
      stokAkhir,
      statusKetersediaan,
      earlyWarningStatus,
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

      const duplicate = existingRecords.some((record) => {
        return (
          record.periode === formData.periode &&
          record.jenis_pengendalian === formData.jenis_pengendalian &&
          Number(record.komoditas_id || 0) === Number(formData.komoditas_id || 0) &&
          String(record.kabupaten || "") === String(formData.kabupaten || "")
        );
      });

      if (duplicate) {
        notifyWarning(
          "Data ketersediaan untuk periode, komoditas, dan kabupaten tersebut sudah ada.",
        );
        return;
      }

      const payload = buildPayload(
        formData,
        user,
        komoditasList,
        layananMap,
        computed,
      );

      await api.post("/bkt-pgd", payload);
      notifySuccess("Data ketersediaan dan neraca pangan berhasil disimpan.");
      navigate("/module/bkt-pgd");
    } catch (error) {
      console.error("Submit error:", error);
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
          Input Ketersediaan dan Neraca Pangan
        </h2>
        <p className="text-sm text-gray-500">
          Bidang Ketersediaan dan Kerawanan Pangan
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        Form ini sekarang memusatkan data produksi, pasokan, neraca, dan EWS
        dalam satu record operasional. Data harga dan administrasi lintas bidang
        tidak dibuat otomatis agar tidak membentuk data semu.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Identitas Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Pengendalian <span className="text-red-500">*</span>
              </label>
              <select
                name="jenis_pengendalian"
                value={formData.jenis_pengendalian}
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
                  Bulan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="bulan"
                  min="1"
                  max="12"
                  value={formData.bulan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
                placeholder="Opsional"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Produksi dan Capaian
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Luas Tanam (Ha)
              </label>
              <input
                type="number"
                step="0.01"
                name="luas_tanam"
                value={formData.luas_tanam}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Luas Panen (Ha)
              </label>
              <input
                type="number"
                step="0.01"
                name="luas_panen"
                value={formData.luas_panen}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produksi Total (Ton)
              </label>
              <input
                type="number"
                step="0.01"
                name="produksi_total"
                value={formData.produksi_total}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Produksi (Ton)
              </label>
              <input
                type="number"
                step="0.01"
                name="target_produksi"
                value={formData.target_produksi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Produktivitas Otomatis
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-900">
                {computed.produktivitas == null
                  ? "-"
                  : `${computed.produktivitas} ton/ha`}
              </p>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Capaian Terhadap Target
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-900">
                {computed.persentaseCapaian == null
                  ? "-"
                  : `${computed.persentaseCapaian}%`}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Pasokan, Neraca, dan EWS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stok Awal (Ton)
              </label>
              <input
                type="number"
                step="0.01"
                name="stok_awal"
                value={formData.stok_awal}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasokan Luar Daerah (Ton)
              </label>
              <input
                type="number"
                step="0.01"
                name="pasokan_luar_daerah"
                value={formData.pasokan_luar_daerah}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasokan Impor (Ton)
              </label>
              <input
                type="number"
                step="0.01"
                name="pasokan_impor"
                value={formData.pasokan_impor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konsumsi Estimasi (Ton)
              </label>
              <input
                type="number"
                step="0.01"
                name="konsumsi_estimasi"
                value={formData.konsumsi_estimasi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Total Pasokan
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {computed.totalPasokan == null ? "-" : `${computed.totalPasokan} ton`}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Surplus / Defisit
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {computed.surplusDefisit == null
                  ? "-"
                  : `${computed.surplusDefisit} ton`}
              </p>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Status Ketersediaan
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-900">
                {computed.statusKetersediaan}
              </p>
            </div>

            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Level Early Warning
              </p>
              <p className="mt-2 text-2xl font-bold text-red-900">
                {computed.earlyWarningStatus}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indikator Early Warning
              </label>
              <textarea
                name="indikator_early_warning"
                value={formData.indikator_early_warning}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: stok beras menipis, pasokan antarpulau terlambat, validasi data belum lengkap."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rekomendasi EWS
              </label>
              <textarea
                name="rekomendasi_ews"
                value={formData.rekomendasi_ews}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tindak lanjut cepat berdasarkan kondisi ketersediaan."
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Validasi dan Analisis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sumber Data
              </label>
              <input
                type="text"
                name="sumber_data"
                value={formData.sumber_data}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: BPS, Dinas Pertanian, laporan kabupaten"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pengumpulan
              </label>
              <select
                name="metode_pengumpulan"
                value={formData.metode_pengumpulan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Survey Lapangan">Survey Lapangan</option>
                <option value="Desk Study">Desk Study</option>
                <option value="Koordinasi Instansi">Koordinasi Instansi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validitas Data
              </label>
              <select
                name="validitas_data"
                value={formData.validitas_data}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Valid">Valid</option>
                <option value="Perlu Verifikasi">Perlu Verifikasi</option>
                <option value="Tidak Valid">Tidak Valid</option>
              </select>
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
                Kendala
              </label>
              <textarea
                name="kendala"
                value={formData.kendala}
                onChange={handleChange}
                rows={2}
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
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Penanggung Jawab
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            onClick={() => navigate("/module/bkt-pgd")}
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
