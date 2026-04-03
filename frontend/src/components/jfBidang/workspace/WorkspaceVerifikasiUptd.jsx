import React, { useState } from "react";

/**
 * Workspace JF UPTD — palet slate/teal, kontras teks jelas, bukan putih dominan.
 */
export default function WorkspaceVerifikasiUptd() {
  const [tab, setTab] = useState("hasil_uji");

  return (
    <div className="rounded-2xl border border-slate-500/35 bg-gradient-to-br from-slate-200/90 via-slate-100/95 to-slate-200/80 text-slate-900 shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
            🧪 Workspace Verifikasi UPTD
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Fokus: verifikasi teknis (hasil uji lab, laporan audit) → submit ke Kepala
            UPTD. Tidak ada panel Tim Saya / SKP Pelaksana.
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold bg-teal-950/15 text-teal-950 border border-teal-900/25 px-3 py-1.5 rounded-full">
          JF UPTD (tanpa bawahan)
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { id: "hasil_uji", label: "Hasil Uji Lab" },
          { id: "audit", label: "Audit Mutu" },
          { id: "inspeksi", label: "Inspeksi / Sampling" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition touch-manipulation ${
              tab === t.id
                ? "bg-teal-800 text-white border-teal-900 shadow-sm"
                : "bg-slate-300/50 border-slate-500/35 text-slate-800 hover:bg-slate-300/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-500/30 bg-slate-300/40 p-4 sm:p-5 min-h-[140px]">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
            Antrian masuk (placeholder)
          </div>
          <div className="text-sm text-slate-700 leading-relaxed">
            Endpoint verifikasi UPTD akan dihubungkan pada tahap backend Prompt 22.
          </div>
        </div>
        <div className="rounded-xl border border-teal-900/20 bg-teal-950/10 p-4 sm:p-5 min-h-[140px]">
          <div className="text-xs font-bold text-teal-950 uppercase tracking-wide mb-2">
            Form verifikasi (placeholder)
          </div>
          <div className="text-sm text-slate-800 leading-relaxed">
            Di sini akan ada aksi: <strong className="text-teal-950">Valid</strong> atau{" "}
            <strong className="text-teal-950">Kembalikan</strong> dengan catatan teknis.
          </div>
        </div>
      </div>
    </div>
  );
}
