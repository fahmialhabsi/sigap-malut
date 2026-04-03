import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { notifyError, notifyWarning } from "../utils/notify";
import { fetchKomoditasOptions } from "../services/panganMasterDataService";

function toNumberOrUndefined(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildPayload(formData, user, komoditasList, layananMap) {
  const komoditas = komoditasList.find(
    (row) => Number(row.id) === Number(formData.komoditas_id),
  );

  const payload = {
    unit_kerja: "Bidang Distribusi",
    layanan_id: layananMap[formData.jenis_layanan_cppd],
    jenis_layanan_cppd: formData.jenis_layanan_cppd,
    periode: formData.periode,
    tahun: Number(formData.tahun),
    bulan: toNumberOrUndefined(formData.bulan),
    komoditas_id: toNumberOrUndefined(formData.komoditas_id),
    nama_komoditas: komoditas?.nama || "",
    kebutuhan_cppd: toNumberOrUndefined(formData.kebutuhan_cppd),
    dasar_perhitungan: formData.dasar_perhitungan,
    target_stok: toNumberOrUndefined(formData.target_stok),
    lokasi_penyimpanan: formData.lokasi_penyimpanan,
    kapasitas_gudang: toNumberOrUndefined(formData.kapasitas_gudang),
    stok_awal_bulan: toNumberOrUndefined(formData.stok_awal_bulan),
    penerimaan_bulan_ini: toNumberOrUndefined(formData.penerimaan_bulan_ini),
    penyaluran_bulan_ini: toNumberOrUndefined(formData.penyaluran_bulan_ini),
    sumber_pengadaan: formData.sumber_pengadaan,
    metode_pengadaan: formData.metode_pengadaan,
    penyedia: formData.penyedia,
    tanggal_pengadaan: formData.tanggal_pengadaan,
    volume_pengadaan: toNumberOrUndefined(formData.volume_pengadaan),
    harga_satuan: toNumberOrUndefined(formData.harga_satuan),
    total_nilai: toNumberOrUndefined(formData.total_nilai),
    jenis_penyaluran: formData.jenis_penyaluran,
    alasan_penyaluran: formData.alasan_penyaluran,
    wilayah_penyaluran: formData.wilayah_penyaluran,
    penerima_penyaluran: formData.penerima_penyaluran,
    volume_penyaluran: toNumberOrUndefined(formData.volume_penyaluran),
    tanggal_penyaluran: formData.tanggal_penyaluran,
    jumlah_penerima_manfaat: toNumberOrUndefined(formData.jumlah_penerima_manfaat),
    evaluasi_pelaksanaan: formData.evaluasi_pelaksanaan,
    kendala: formData.kendala,
    rekomendasi: formData.rekomendasi,
    penanggung_jawab: formData.penanggung_jawab,
    pelaksana: formData.pelaksana || user?.nama_lengkap || "Staff CPPD",
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

export default function BDSCPDCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingRecords, setExistingRecords] = useState([]);
  const [komoditasList, setKomoditasList] = useState([]);

  const layananMap = {
    Perencanaan: "LY092",
    Pengadaan: "LY093",
    "Pengelolaan Stok": "LY094",
    "Penyaluran Darurat": "LY095",
    Evaluasi: "LY096",
  };

  const [formData, setFormData] = useState({
    jenis_layanan_cppd: "Perencanaan",
    periode: new Date().toISOString().split("T")[0],
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    komoditas_id: "",
    kebutuhan_cppd: "",
    dasar_perhitungan: "",
    target_stok: "",
    lokasi_penyimpanan: "",
    kapasitas_gudang: "",
    stok_awal_bulan: "",
    penerimaan_bulan_ini: "",
    penyaluran_bulan_ini: "",
    sumber_pengadaan: "",
    metode_pengadaan: "",
    penyedia: "",
    tanggal_pengadaan: "",
    volume_pengadaan: "",
    harga_satuan: "",
    total_nilai: "",
    jenis_penyaluran: "",
    alasan_penyaluran: "",
    wilayah_penyaluran: "",
    penerima_penyaluran: "",
    volume_penyaluran: "",
    tanggal_penyaluran: "",
    jumlah_penerima_manfaat: "",
    evaluasi_pelaksanaan: "",
    kendala: "",
    rekomendasi: "",
    status: "draft",
    penanggung_jawab: "Kepala Bidang Distribusi",
    pelaksana: "",
    keterangan: "",
  });

  useEffect(() => {
    Promise.all([
      api.get("/bds-cpd").catch(() => ({ data: { data: [] } })),
      fetchKomoditasOptions().catch(() => []),
    ]).then(([recordsResponse, komoditas]) => {
      const records = Array.isArray(recordsResponse.data?.data)
        ? recordsResponse.data.data
        : [];
      setExistingRecords(records);
      setKomoditasList(Array.isArray(komoditas) ? komoditas : []);
    });
  }, []);

  const computedStokAkhir = useMemo(() => {
    const stokAwal = toNumberOrUndefined(formData.stok_awal_bulan) ?? 0;
    const penerimaan = toNumberOrUndefined(formData.penerimaan_bulan_ini) ?? 0;
    const penyaluran = toNumberOrUndefined(formData.penyaluran_bulan_ini) ?? 0;
    if (
      formData.stok_awal_bulan === "" &&
      formData.penerimaan_bulan_ini === "" &&
      formData.penyaluran_bulan_ini === ""
    ) {
      return null;
    }
    return stokAwal + penerimaan - penyaluran;
  }, [
    formData.penerimaan_bulan_ini,
    formData.penyaluran_bulan_ini,
    formData.stok_awal_bulan,
  ]);

  const computedPersenTarget = useMemo(() => {
    const targetStok = toNumberOrUndefined(formData.target_stok);
    if (!targetStok || computedStokAkhir === null) return null;
    return Number(((computedStokAkhir / targetStok) * 100).toFixed(2));
  }, [computedStokAkhir, formData.target_stok]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          record.jenis_layanan_cppd === formData.jenis_layanan_cppd &&
          Number(record.komoditas_id || 0) === Number(formData.komoditas_id || 0)
        );
      });

      if (duplicate) {
        notifyWarning(
          "Data CPPD untuk periode, jenis layanan, dan komoditas tersebut sudah ada.",
        );
        return;
      }

      const payload = buildPayload(formData, user, komoditasList, layananMap);
      await api.post("/bds-cpd", payload);

      notifyWarning("Data CPPD operasional berhasil dibuat.");
      navigate("/module/bds-cpd");
    } catch (error) {
      console.error("Error:", error);
      notifyError(
        "Error: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Cadangan Pangan Daerah
        </h2>
        <p className="text-sm text-gray-500">
          Bidang Distribusi - penguatan data operasional CPPD
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_cppd"
              value={formData.jenis_layanan_cppd}
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
              <option value="review">Review</option>
              <option value="final">Final</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kebutuhan CPPD
            </label>
            <input
              type="number"
              step="0.01"
              name="kebutuhan_cppd"
              value={formData.kebutuhan_cppd}
              onChange={handleChange}
              placeholder="Ton"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Stok
            </label>
            <input
              type="number"
              step="0.01"
              name="target_stok"
              value={formData.target_stok}
              onChange={handleChange}
              placeholder="Ton"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dasar Perhitungan
            </label>
            <textarea
              name="dasar_perhitungan"
              value={formData.dasar_perhitungan}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Dasar kebutuhan, referensi regulasi, atau hasil perhitungan internal."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Penyimpanan
            </label>
            <input
              type="text"
              name="lokasi_penyimpanan"
              value={formData.lokasi_penyimpanan}
              onChange={handleChange}
              placeholder="Gudang / lokasi simpan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kapasitas Gudang
            </label>
            <input
              type="number"
              step="0.01"
              name="kapasitas_gudang"
              value={formData.kapasitas_gudang}
              onChange={handleChange}
              placeholder="Ton"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stok Awal Bulan
            </label>
            <input
              type="number"
              step="0.01"
              name="stok_awal_bulan"
              value={formData.stok_awal_bulan}
              onChange={handleChange}
              placeholder="Ton"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penerimaan Bulan Ini
            </label>
            <input
              type="number"
              step="0.01"
              name="penerimaan_bulan_ini"
              value={formData.penerimaan_bulan_ini}
              onChange={handleChange}
              placeholder="Ton"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penyaluran Bulan Ini
            </label>
            <input
              type="number"
              step="0.01"
              name="penyaluran_bulan_ini"
              value={formData.penyaluran_bulan_ini}
              onChange={handleChange}
              placeholder="Ton"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Stok Akhir (otomatis)
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-900">
                {computedStokAkhir == null ? "-" : `${computedStokAkhir.toFixed(2)} ton`}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Capaian terhadap target
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-900">
                {computedPersenTarget == null ? "-" : `${computedPersenTarget}%`}
              </p>
            </div>
          </div>

          {formData.jenis_layanan_cppd === "Pengadaan" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sumber Pengadaan
                </label>
                <select
                  name="sumber_pengadaan"
                  value={formData.sumber_pengadaan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="APBD">APBD</option>
                  <option value="APBN">APBN</option>
                  <option value="Swadaya">Swadaya</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pengadaan
                </label>
                <select
                  name="metode_pengadaan"
                  value={formData.metode_pengadaan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="Pembelian Langsung">Pembelian Langsung</option>
                  <option value="Tender">Tender</option>
                  <option value="Penunjukan Langsung">Penunjukan Langsung</option>
                  <option value="Hibah">Hibah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penyedia
                </label>
                <input
                  type="text"
                  name="penyedia"
                  value={formData.penyedia}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pengadaan
                </label>
                <input
                  type="date"
                  name="tanggal_pengadaan"
                  value={formData.tanggal_pengadaan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Pengadaan
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="volume_pengadaan"
                  value={formData.volume_pengadaan}
                  onChange={handleChange}
                  placeholder="Ton"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Satuan
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="harga_satuan"
                  value={formData.harga_satuan}
                  onChange={handleChange}
                  placeholder="Rp"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Nilai
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="total_nilai"
                  value={formData.total_nilai}
                  onChange={handleChange}
                  placeholder="Rp"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {formData.jenis_layanan_cppd === "Penyaluran Darurat" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Penyaluran
                </label>
                <select
                  name="jenis_penyaluran"
                  value={formData.jenis_penyaluran}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="Darurat Bencana">Darurat Bencana</option>
                  <option value="Kerawanan Pangan">Kerawanan Pangan</option>
                  <option value="Stabilisasi Harga">Stabilisasi Harga</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Penyaluran
                </label>
                <input
                  type="date"
                  name="tanggal_penyaluran"
                  value={formData.tanggal_penyaluran}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wilayah Penyaluran
                </label>
                <input
                  type="text"
                  name="wilayah_penyaluran"
                  value={formData.wilayah_penyaluran}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penerima Penyaluran
                </label>
                <input
                  type="text"
                  name="penerima_penyaluran"
                  value={formData.penerima_penyaluran}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Penyaluran
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="volume_penyaluran"
                  value={formData.volume_penyaluran}
                  onChange={handleChange}
                  placeholder="Ton"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Penerima Manfaat
                </label>
                <input
                  type="number"
                  name="jumlah_penerima_manfaat"
                  value={formData.jumlah_penerima_manfaat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penyaluran
                </label>
                <textarea
                  name="alasan_penyaluran"
                  value={formData.alasan_penyaluran}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evaluasi Pelaksanaan
            </label>
            <textarea
              name="evaluasi_pelaksanaan"
              value={formData.evaluasi_pelaksanaan}
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

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/bds-cpd")}
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
