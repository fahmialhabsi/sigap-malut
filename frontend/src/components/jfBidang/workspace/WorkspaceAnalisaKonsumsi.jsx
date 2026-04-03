import React, { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import FormAnalisaPPH from "./FormAnalisaPPH";
import FormAnalisaInspeksi from "./FormAnalisaInspeksi";
import FormAnalisaSPPG from "./FormAnalisaSPPG";

const TABS = [
  { id: "pph", label: "Konsumsi & Gizi (PPH)", icon: "📊" },
  { id: "keamanan", label: "Keamanan Pangan", icon: "🔍" },
  { id: "sppg", label: "SPPG", icon: "🍽️" },
];

export default function WorkspaceAnalisaKonsumsi() {
  const [tab, setTab] = useState("pph");
  const [dual, setDual] = useState(null);
  const [loadingDual, setLoadingDual] = useState(true);

  useEffect(() => {
    setLoadingDual(true);
    api
      .get("/api/kabid-konsumsi/dashboard/dual-hero")
      .then((res) => setDual(res.data?.data ?? null))
      .catch(() => setDual(null))
      .finally(() => setLoadingDual(false));
  }, []);

  const leftPanel = useMemo(() => {
    if (loadingDual) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-pulse h-64" />
      );
    }
    if (tab === "pph") {
      return (
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2">📊 Data konsumsi (ringkas)</h2>
          <p className="text-xs text-gray-500 mb-4">
            Basis perhitungan PPH berasal dari survei konsumsi yang diverifikasi. Pastikan seluruh kelompok pangan terisi dan outlier ditangani.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <div className="text-emerald-700 font-semibold">Skor PPH (contoh)</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {dual?.sppg?.periode_tahun ? "—" : "—"}
              </div>
              <div className="text-slate-600">Gunakan data terverifikasi untuk hitung.</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-slate-700 font-semibold">Target Nasional</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">95.2</div>
              <div className="text-slate-600">Referensi target (contoh 2024).</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-600">
            Output analisa harus berupa rekomendasi program (B2SA/diversifikasi), bukan sekadar angka.
          </div>
        </div>
      );
    }
    if (tab === "keamanan") {
      const kp = dual?.keamanan_pangan ?? {};
      return (
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2">🔍 Ringkasan inspeksi & keracunan</h2>
          <p className="text-xs text-gray-500 mb-4">
            Insidental: keracunan harus direspons cepat dan dapat memicu koordinasi UPTD untuk uji lab.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
              <div className="text-amber-700 font-semibold">Inspeksi Bulan Ini</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {kp?.inspeksi_bulan_ini?.selesai ?? "—"}/{kp?.inspeksi_bulan_ini?.target ?? "—"}
              </div>
              <div className="text-slate-600">Selesai / target.</div>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50 p-3">
              <div className="text-red-700 font-semibold">Keracunan Aktif</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {kp?.keracunan_aktif?.jumlah ?? "—"}
              </div>
              <div className="text-slate-600">{kp?.keracunan_aktif?.lokasi ?? "—"}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-600">
            Analisa harus memuat risiko, rekomendasi tindak lanjut, dan kebutuhan eskalasi uji lab/koordinasi BPOM.
          </div>
        </div>
      );
    }
    const sppg = dual?.sppg ?? {};
    return (
      <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">🍽️ Ringkasan realisasi SPPG</h2>
        <p className="text-xs text-gray-500 mb-4">
          Bulanan: pastikan data penerima dan distribusi konsisten sebelum menyiapkan laporan Bapanas/Kemensos.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
            <div className="text-emerald-700 font-semibold">Realisasi</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {sppg?.realisasi_persen != null ? `${sppg.realisasi_persen}%` : "—"}
            </div>
            <div className="text-slate-600">
              {sppg?.penerima_terealisasi ?? "—"} / {sppg?.penerima_target ?? "—"} penerima.
            </div>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
            <div className="text-indigo-700 font-semibold">Deadline Bapanas</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {sppg?.deadline_laporan_bapanas_hari != null
                ? `H−${sppg.deadline_laporan_bapanas_hari}`
                : "—"}
            </div>
            <div className="text-slate-600">Reminder eskalasi bila data belum lengkap.</div>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-600">
          Output analisa SPPG menjadi dasar Kabid untuk generate laporan formal via Sekretaris.
        </div>
      </div>
    );
  }, [dual, loadingDual, tab]);

  const rightPanel =
    tab === "pph" ? <FormAnalisaPPH /> : tab === "keamanan" ? <FormAnalisaInspeksi /> : <FormAnalisaSPPG />;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">🧩 Workspace Analisa — Bidang Konsumsi</h2>
          <p className="text-xs text-gray-500">
            Pilih domain, lakukan analisa, lalu submit ke Kabid melalui alur tugas (tanpa bypass Sekretaris untuk dokumen formal).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                tab === t.id
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leftPanel}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-2">✍️ Form analisa</h3>
          <p className="text-xs text-gray-500 mb-3">
            AI hanya membantu draf; JF bertanggung jawab atas isi yang dikirim.
          </p>
          {rightPanel}
        </div>
      </div>
    </div>
  );
}

