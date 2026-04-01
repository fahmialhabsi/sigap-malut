import React, { useEffect, useState } from "react";
import api from "../../utils/api";

function ProgressBar({ value = 0 }) {
  const v = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
      <div className="h-full bg-emerald-600" style={{ width: `${v}%` }} />
    </div>
  );
}

export default function HeroDualPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genMsg, setGenMsg] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/kabid-konsumsi/dashboard/dual-hero")
      .then((res) => setData(res.data?.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenMsg("");
    try {
      await api.post("/api/kabid-konsumsi/sppg/generate-laporan-bapanas");
      setGenMsg("✅ Draft laporan Bapanas disiapkan (mock).");
    } catch {
      setGenMsg("❌ Gagal generate laporan.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="bg-white rounded-xl border p-5 h-44 animate-pulse" />;

  const sppg = data?.sppg ?? {};
  const kp = data?.keamanan_pangan ?? {};
  const real = Number(sppg.realisasi_persen ?? 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-800/90 to-slate-900/80">
        <h2 className="font-bold text-white flex items-center gap-2">
          🧭 Dual Hero — SPPG/MBG & Keamanan Pangan
        </h2>
        <p className="text-xs text-emerald-100/70 mt-0.5">
          Ringkasan prioritas bulanan (SPPG) dan insidental (keracunan/inspeksi).
        </p>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SPPG */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-700">🍽️ SPPG & Program MBG</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                Realisasi: {sppg.realisasi_persen != null ? `${sppg.realisasi_persen}%` : "—"}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Penerima: {sppg.penerima_terealisasi ?? "—"} / {sppg.penerima_target ?? "—"}
              </p>
            </div>
            <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-bold">
              Deadline: {sppg.deadline_laporan_bapanas_hari != null ? `H−${sppg.deadline_laporan_bapanas_hari}` : "—"}
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={real} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white border border-emerald-100 p-2">
              <div className="text-slate-500">Beras</div>
              <div className="font-semibold text-slate-900">
                {sppg.kebutuhan_pangan?.beras_ton ?? "—"} ton
              </div>
            </div>
            <div className="rounded-lg bg-white border border-emerald-100 p-2">
              <div className="text-slate-500">Protein</div>
              <div className="font-semibold text-slate-900">
                {sppg.kebutuhan_pangan?.protein_ton ?? "—"} ton
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
            >
              {generating ? "Menyiapkan…" : "Generate Laporan Bapanas"}
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition"
            >
              Detail SPPG per Kab/Kota
            </button>
            {genMsg && <span className="text-xs text-slate-600">{genMsg}</span>}
          </div>
        </div>

        {/* Keamanan Pangan */}
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-700">🔍 Keamanan Pangan</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white border border-amber-100 p-2">
              <div className="text-slate-500">Inspeksi Bulan Ini</div>
              <div className="font-semibold text-slate-900">
                {kp.inspeksi_bulan_ini?.selesai ?? "—"} / {kp.inspeksi_bulan_ini?.target ?? "—"}
              </div>
            </div>
            <div className="rounded-lg bg-white border border-amber-100 p-2">
              <div className="text-slate-500">Keracunan Aktif</div>
              <div className="font-semibold text-slate-900">
                {kp.keracunan_aktif?.jumlah ?? "—"} kasus
              </div>
              <div className="text-[11px] text-slate-500">
                {kp.keracunan_aktif?.lokasi ? `${kp.keracunan_aktif.lokasi} · ` : ""}
                {kp.keracunan_aktif?.status ?? ""}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-white border border-amber-100 p-3 text-xs">
            <div className="font-semibold text-slate-800 mb-1">Temuan</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                🟢 Aman: {kp.temuan?.aman ?? "—"}
              </span>
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                🟡 Perlu: {kp.temuan?.perlu_perbaikan ?? "—"}
              </span>
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                🔴 Tidak Layak: {kp.temuan?.tidak_layak ?? "—"}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition">
              Tindak Lanjut
            </button>
            <button className="px-3 py-2 bg-white border border-amber-200 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg transition">
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

