import React, { useRef, useState } from "react";
import api from "../../utils/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const MEDIA_OPTIONS = ["WA", "Email", "Pos", "Kurir", "Langsung", "SIPD"];

/**
 * Tombol + modal ringkas: unggah surat ke e-Office (surat_masuk + agenda + AI).
 * Digunakan di dashboard Pelaksana, Bendahara, Sekretariat, Kabid, UPTD.
 */
export default function UploadSuratMasukQuickAction({
  defaultMedia = "WA",
  className = "",
  buttonLabel = "📤 Surat masuk (e-Office)",
  showBendaharaHint = false,
  /** Tombol di header gelap (putih transparan) vs header terang (biru solid). */
  variant = "onDark",
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [form, setForm] = useState({
    media_terima: defaultMedia,
    tanggal_surat: "",
    asal_surat: "",
    keterangan: "",
  });

  const close = () => {
    setOpen(false);
    setFile(null);
    setLoading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      notifyError("Pilih file surat (PDF / gambar).");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file_surat", file);
      fd.append("media_terima", form.media_terima);
      if (form.tanggal_surat) fd.append("tanggal_surat", form.tanggal_surat);
      if (form.asal_surat) fd.append("asal_surat", form.asal_surat);
      if (form.keterangan) fd.append("keterangan", form.keterangan);

      const res = await api.post("/surat/masuk/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data?.data;
      notifySuccess(
        data?.nomor_agenda
          ? `Masuk e-Office: agenda ${data.nomor_agenda}. AI memproses…`
          : "Surat masuk tercatat di e-Office.",
      );
      close();
    } catch (err) {
      notifyError(err.response?.data?.message || "Gagal mengunggah surat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            variant === "onLight"
              ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/30 shadow-sm transition"
          }
        >
          {buttonLabel}
        </button>
        {showBendaharaHint && (
          <span
            className={`text-[10px] max-w-[220px] leading-snug hidden md:inline ${
              variant === "onLight" ? "text-gray-500" : "text-white/70"
            }`}
          >
            Bendahara Pengeluaran, Gaji &amp; Barang: satu pintu unggah ke agenda
            sekretariat.
          </span>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-gray-900">Unggah Surat Masuk</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  File masuk ke modul e-Office: nomor agenda, agenda surat, lalu
                  analisis AI (alur normal).
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-3">
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-300"
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                ) : (
                  <span className="text-sm text-gray-500">Klik pilih PDF / JPG / PNG</span>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Media terima</label>
                <select
                  value={form.media_terima}
                  onChange={(e) => setForm({ ...form, media_terima: e.target.value })}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                >
                  {MEDIA_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Tanggal surat (opsional)</label>
                <input
                  type="date"
                  value={form.tanggal_surat}
                  onChange={(e) => setForm({ ...form, tanggal_surat: e.target.value })}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Asal (opsional)</label>
                <input
                  type="text"
                  value={form.asal_surat}
                  onChange={(e) => setForm({ ...form, asal_surat: e.target.value })}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  placeholder="Instansi pengirim"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Keterangan</label>
                <textarea
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  placeholder="Mis. dari WhatsApp grup …"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? "Mengunggah…" : "Kirim ke e-Office"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
