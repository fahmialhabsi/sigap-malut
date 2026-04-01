import React from "react";

export default function WorkspaceUjiLabTeknis() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800">🔬 Workspace Uji Lab & Sampling</h2>
        <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
          Kasi Teknis
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-700 mb-2">Sample Queue</div>
          <p className="text-sm text-gray-500">
            Placeholder. Akan dihubungkan ke `uji_laboratorium` + chain-of-custody (`/api/uptd-ops/tracking`).
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="text-xs font-bold text-slate-700 mb-2">Verifikasi Hasil & Keputusan</div>
          <p className="text-sm text-gray-500">
            Placeholder: valid / uji ulang / kembalikan, lalu submit ke JF UPTD / Kepala UPTD.
          </p>
        </div>
      </div>
    </div>
  );
}

