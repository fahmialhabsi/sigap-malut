import { useState } from "react";
import {
  generateMendagriPPTX,
  MENDAGRI_TEMPLATES,
} from "../../utils/exportMendagri";

const WATERMARK_PRESETS = [
  { label: "Tidak ada", value: "" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "RAHASIA", value: "RAHASIA" },
  { label: "INTERNAL", value: "INTERNAL ONLY" },
  { label: "Custom…", value: "__custom" },
];

const SLIDES_PREVIEW = [
  "1 — Cover (Instansi, Periode, Label Mendagri)",
  "2 — Ringkasan Eksekutif (Inflasi + Status + Target)",
  "3 — Top 10 Kontributor Inflasi (Tabel)",
  "4 — Tren Inflasi 6 Bulan (Tabel Bulanan)",
  "5 — Prediksi & Rekomendasi Kebijakan",
  "6 — Penutup & Penandatangan",
];

function today() {
  return new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * MendagriPPTXModal
 *
 * Props:
 *   open     {bool}
 *   onClose  {function}
 *   data     {object}  — data inflasi dari API / dummy
 *   periode  {string}  — "Maret 2026"
 */
export default function MendagriPPTXModal({
  open,
  onClose,
  data = {},
  periode = "",
}) {
  const [template, setTemplate] = useState("formal_biru");
  const [wmPreset, setWmPreset] = useState("");
  const [wmCustom, setWmCustom] = useState("");
  const [slidesOpen, setSlidesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signatory, setSignatory] = useState({
    nama: "",
    jabatan: "Kepala Dinas Ketahanan Pangan",
    nip: "",
    kota: "Ternate",
    tanggal: today(),
  });

  if (!open) return null;

  const watermarkText = wmPreset === "__custom" ? wmCustom : wmPreset;

  function setSig(field, value) {
    setSignatory((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      await generateMendagriPPTX({
        data,
        periode,
        template,
        watermarkText,
        signatory,
      });
    } catch (err) {
      console.error("PPTX generation failed:", err);
      alert(`Gagal membuat PPTX: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "inherit" }}
      >
        {/* Header */}
        <div className="bg-blue-700 rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">
              📊 Generate Laporan Mendagri
            </h2>
            <p className="text-blue-200 text-sm mt-0.5">
              PPTX 6 slide — {periode || "Semua periode"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Template Selector */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-3">
              🎨 Pilih Template
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(MENDAGRI_TEMPLATES).map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setTemplate(tmpl.id)}
                  className={`border-2 rounded-xl p-3 text-left transition-all ${
                    template === tmpl.id
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex gap-1.5 mb-2">
                    <span
                      className="w-8 h-5 rounded-sm block"
                      style={{ background: tmpl.preview[0] }}
                    />
                    <span
                      className="w-8 h-5 rounded-sm block"
                      style={{ background: tmpl.preview[1] }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {tmpl.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Watermark */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-3">💧 Watermark</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {WATERMARK_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setWmPreset(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    wmPreset === p.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {wmPreset === "__custom" && (
              <input
                type="text"
                placeholder="Masukkan teks watermark…"
                value={wmCustom}
                onChange={(e) => setWmCustom(e.target.value)}
                maxLength={40}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
            {watermarkText && watermarkText !== "__custom" && (
              <p className="text-xs text-blue-500 mt-1">
                Teks watermark: <strong>{watermarkText}</strong> akan tampil
                diagonal di setiap slide
              </p>
            )}
          </section>

          {/* Signatory */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-3">
              ✍️ Data Penandatangan (Slide 6)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap penandatangan"
                  value={signatory.nama}
                  onChange={(e) => setSig("nama", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={signatory.jabatan}
                  onChange={(e) => setSig("jabatan", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  NIP
                </label>
                <input
                  type="text"
                  placeholder="19XXXXXXXXXXXXXX"
                  value={signatory.nip}
                  onChange={(e) => setSig("nip", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Kota
                </label>
                <input
                  type="text"
                  value={signatory.kota}
                  onChange={(e) => setSig("kota", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Tanggal
                </label>
                <input
                  type="text"
                  value={signatory.tanggal}
                  onChange={(e) => setSig("tanggal", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </section>

          {/* Slide Preview Accordion */}
          <section>
            <button
              onClick={() => setSlidesOpen((v) => !v)}
              className="flex items-center gap-2 text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <span className="text-gray-400">{slidesOpen ? "▾" : "▸"}</span>
              Pratinjau Struktur Slide ({SLIDES_PREVIEW.length} slide)
            </button>
            {slidesOpen && (
              <ul className="mt-2 space-y-1">
                {SLIDES_PREVIEW.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-600"
                  >
                    <span className="text-blue-400 font-mono text-xs mt-0.5">
                      ●
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Membuat PPTX…
              </>
            ) : (
              "🖨️ Generate & Download PPTX"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
