import React from "react";

export default function WorkspaceSertifikasiMutu() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800">🏆 Workspace Sertifikasi & Audit Mutu</h2>
        <span className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full font-medium">
          Kasi Mutu
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-700 mb-2">Queue Sertifikasi Aktif</div>
          <p className="text-sm text-gray-500">
            Placeholder. Akan dihubungkan ke tabel `sertifikasi_pangan` + `audit_pangan`.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="text-xs font-bold text-slate-700 mb-2">Tindak Lanjut & Rekomendasi</div>
          <p className="text-sm text-gray-500">
            Placeholder: verifikasi dokumen, audit lapangan, rekomendasi setujui/tolak/minta perbaikan.
          </p>
        </div>
      </div>
    </div>
  );
}

