// Hero panel — Kepala Bidang Distribusi (data nyata: inflasi_harian)
import React, { useState, useEffect } from "react";
import api from "../../services/api";

function fmtPct(v) {
  if (v == null || Number.isNaN(Number(v))) return "—";
  const n = Number(v);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function fmtNum(v, digits = 4) {
  if (v == null || Number.isNaN(Number(v))) return "—";
  return Number(v).toFixed(digits);
}

export default function HeroInflasiPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genMsg, setGenMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/kabid-distribusi/inflasi/current")
      .then((res) => setData(res.data?.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateMendagri = () => {
    setGenMsg("");
    api
      .post("/api/kabid-distribusi/inflasi/generate-mendagri", {})
      .then(() => setGenMsg("✅ Paket laporan Mendagri dibuat (simulasi PDF/PPTX)."))
      .catch(() => setGenMsg("❌ Gagal generate. Coba lagi."));
  };

  if (loading) {
    return <div className="bg-blue-950/80 rounded-2xl border-2 border-blue-700/50 p-6 animate-pulse min-h-[200px]" />;
  }

  const target = data?.target_tpid_persen ?? 2.5;
  const st = data?.status_target ?? "tidak_tersedia";
  const mtd = data?.inflasi_mtd_proksi_persen;
  const dod = data?.inflasi_dod_persen;
  const indeks = data?.indeks_laspeyres_harian;
  const cov = data?.coverage_komoditas_persen;
  const noData = data?.data_tidak_tersedia;

  return (
    <div className="bg-gradient-to-r from-blue-950/90 to-slate-900/80 border-2 border-blue-700/50 rounded-2xl p-6 shadow-xl text-blue-50">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2 text-white">
            Inflasi pangan — Maluku Utara
          </h2>
          <p className="text-xs text-blue-300/80 mt-1">
            {data?.update_terakhir
              ? `Update: ${new Date(data.update_terakhir).toLocaleString("id-ID")}`
              : "Belum ada pembaruan dari sistem"}
            {data?.sumber?.jumlah_pasar != null
              ? ` · ${data.sumber.jumlah_pasar} pasar (harga terverifikasi)`
              : ""}
            {data?.tanggal_indeks_terakhir ? ` · Indeks: ${data.tanggal_indeks_terakhir}` : ""}
          </p>
        </div>
        <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-200 text-xs font-semibold self-start">
          Target TPID &lt; {target}%
        </span>
      </div>

      {noData && (
        <p className="mt-4 text-sm text-amber-200/90">
          Belum ada baris inflasi_harian. Setelah cukup data harga terverifikasi dan cron/ETL berjalan, indeks akan tampil di sini.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-blue-900/40 border border-blue-700/40 p-4">
          <p className="text-xs text-blue-300/90">Indeks Laspeyres (hari terakhir)</p>
          <p className="text-2xl font-bold text-white mt-1">{fmtNum(indeks, 4)}</p>
        </div>
        <div className="rounded-xl bg-blue-900/40 border border-blue-700/40 p-4">
          <p className="text-xs text-blue-300/90">Inflasi DoD</p>
          <p className="text-2xl font-bold text-white mt-1">{fmtPct(dod)}</p>
        </div>
        <div className="rounded-xl bg-blue-900/40 border border-blue-700/40 p-4">
          <p className="text-xs text-blue-300/90">Inflasi MTD (proksi)</p>
          <p className="text-2xl font-bold text-white mt-1">{fmtPct(mtd)}</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 border border-slate-600/50 p-4">
          <p className="text-xs text-slate-400">Coverage komoditas acuan</p>
          <p className="text-2xl font-bold text-amber-100 mt-1">
            {cov != null && !Number.isNaN(Number(cov)) ? `${Number(cov).toFixed(1)}%` : "—"}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Bagian dari daftar bobot yang punya data terverifikasi</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900/50 border border-slate-600/50 p-4">
          <p className="text-xs text-slate-400">Status vs target TPID</p>
          <p className="text-lg font-semibold text-amber-200 mt-1">
            {st === "on_target" && "On target"}
            {st === "melampaui" && "Melampaui target"}
            {st === "mendekati" && "Mendekati batas"}
            {st === "tidak_tersedia" && "Data MTD belum tersedia"}
          </p>
          <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${st === "melampaui" ? "bg-red-500" : "bg-amber-400"}`}
              style={{
                width:
                  mtd != null && !Number.isNaN(Number(mtd))
                    ? `${Math.min(100, (Math.abs(Number(mtd)) / 3) * 100)}%`
                    : "0%",
              }}
            />
          </div>
        </div>
        <div className="rounded-xl bg-blue-900/30 border border-blue-800/40 p-4">
          <p className="text-xs font-semibold text-blue-200 mb-2">Tren indeks (hingga 6 hari terakhir)</p>
          {data?.tren_indeks_harian?.length > 0 ? (
            <ul className="text-xs text-blue-100/90 space-y-1 max-h-28 overflow-y-auto">
              {data.tren_indeks_harian.map((r) => (
                <li key={r.tanggal} className="flex justify-between gap-2">
                  <span>{r.tanggal}</span>
                  <span>
                    I={r.indeks != null ? Number(r.indeks).toFixed(2) : "—"} · DoD{" "}
                    {fmtPct(r.inflasi_dod_persen)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-blue-300/70">Belum ada deret waktu.</p>
          )}
        </div>
      </div>

      {data?.penyumbang_utama?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-blue-200 mb-2">Top penyumbang (relatif vs acuan)</p>
          <div className="space-y-2">
            {data.penyumbang_utama.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm bg-blue-900/30 rounded-lg px-3 py-2 border border-blue-800/40"
              >
                <span>{p.komoditas}</span>
                <span className={p.level === "kritis" ? "text-red-300 font-semibold" : "text-blue-200"}>
                  {p.perubahan_persen != null
                    ? `${p.perubahan_persen >= 0 ? "+" : ""}${Number(p.perubahan_persen).toFixed(2)}%`
                    : "—"}
                  {p.kontribusi_poin != null ? ` · kontrib. ~${p.kontribusi_poin}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.metodologi_ringkas && (
        <p className="mt-4 text-[11px] text-blue-200/80 border-t border-blue-800/50 pt-3">{data.metodologi_ringkas}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGenerateMendagri}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
        >
          Generate laporan Mendagri (PDF + PPTX)
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition"
        >
          Ajukan operasi pasar
        </button>
      </div>
      {genMsg && <p className="text-xs mt-2 text-blue-200">{genMsg}</p>}
    </div>
  );
}
