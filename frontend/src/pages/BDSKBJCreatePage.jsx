import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { notifyError, notifySuccess, notifyWarning } from "../utils/notify";

function parseList(value) {
  return String(value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPayload(formData, user, layananMap) {
  const payload = {
    unit_kerja: "Bidang Distribusi",
    layanan_id: layananMap[formData.jenis_kebijakan],
    jenis_kebijakan: formData.jenis_kebijakan,
    nomor_dokumen: formData.nomor_dokumen,
    tanggal_dokumen: formData.tanggal_dokumen,
    periode: formData.periode,
    tahun: Number(formData.tahun),
    judul_kebijakan: formData.judul_kebijakan,
    latar_belakang: formData.latar_belakang,
    ruang_lingkup: formData.ruang_lingkup,
    tujuan: formData.tujuan,
    sasaran: formData.sasaran,
    wilayah_distribusi: formData.wilayah_distribusi,
    komoditas_distribusi: parseList(formData.komoditas_distribusi),
    jalur_distribusi_utama: formData.jalur_distribusi_utama,
    jalur_distribusi_alternatif: formData.jalur_distribusi_alternatif,
    titik_distribusi: formData.titik_distribusi,
    strategi_distribusi: formData.strategi_distribusi,
    mekanisme_distribusi: formData.mekanisme_distribusi,
    stakeholder_terlibat: formData.stakeholder_terlibat,
    koordinasi_dengan: formData.koordinasi_dengan,
    hasil_sinkronisasi: formData.hasil_sinkronisasi,
    pedoman_teknis: formData.pedoman_teknis,
    sop_distribusi: formData.sop_distribusi,
    indikator_keberhasilan: formData.indikator_keberhasilan,
    target_capaian: formData.target_capaian,
    dasar_hukum: formData.dasar_hukum,
    rekomendasi: formData.rekomendasi,
    tindak_lanjut: formData.tindak_lanjut,
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
      (Array.isArray(payload[key]) && payload[key].length === 0)
    ) {
      delete payload[key];
    }
  });

  return payload;
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}

function Field({ label, required = false, className = "", children }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[110px]`;

export default function BDSKBJCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layananMap = {
    "Kebijakan Distribusi": "LY077",
    "Peta Distribusi": "LY078",
    "Penetapan Jalur": "LY079",
    Sinkronisasi: "LY080",
    "Pedoman Teknis": "LY081",
  };

  const [formData, setFormData] = useState({
    jenis_kebijakan: "Kebijakan Distribusi",
    nomor_dokumen: "",
    tanggal_dokumen: new Date().toISOString().split("T")[0],
    periode: String(new Date().getFullYear()),
    tahun: new Date().getFullYear(),
    judul_kebijakan: "",
    latar_belakang: "",
    ruang_lingkup: "",
    tujuan: "",
    sasaran: "",
    wilayah_distribusi: "",
    komoditas_distribusi: "",
    jalur_distribusi_utama: "",
    jalur_distribusi_alternatif: "",
    titik_distribusi: "",
    strategi_distribusi: "",
    mekanisme_distribusi: "",
    stakeholder_terlibat: "",
    koordinasi_dengan: "",
    hasil_sinkronisasi: "",
    pedoman_teknis: "",
    sop_distribusi: "",
    indikator_keberhasilan: "",
    target_capaian: "",
    dasar_hukum: "",
    rekomendasi: "",
    tindak_lanjut: "",
    status: "draft",
    penanggung_jawab: "Kepala Bidang Distribusi",
    pelaksana: "",
    keterangan: "",
  });

  const stats = useMemo(
    () => ({
      komoditas: parseList(formData.komoditas_distribusi).length,
      titik: parseList(formData.titik_distribusi).length,
      stakeholder: parseList(formData.stakeholder_terlibat).length,
    }),
    [
      formData.komoditas_distribusi,
      formData.stakeholder_terlibat,
      formData.titik_distribusi,
    ],
  );

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

      if (!user?.id) {
        notifyWarning("Session expired. Silakan login ulang.");
        navigate("/login");
        return;
      }

      const payload = buildPayload(formData, user, layananMap);
      await api.post("/bds-kbj", payload);

      notifySuccess("Data sarpras/kelembagaan distribusi berhasil disimpan.");
      navigate("/module/bds-kbj");
    } catch (error) {
      notifyError(
        `Error: ${error.response?.data?.error || error.response?.data?.message || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Input Sarpras & Kelembagaan Distribusi
          </h2>
          <p className="text-sm text-slate-500">
            Bidang Distribusi - penguatan sarpras, peta jalur, dan kelembagaan
            distribusi pangan masyarakat
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Komoditas" value={stats.komoditas} />
          <StatPill label="Titik" value={stats.titik} />
          <StatPill label="Mitra" value={stats.stakeholder} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Identitas Dokumen
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Jenis Kebijakan" required>
              <select
                name="jenis_kebijakan"
                value={formData.jenis_kebijakan}
                onChange={handleChange}
                className={INPUT_CLASS}
                required
              >
                {Object.keys(layananMap).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nomor Dokumen">
              <input
                name="nomor_dokumen"
                value={formData.nomor_dokumen}
                onChange={handleChange}
                className={INPUT_CLASS}
                placeholder="Contoh: 500.7/12/DISPANG/2026"
              />
            </Field>
            <Field label="Tanggal Dokumen" required>
              <input
                type="date"
                name="tanggal_dokumen"
                value={formData.tanggal_dokumen}
                onChange={handleChange}
                className={INPUT_CLASS}
                required
              />
            </Field>
            <Field label="Periode">
              <input
                name="periode"
                value={formData.periode}
                onChange={handleChange}
                className={INPUT_CLASS}
                placeholder="Contoh: Semester I 2026"
              />
            </Field>
            <Field label="Tahun" required>
              <input
                type="number"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                className={INPUT_CLASS}
                min="2020"
                max="2100"
                required
              />
            </Field>
            <Field label="Status Dokumen" required>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={INPUT_CLASS}
                required
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="finalisasi">Finalisasi</option>
                <option value="disetujui">Disetujui</option>
                <option value="final">Final</option>
              </select>
            </Field>
            <Field label="Judul Dokumen" required className="md:col-span-2">
              <input
                name="judul_kebijakan"
                value={formData.judul_kebijakan}
                onChange={handleChange}
                className={INPUT_CLASS}
                placeholder="Contoh: Peta Jalur Distribusi Pangan Strategis Provinsi Maluku Utara"
                required
              />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Sarpras Distribusi
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Wilayah Distribusi" className="md:col-span-2">
              <textarea name="wilayah_distribusi" value={formData.wilayah_distribusi} onChange={handleChange} className={TEXTAREA_CLASS} rows={3} placeholder="Pisahkan wilayah dengan koma atau baris baru" />
            </Field>
            <Field label="Komoditas Distribusi" className="md:col-span-2">
              <textarea name="komoditas_distribusi" value={formData.komoditas_distribusi} onChange={handleChange} className={TEXTAREA_CLASS} rows={3} placeholder="Contoh: Beras, Gula, Minyak Goreng" />
            </Field>
            <Field label="Jalur Distribusi Utama">
              <textarea name="jalur_distribusi_utama" value={formData.jalur_distribusi_utama} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} placeholder="Contoh: Gudang Sofifi - Pelabuhan - Pasar Ternate" />
            </Field>
            <Field label="Jalur Distribusi Alternatif">
              <textarea name="jalur_distribusi_alternatif" value={formData.jalur_distribusi_alternatif} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} placeholder="Jalur cadangan saat cuaca atau infrastruktur terganggu" />
            </Field>
            <Field label="Titik Distribusi" className="md:col-span-2">
              <textarea name="titik_distribusi" value={formData.titik_distribusi} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} placeholder="Contoh: Gudang Sofifi, Pasar Higienis Gamalama, Pelabuhan Tobelo" />
            </Field>
            <Field label="Strategi Distribusi">
              <textarea name="strategi_distribusi" value={formData.strategi_distribusi} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Mekanisme Distribusi">
              <textarea name="mekanisme_distribusi" value={formData.mekanisme_distribusi} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Kelembagaan & Sinkronisasi
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Stakeholder Terlibat" className="md:col-span-2">
              <textarea name="stakeholder_terlibat" value={formData.stakeholder_terlibat} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} placeholder="Contoh: BULOG, BUMDes, kios pangan, distributor, UPTD" />
            </Field>
            <Field label="Koordinasi Dengan">
              <textarea name="koordinasi_dengan" value={formData.koordinasi_dengan} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Hasil Sinkronisasi">
              <textarea name="hasil_sinkronisasi" value={formData.hasil_sinkronisasi} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Pedoman Teknis">
              <textarea name="pedoman_teknis" value={formData.pedoman_teknis} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="SOP Distribusi">
              <textarea name="sop_distribusi" value={formData.sop_distribusi} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Outcome & Tindak Lanjut
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Latar Belakang" className="md:col-span-2">
              <textarea name="latar_belakang" value={formData.latar_belakang} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Ruang Lingkup">
              <textarea name="ruang_lingkup" value={formData.ruang_lingkup} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Tujuan">
              <textarea name="tujuan" value={formData.tujuan} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Sasaran">
              <textarea name="sasaran" value={formData.sasaran} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Dasar Hukum">
              <textarea name="dasar_hukum" value={formData.dasar_hukum} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Indikator Keberhasilan">
              <textarea name="indikator_keberhasilan" value={formData.indikator_keberhasilan} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Target Capaian">
              <textarea name="target_capaian" value={formData.target_capaian} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Rekomendasi">
              <textarea name="rekomendasi" value={formData.rekomendasi} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Tindak Lanjut" className="md:col-span-2">
              <textarea name="tindak_lanjut" value={formData.tindak_lanjut} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Pelaksana">
              <input name="pelaksana" value={formData.pelaksana} onChange={handleChange} className={INPUT_CLASS} placeholder="Otomatis diisi dari user login jika kosong" />
            </Field>
            <Field label="Keterangan">
              <textarea name="keterangan" value={formData.keterangan} onChange={handleChange} className={TEXTAREA_CLASS} rows={3} />
            </Field>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/module/bds-kbj")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Sarpras/Kelembagaan"}
          </button>
        </div>
      </form>
    </div>
  );
}
