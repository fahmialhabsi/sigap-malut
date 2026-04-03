import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning,
} from "../utils/notify";

function toNumberOrUndefined(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sumStok(rows = []) {
  return rows.reduce((sum, row) => {
    const stok = Number(row?.stok_ton || 0);
    return sum + (Number.isFinite(stok) ? stok : 0);
  }, 0);
}

function buildPreviewParams(formData) {
  return {
    tahun: formData.tahun,
    bulan: formData.bulan || undefined,
    triwulan: formData.triwulan || undefined,
    semester: formData.semester || undefined,
    periode: formData.periode || undefined,
  };
}

function buildPayload(formData, user, previewData) {
  const monitoringSummary = previewData?.summary?.monitoring;
  const cppdSummary = previewData?.summary?.cppd;

  const payload = {
    unit_kerja: "Bidang Distribusi",
    layanan_id: "LY106",
    periode: formData.periode,
    tahun: Number(formData.tahun),
    bulan: toNumberOrUndefined(formData.bulan),
    triwulan: toNumberOrUndefined(formData.triwulan),
    semester: toNumberOrUndefined(formData.semester),
    judul_laporan: formData.judul_laporan,
    ringkasan_eksekutif: formData.ringkasan_eksekutif,
    capaian_distribusi: formData.capaian_distribusi,
    capaian_stabilisasi_harga: formData.capaian_stabilisasi_harga,
    capaian_cppd: formData.capaian_cppd,
    inflasi_pangan: toNumberOrUndefined(formData.inflasi_pangan),
    target_inflasi: toNumberOrUndefined(formData.target_inflasi),
    volume_distribusi_total:
      toNumberOrUndefined(formData.volume_distribusi_total) ??
      monitoringSummary?.total_volume_distribusi,
    stok_cppd:
      toNumberOrUndefined(formData.stok_cppd) ??
      (cppdSummary ? Number(sumStok(cppdSummary.stok_cadangan).toFixed(2)) : undefined),
    operasi_pasar_dilakukan:
      toNumberOrUndefined(formData.operasi_pasar_dilakukan) ??
      monitoringSummary?.jumlah_fasilitasi,
    rapat_tpid_dilakukan:
      toNumberOrUndefined(formData.rapat_tpid_dilakukan) ??
      monitoringSummary?.jumlah_koordinasi,
    anggaran_program: toNumberOrUndefined(formData.anggaran_program),
    realisasi_anggaran: toNumberOrUndefined(formData.realisasi_anggaran),
    permasalahan: formData.permasalahan,
    solusi: formData.solusi,
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
      Number.isNaN(payload[key])
    ) {
      delete payload[key];
    }
  });

  return payload;
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

function SummaryCard({ label, value, tone = "blue" }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    green: "border-green-100 bg-green-50 text-green-700",
  };

  return (
    <div className={`rounded-lg border px-3 py-3 ${tones[tone] || tones.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[110px]`;

export default function BDSLAPCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [lockAfterSave, setLockAfterSave] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [formData, setFormData] = useState({
    periode: firstOfMonth,
    tahun: now.getFullYear(),
    bulan: now.getMonth() + 1,
    triwulan: "",
    semester: "",
    judul_laporan: `Laporan Kinerja Distribusi Pangan ${now.getFullYear()}`,
    ringkasan_eksekutif: "",
    capaian_distribusi: "",
    capaian_stabilisasi_harga: "",
    capaian_cppd: "",
    inflasi_pangan: "",
    target_inflasi: "2.5",
    volume_distribusi_total: "",
    stok_cppd: "",
    operasi_pasar_dilakukan: "",
    rapat_tpid_dilakukan: "",
    anggaran_program: "",
    realisasi_anggaran: "",
    permasalahan: "",
    solusi: "",
    rekomendasi: "",
    tindak_lanjut: "",
    status: "draft",
    penanggung_jawab: "Kepala Bidang Distribusi",
    pelaksana: "",
    keterangan: "",
  });

  const summary = useMemo(() => previewData?.summary || null, [previewData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      setLockAfterSave(checked);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const response = await api.get("/bds-lap/finalisasi/preview", {
        params: buildPreviewParams(formData),
      });
      const data = response.data?.data;
      setPreviewData(data);
      setFormData((prev) => ({
        ...prev,
        ringkasan_eksekutif:
          data?.narrative?.ringkasan_eksekutif || prev.ringkasan_eksekutif,
        capaian_distribusi:
          data?.narrative?.capaian_distribusi || prev.capaian_distribusi,
        capaian_cppd: data?.summary?.cppd?.catatan || prev.capaian_cppd,
        permasalahan: data?.narrative?.permasalahan || prev.permasalahan,
        rekomendasi: data?.narrative?.rekomendasi || prev.rekomendasi,
        tindak_lanjut: data?.narrative?.tindak_lanjut || prev.tindak_lanjut,
        volume_distribusi_total:
          data?.summary?.monitoring?.total_volume_distribusi ??
          prev.volume_distribusi_total,
        stok_cppd:
          data?.summary?.cppd
            ? Number(sumStok(data.summary.cppd.stok_cadangan).toFixed(2))
            : prev.stok_cppd,
        operasi_pasar_dilakukan:
          data?.summary?.monitoring?.jumlah_fasilitasi ??
          prev.operasi_pasar_dilakukan,
        rapat_tpid_dilakukan:
          data?.summary?.monitoring?.jumlah_koordinasi ??
          prev.rapat_tpid_dilakukan,
        status: prev.status === "draft" ? "final" : prev.status,
      }));
      notifyInfo("Preview finalisasi berhasil dibangun dari data operasional.");
    } catch (error) {
      notifyError(
        `Preview gagal: ${error.response?.data?.error || error.response?.data?.message || error.message}`,
      );
    } finally {
      setLoadingPreview(false);
    }
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

      const payload = buildPayload(formData, user, previewData);
      const response = await api.post("/bds-lap", payload);
      const created = response.data?.data;

      if (lockAfterSave) {
        if (payload.status !== "final") {
          notifyWarning(
            "Laporan disimpan, tetapi belum dikunci karena status belum final.",
          );
        } else if (created?.id) {
          await api.post(`/bds-lap/${created.id}/kunci-ke-epelara`, {});
          notifySuccess("Laporan final berhasil dikunci ke e-Pelara.");
        }
      } else {
        notifySuccess("Laporan distribusi berhasil disimpan.");
      }

      navigate("/module/bds-lap");
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
            Finalisasi Laporan Distribusi
          </h2>
          <p className="text-sm text-slate-500">
            Bangun laporan final dari data operasional SIGAP-MALUT dan kunci ke
            e-Pelara saat siap
          </p>
        </div>
        <button
          type="button"
          onClick={handlePreview}
          disabled={loadingPreview}
          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
        >
          {loadingPreview ? "Membangun Preview..." : "Ambil Dari Data Operasional"}
        </button>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard label="Data Sumber" value={summary.total_sumber_data || 0} />
          <SummaryCard label="Volume Distribusi" value={`${summary.monitoring?.total_volume_distribusi || 0} ton`} tone="green" />
          <SummaryCard label="Hambatan Final" value={summary.monitoring?.jumlah_hambatan || 0} tone="amber" />
          <SummaryCard label="Dokumen Sarpras/Kelembagaan" value={summary.sarpras_kelembagaan?.total_dokumen || 0} />
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Identitas Laporan</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Periode" required>
              <input type="date" name="periode" value={formData.periode} onChange={handleChange} className={INPUT_CLASS} required />
            </Field>
            <Field label="Tahun" required>
              <input type="number" name="tahun" value={formData.tahun} onChange={handleChange} className={INPUT_CLASS} required />
            </Field>
            <Field label="Bulan">
              <input type="number" name="bulan" value={formData.bulan} onChange={handleChange} className={INPUT_CLASS} min="1" max="12" />
            </Field>
            <Field label="Triwulan">
              <input type="number" name="triwulan" value={formData.triwulan} onChange={handleChange} className={INPUT_CLASS} min="1" max="4" />
            </Field>
            <Field label="Semester">
              <input type="number" name="semester" value={formData.semester} onChange={handleChange} className={INPUT_CLASS} min="1" max="2" />
            </Field>
            <Field label="Status Laporan" required>
              <select name="status" value={formData.status} onChange={handleChange} className={INPUT_CLASS} required>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="final">Final</option>
              </select>
            </Field>
            <Field label="Judul Laporan" required className="md:col-span-2">
              <input name="judul_laporan" value={formData.judul_laporan} onChange={handleChange} className={INPUT_CLASS} required />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Ringkasan & Capaian</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Ringkasan Eksekutif" className="md:col-span-2">
              <textarea name="ringkasan_eksekutif" value={formData.ringkasan_eksekutif} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Capaian Distribusi" className="md:col-span-2">
              <textarea name="capaian_distribusi" value={formData.capaian_distribusi} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Capaian Stabilisasi Harga">
              <textarea name="capaian_stabilisasi_harga" value={formData.capaian_stabilisasi_harga} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Capaian CPPD">
              <textarea name="capaian_cppd" value={formData.capaian_cppd} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Indikator Kuantitatif</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Inflasi Pangan (%)">
              <input type="number" step="0.01" name="inflasi_pangan" value={formData.inflasi_pangan} onChange={handleChange} className={INPUT_CLASS} />
            </Field>
            <Field label="Target Inflasi (%)">
              <input type="number" step="0.01" name="target_inflasi" value={formData.target_inflasi} onChange={handleChange} className={INPUT_CLASS} />
            </Field>
            <Field label="Volume Distribusi Total">
              <input type="number" step="0.01" name="volume_distribusi_total" value={formData.volume_distribusi_total} onChange={handleChange} className={INPUT_CLASS} />
            </Field>
            <Field label="Stok CPPD">
              <input type="number" step="0.01" name="stok_cppd" value={formData.stok_cppd} onChange={handleChange} className={INPUT_CLASS} />
            </Field>
            <Field label="Operasi Pasar Dilakukan">
              <input type="number" name="operasi_pasar_dilakukan" value={formData.operasi_pasar_dilakukan} onChange={handleChange} className={INPUT_CLASS} />
            </Field>
            <Field label="Rapat TPID Dilakukan">
              <input type="number" name="rapat_tpid_dilakukan" value={formData.rapat_tpid_dilakukan} onChange={handleChange} className={INPUT_CLASS} />
            </Field>
            <Field label="Anggaran Program">
              <input type="number" step="0.01" name="anggaran_program" value={formData.anggaran_program} onChange={handleChange} className={INPUT_CLASS} />
            </Field>
            <Field label="Realisasi Anggaran">
              <input type="number" step="0.01" name="realisasi_anggaran" value={formData.realisasi_anggaran} onChange={handleChange} className={INPUT_CLASS} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Permasalahan & Rekomendasi</h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Permasalahan" className="md:col-span-2">
              <textarea name="permasalahan" value={formData.permasalahan} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
            </Field>
            <Field label="Solusi">
              <textarea name="solusi" value={formData.solusi} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} />
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

        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <label className="flex items-start gap-3 text-sm text-emerald-800">
            <input type="checkbox" checked={lockAfterSave} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
            <span>
              <span className="block font-semibold">Kunci ke e-Pelara setelah simpan</span>
              <span className="block text-emerald-700/80">
                Gunakan hanya jika status laporan sudah final dan preview data operasional sudah dibangun.
              </span>
            </span>
          </label>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate("/module/bds-lap")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Menyimpan..." : "Simpan Laporan"}
          </button>
        </div>
      </form>
    </div>
  );
}
