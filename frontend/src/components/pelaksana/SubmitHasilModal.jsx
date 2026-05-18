/**
 * SubmitHasilModal.jsx — v2
 *
 * Modal submit hasil tugas oleh Pelaksana.
 * PERUBAHAN UTAMA dari v1:
 * - "Tautan Dokumen" diganti dropdown "Tipe Bukti Kerja" → pilihan yang sesuai
 * - Modul absensi/kepegawaian: otomatis tarik rekap dari SIGAP-MALUT
 * - Mendorong semua pekerjaan dilakukan DALAM sistem (bukan dokumen eksternal)
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";

const MIN_RINGKAS = 50;

// ─── Konfigurasi tipe bukti per kategori modul ───────────────────────────────
const TIPE_BUKTI = [
  {
    id: "dalam_sistem",
    label: "✅ Data dalam sistem SIGAP-MALUT",
    hint: "Data sudah diinput langsung ke dalam sistem. Tidak diperlukan dokumen eksternal.",
    needsUrl: false,
    recommended: true,
  },
  {
    id: "link_eoffice",
    label: "🏛️ Tautan e-Office / Sistem Persuratan Dinas",
    hint: "Link ke dokumen di sistem e-Office atau sistem surat dinas resmi.",
    needsUrl: true,
    urlPlaceholder: "https://eoffice.malutprov.go.id/...",
  },
  {
    id: "link_simpeg",
    label: "👤 Tautan SIMPEG (Sistem Kepegawaian)",
    hint: "Link ke data kepegawaian di SIMPEG atau aplikasi BKD/BKN.",
    needsUrl: true,
    urlPlaceholder: "https://simpeg.bkd.malutprov.go.id/...",
  },
  {
    id: "link_drive",
    label: "📁 Tautan Google Drive / Penyimpanan Cloud",
    hint: "Link file di Google Drive, OneDrive, atau penyimpanan resmi dinas.",
    needsUrl: true,
    urlPlaceholder: "https://drive.google.com/...",
  },
  {
    id: "link_lainnya",
    label: "🔗 Tautan Sistem / Aplikasi Lain",
    hint: "Link ke sistem lain (SIMDA, SIMKEU, SAKTI, dll.).",
    needsUrl: true,
    urlPlaceholder: "https://...",
  },
];

// Modul yang direkomendasikan menggunakan data dalam sistem
const MODUL_DALAM_SISTEM = ["absensi", "kepegawaian", "asn", "kgb", "harga", "stok", "konsumsi"];
// Modul yang WAJIB ada URL jika tidak pilih "dalam_sistem"
const URL_REQUIRED_MODULES = ["kepegawaian", "asn", "kgb", "absensi"];

function requiresUrl(taskModule) {
  const m = String(taskModule || "").toLowerCase();
  return URL_REQUIRED_MODULES.some((k) => m.includes(k));
}

function isModulDalamSistem(taskModule) {
  const m = String(taskModule || "").toLowerCase();
  return MODUL_DALAM_SISTEM.some((k) => m.includes(k));
}

function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Mini Rekap Absensi dari sistem ──────────────────────────────────────────
function MiniRekapAbsensi({ onRingkasGenerated }) {
  const [rekap, setRekap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/pelaksana/absensi/bulan-ini")
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        const r = { hadir: 0, sakit: 0, ijin: 0, cuti: 0, dinas_luar: 0, alpha: 0 };
        rows.forEach((row) => {
          const s = row.status?.toLowerCase();
          if (r[s] !== undefined) r[s]++;
        });
        r.total = rows.length;
        setRekap(r);

        // Auto-generate ringkasan
        if (rows.length > 0) {
          const bulan = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
          const ringkasAuto =
            `Rekap Absensi ${bulan}: ` +
            `Hadir ${r.hadir} hari, Sakit ${r.sakit} hari, ` +
            `Ijin ${r.ijin} hari, Cuti ${r.cuti} hari, ` +
            `Dinas Luar ${r.dinas_luar} hari, Alpha ${r.alpha} hari. ` +
            `Total tercatat: ${r.total} hari. ` +
            `Data absensi diinput langsung dalam sistem SIGAP-MALUT.`;
          onRingkasGenerated?.(ringkasAuto);
        }
      })
      .catch(() => setRekap(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-cyan-600 animate-pulse">Mengambil rekap absensi dari sistem…</p>;
  if (!rekap || rekap.total === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
        ⚠️ Belum ada data absensi bulan ini dalam sistem. Isi absensi harian terlebih dahulu
        di tab "Absensi Harian" di dashboard Anda.
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs">
      <p className="font-bold text-emerald-700 mb-2">
        ✅ Rekap Absensi Bulan Ini (dari SIGAP-MALUT)
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: "hadir",      label: "Hadir",      color: "text-emerald-700" },
          { key: "sakit",      label: "Sakit",      color: "text-amber-700" },
          { key: "ijin",       label: "Ijin",       color: "text-blue-700" },
          { key: "cuti",       label: "Cuti",       color: "text-purple-700" },
          { key: "dinas_luar", label: "Dinas Luar", color: "text-cyan-700" },
          { key: "alpha",      label: "Alpha",      color: "text-red-700" },
        ].map(({ key, label, color }) => (
          <div key={key} className="text-center">
            <p className={`font-bold text-base ${color}`}>{rekap[key]}</p>
            <p className="text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-emerald-600 font-semibold mt-2 text-center">
        Total {rekap.total} hari tercatat · Data otomatis disertakan
      </p>
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
export default function SubmitHasilModal({ task, onClose, onSuccess }) {
  const [ringkas, setRingkas] = useState("");
  const [tipeBukti, setTipeBukti] = useState(
    isModulDalamSistem(task?.module) ? "dalam_sistem" : ""
  );
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const selectedTipe = TIPE_BUKTI.find((t) => t.id === tipeBukti);
  const urlNeeded = selectedTipe?.needsUrl ?? false;
  const urlOk = !urlNeeded || url.trim().length > 5;

  const ringkasLen = ringkas.trim().length;
  const ringkasOk = ringkasLen >= MIN_RINGKAS;
  const tipeOk = tipeBukti !== "";
  const canSubmit = ringkasOk && tipeOk && urlOk && !submitting;

  const revisiKe = Number(task?.revisi_ke || 0);
  const catatanRevisi = task?.catatan_verifikasi || null;
  const revisionHistory = Array.isArray(task?.metadata?.revision_history)
    ? task.metadata.revision_history
    : [];

  const prevOutput = task?.metadata?.pelaksana_submit?.output_ringkas || "";
  const prevUrl = task?.metadata?.pelaksana_submit?.output_url || "";

  useEffect(() => {
    if (revisiKe > 0) {
      setRingkas(prevOutput);
      setUrl(prevUrl);
    }
    setTimeout(() => textareaRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleRekapGenerated = useCallback((ringkasAuto) => {
    // Auto-isi ringkasan jika masih kosong
    setRingkas((prev) => prev.trim().length < MIN_RINGKAS ? ringkasAuto : prev);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        output_ringkas: ringkas.trim(),
        tipe_bukti: tipeBukti,
      };
      if (tipeBukti === "dalam_sistem") {
        payload.output_url = "sigap-malut://data-dalam-sistem";
        payload.sumber_data = "sistem_internal";
      } else if (url.trim()) {
        payload.output_url = url.trim();
      }

      await api.post(`/api/pelaksana/tugas/${task.id}/submit`, payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal mengirim. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
              {revisiKe > 0 ? `📝 Revisi ke-${revisiKe}` : "📤 Submit Hasil Tugas"}
            </p>
            <h3 className="font-bold text-gray-900 text-base leading-snug truncate">
              {task?.title || `Tugas #${task?.id}`}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {task?.module && (
                <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-mono">
                  modul: {task.module}
                </span>
              )}
              {task?.due_date && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  new Date(task.due_date) < new Date()
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  Deadline: {fmtDate(task.due_date)}
                </span>
              )}
              {task?.priority === "high" && (
                <span className="text-[10px] bg-red-100 text-red-700 rounded px-1.5 py-0.5 font-bold">
                  🔴 Prioritas Tinggi
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 text-xl font-bold leading-none mt-0.5"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        {/* Catatan revisi */}
        {revisiKe > 0 && catatanRevisi && (
          <div className="px-5 pt-4 shrink-0">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-bold text-red-700 mb-1">
                ↩️ Catatan Perbaikan dari Kasubag (Revisi ke-{revisiKe})
              </p>
              <p className="text-sm text-red-800">{catatanRevisi}</p>
            </div>
          </div>
        )}

        {/* Riwayat revisi */}
        {revisionHistory.length > 1 && (
          <div className="px-5 pt-2 shrink-0">
            <details className="text-xs text-gray-500 cursor-pointer">
              <summary className="font-semibold select-none">
                Riwayat {revisionHistory.length} revisi sebelumnya
              </summary>
              <div className="mt-1 space-y-1 pl-2 border-l-2 border-gray-200">
                {revisionHistory.slice(1).map((r, i) => (
                  <div key={i}>
                    <span className="font-semibold">Revisi {r.revisi_ke}:</span> {r.note}
                    <span className="ml-1 opacity-60">({new Date(r.at).toLocaleDateString("id-ID")})</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* 1. Tipe Bukti Kerja */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Tipe Bukti Kerja / Output <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {TIPE_BUKTI.map((tipe) => (
                <label
                  key={tipe.id}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition ${
                    tipeBukti === tipe.id
                      ? tipe.recommended
                        ? "bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400"
                        : "bg-cyan-50 border-cyan-400 ring-1 ring-cyan-400"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipe_bukti"
                    value={tipe.id}
                    checked={tipeBukti === tipe.id}
                    onChange={() => { setTipeBukti(tipe.id); setUrl(""); setError(null); }}
                    className="mt-0.5 accent-emerald-600"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800">
                      {tipe.label}
                      {tipe.recommended && (
                        <span className="ml-1.5 text-[10px] bg-emerald-600 text-white rounded px-1 py-0.5 font-bold">
                          DIANJURKAN
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{tipe.hint}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Rekap Absensi otomatis (khusus modul absensi/kepegawaian) */}
          {tipeBukti === "dalam_sistem" && isModulDalamSistem(task?.module) && (
            <MiniRekapAbsensi onRingkasGenerated={handleRekapGenerated} />
          )}

          {/* URL input (jika tipe bukan "dalam_sistem") */}
          {urlNeeded && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tautan Dokumen <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
                placeholder={selectedTipe?.urlPlaceholder || "https://..."}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  url.length > 0 && !urlOk
                    ? "border-red-300 focus:ring-red-400"
                    : "border-gray-200 focus:ring-cyan-400"
                }`}
                required
              />
              {url.length > 0 && !urlOk && (
                <p className="text-[11px] text-red-600 mt-0.5">Masukkan URL yang valid.</p>
              )}
              <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-700">
                ⚠️ Sebaiknya data diinput langsung ke dalam sistem SIGAP-MALUT agar
                tidak bergantung pada dokumen eksternal. Pilih "Data dalam sistem" di atas.
              </div>
            </div>
          )}

          {/* 2. Ringkasan Hasil */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Ringkasan Hasil / Output <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] font-semibold tabular-nums ${
                ringkasOk ? "text-emerald-600" : "text-amber-600"
              }`}>
                {ringkasLen}/{MIN_RINGKAS} min.
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={ringkas}
              onChange={(e) => { setRingkas(e.target.value); setError(null); }}
              rows={5}
              placeholder={
                tipeBukti === "dalam_sistem" && isModulDalamSistem(task?.module)
                  ? "Ringkasan akan otomatis terisi dari data dalam sistem. Anda dapat menyesuaikannya…"
                  : revisiKe > 0
                    ? "Perbaiki dan jelaskan perubahan yang sudah dilakukan sesuai catatan Kasubag…"
                    : "Jelaskan secara konkret apa yang sudah dikerjakan, data apa yang sudah disiapkan, dan hasilnya bagaimana. (min. 50 karakter)"
              }
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none ${
                ringkas.length > 0 && !ringkasOk
                  ? "border-amber-300 focus:ring-amber-400"
                  : "border-gray-200 focus:ring-emerald-400"
              }`}
              required
            />
            {ringkas.length > 0 && !ringkasOk && (
              <p className="text-[11px] text-amber-600 mt-0.5">
                Tambahkan {MIN_RINGKAS - ringkasLen} karakter lagi.
              </p>
            )}
          </div>

          {/* Alur info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-700 mb-0.5">Alur setelah submit:</p>
            <p>
              Status → <span className="font-mono font-semibold">submitted</span> →
              Kasubag periksa di <strong>Verifikasi Queue</strong> →
              Disetujui: <span className="font-mono font-semibold">verified</span> /
              Dikembalikan: revisi dengan catatan.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Mengirim…
              </>
            ) : (
              revisiKe > 0 ? "Kirim Revisi ke Kasubag" : "Kirim ke Kasubag"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
