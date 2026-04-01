import React, { useState } from "react";

export default function WorkspaceVerifikasiUptd() {
  const [tab, setTab] = useState("hasil_uji");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-bold text-gray-800">🧪 Workspace Verifikasi UPTD</h2>
        <span className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
          JF UPTD (tanpa bawahan)
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Fokus: verifikasi teknis (hasil uji lab, laporan audit) → submit ke Kepala
        UPTD. Tidak ada panel Tim Saya / SKP Pelaksana.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "hasil_uji", label: "Hasil Uji Lab" },
          { id: "audit", label: "Audit Mutu" },
          { id: "inspeksi", label: "Inspeksi / Sampling" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              tab === t.id
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Antrian masuk (placeholder)
          </div>
          <div className="text-sm text-gray-500">
            Endpoint verifikasi UPTD akan dihubungkan pada tahap backend Prompt 22.
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Form verifikasi (placeholder)
          </div>
          <div className="text-sm text-gray-500">
            Di sini akan ada aksi: <strong>Valid</strong> atau{" "}
            <strong>Kembalikan</strong> dengan catatan teknis.
          </div>
        </div>
      </div>
    </div>
  );
}

