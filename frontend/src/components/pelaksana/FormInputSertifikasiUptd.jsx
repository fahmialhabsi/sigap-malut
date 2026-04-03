import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const JENIS = [
  { id: "prima3", label: "Prima 3" },
  { id: "gmp", label: "GMP" },
  { id: "ghp", label: "GHP" },
  { id: "gfp", label: "GFP" },
  { id: "nkv", label: "NKV" },
];

export default function FormInputSertifikasiUptd() {
  const [form, setForm] = useState({
    jenis_sertifikasi: "prima3",
    nama_pemohon: "",
    produk_pangan: "",
    alamat_usaha: "",
    tanggal_permohonan: "",
    catatan: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  const fetchRiwayat = () => {
    setLoadingRows(true);
    api
      .get("/api/pelaksana/uptd/mutu/sertifikasi/riwayat", { params: { limit: 8 } })
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoadingRows(false));
  };

  useEffect(() => {
    fetchRiwayat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nama_pemohon) {
      notifyError("Nama pemohon wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/pelaksana/uptd/mutu/sertifikasi", form);
      notifySuccess("Tersimpan & terkirim ke Kasi Mutu (wajib).");
      setForm((f) => ({
        ...f,
        nama_pemohon: "",
        produk_pangan: "",
        alamat_usaha: "",
        tanggal_permohonan: "",
        catatan: "",
      }));
      fetchRiwayat();
    } catch (err) {
      notifyError(err.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800">🏆 Input Sertifikasi (UPTD Mutu)</h2>
        <span className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full font-medium">
          Submit ke Kasi Mutu (wajib)
        </span>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Jenis Sertifikasi</label>
            <select
              value={form.jenis_sertifikasi}
              onChange={(e) => setForm((f) => ({ ...f, jenis_sertifikasi: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {JENIS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Tanggal Permohonan (opsional)
            </label>
            <input
              type="date"
              value={form.tanggal_permohonan}
              onChange={(e) => setForm((f) => ({ ...f, tanggal_permohonan: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            Nama Pemohon <span className="text-red-400">*</span>
          </label>
          <input
            value={form.nama_pemohon}
            onChange={(e) => setForm((f) => ({ ...f, nama_pemohon: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Nama UMKM/instansi"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Produk Pangan (opsional)</label>
          <input
            value={form.produk_pangan}
            onChange={(e) => setForm((f) => ({ ...f, produk_pangan: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Contoh: Abon ikan"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Alamat Usaha (opsional)</label>
          <textarea
            value={form.alamat_usaha}
            onChange={(e) => setForm((f) => ({ ...f, alamat_usaha: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={2}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Catatan (opsional)</label>
          <textarea
            value={form.catatan}
            onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={2}
            placeholder="Temuan awal / kelengkapan dokumen…"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold"
        >
          {submitting ? "Menyimpan…" : "Simpan & Kirim ke Kasi Mutu"}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800 text-sm">🕒 Riwayat kirim (Sertifikasi)</h3>
          <button
            type="button"
            onClick={fetchRiwayat}
            className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Refresh
          </button>
        </div>
        {loadingRows ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Belum ada riwayat.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="border border-gray-100 rounded-lg p-3 bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {String(r.jenis_sertifikasi || "sertifikasi").toUpperCase()} — {r.nama_pemohon}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {r.produk_pangan ? `Produk: ${r.produk_pangan} · ` : ""}
                      Tgl: {r.tanggal_permohonan || "—"}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold shrink-0">
                    {r.status || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

