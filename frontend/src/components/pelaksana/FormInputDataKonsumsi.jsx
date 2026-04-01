import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../utils/api";

const KELOMPOK_PANGAN = [
  { key: "padi_padian", label: "Padi-padian (beras)" },
  { key: "umbi_umbian", label: "Umbi-umbian (sagu)" },
  { key: "pangan_hewani", label: "Pangan hewani" },
  { key: "minyak_lemak", label: "Minyak & lemak" },
  { key: "buah_biji_berminyak", label: "Buah/biji berminyak" },
  { key: "kacang_kacangan", label: "Kacang-kacangan" },
  { key: "gula", label: "Gula" },
  { key: "sayuran_buah", label: "Sayuran & buah" },
  { key: "lainnya", label: "Lainnya" },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function FormInputDataKonsumsi({ jenisTugas }) {
  const jt = String(jenisTugas || "").toLowerCase();
  const draftKey = useMemo(() => `sigap_draft_konsumsi_${jt || "none"}`, [jt]);
  const draftTimer = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Varian A: survei konsumsi (PPH)
  const [survei, setSurvei] = useState(() => ({
    periode_bulan: new Date().getMonth() + 1,
    periode_tahun: new Date().getFullYear(),
    kabupaten_kota: "Kota Ternate",
    kecamatan: "",
    jumlah_responden: "",
    metode: "wawancara",
    nilai: Object.fromEntries(KELOMPOK_PANGAN.map((k) => [k.key, ""])),
    catatan: "",
  }));

  // Varian B: laporan inspeksi
  const [inspeksi, setInspeksi] = useState(() => ({
    tanggal_inspeksi: todayStr(),
    lokasi: "",
    kabupaten_kota: "Kota Ternate",
    jenis_pangan: "Sayuran segar",
    metode_inspeksi: "visual",
    temuan: "",
    status_temuan: "perlu_perbaikan",
    rekomendasi: "",
    perlu_uji_lab: "tidak",
    foto_url: "",
  }));

  // Varian C: realisasi SPPG
  const [sppg, setSppg] = useState(() => ({
    periode_bulan: new Date().getMonth() + 1,
    periode_tahun: new Date().getFullYear(),
    nama_satuan: "SDN 01 Ternate",
    kabupaten_kota: "Kota Ternate",
    penerima_terdaftar: 127,
    jumlah_penerima_terealisasi: "",
    tanggal_distribusi: todayStr(),
    status_distribusi: "terealisasi",
    catatan: "",
    komoditas: [
      { komoditas: "Beras", volume: "", satuan: "kg" },
      { komoditas: "Telur Ayam", volume: "", satuan: "butir" },
      { komoditas: "Sayuran", volume: "", satuan: "kg" },
    ],
  }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d?.survei) setSurvei(d.survei);
      if (d?.inspeksi) setInspeksi(d.inspeksi);
      if (d?.sppg) setSppg(d.sppg);
    } catch {
      /* ignore */
    }
  }, [draftKey]);

  useEffect(() => {
    draftTimer.current = setInterval(() => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ survei, inspeksi, sppg, savedAt: Date.now() }),
        );
      } catch {
        /* ignore */
      }
    }, 30000);
    return () => clearInterval(draftTimer.current);
  }, [draftKey, inspeksi, sppg, survei]);

  const disabledNoJenis = !jt || !["survei", "inspeksi", "sppg"].includes(jt);

  const header = jt === "survei"
    ? { icon: "📊", title: "SURVEI KONSUMSI PANGAN (PPH)" }
    : jt === "inspeksi"
      ? { icon: "🔍", title: "LAPORAN INSPEKSI KEAMANAN PANGAN" }
      : jt === "sppg"
        ? { icon: "🍽️", title: "DATA REALISASI SPPG" }
        : { icon: "🧾", title: "Input Data Konsumsi" };

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();
    if (disabledNoJenis) return;
    setSubmitting(true);
    setResult(null);
    try {
      const payload =
        jt === "survei"
          ? {
              sub_type: "survei",
              ...survei,
            }
          : jt === "inspeksi"
            ? {
                sub_type: "inspeksi",
                ...inspeksi,
              }
            : {
                sub_type: "sppg",
                ...sppg,
              };

      await api.post("/api/pelaksana/data-konsumsi", {
        ...payload,
        status: asDraft ? "draft" : "submitted_to_jf",
      });
      setResult({
        ok: true,
        text: asDraft ? "Draft tersimpan." : "Data dikirim ke JF untuk verifikasi (wajib).",
      });
    } catch {
      setResult({ ok: false, text: "Gagal mengirim. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            {header.icon} {header.title}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Varian form ditentukan oleh penugasan JF. Pelaksana tidak bisa memilih sendiri dan tidak bisa bypass ke Kabid/Sekretaris/KaDin.
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
          tipe: {jt || "—"}
        </span>
      </div>

      {disabledNoJenis ? (
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          Belum ada jenis penugasan dari JF untuk input data Konsumsi. Tunggu tugas dari JF (survei/inspeksi/SPPG).
        </div>
      ) : (
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-3">
          {jt === "survei" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Periode Bulan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={survei.periode_bulan}
                    onChange={(e) => setSurvei((s) => ({ ...s, periode_bulan: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Periode Tahun <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={survei.periode_tahun}
                    onChange={(e) => setSurvei((s) => ({ ...s, periode_tahun: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Jumlah Responden <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={survei.jumlah_responden}
                    onChange={(e) => setSurvei((s) => ({ ...s, jumlah_responden: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Kabupaten/Kota</label>
                  <input
                    required
                    value={survei.kabupaten_kota}
                    onChange={(e) => setSurvei((s) => ({ ...s, kabupaten_kota: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Kecamatan</label>
                  <input
                    value={survei.kecamatan}
                    onChange={(e) => setSurvei((s) => ({ ...s, kecamatan: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Ternate Tengah…"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left">Kelompok Pangan</th>
                      <th className="px-3 py-2 text-left">gram/org/hari</th>
                      <th className="px-3 py-2 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KELOMPOK_PANGAN.map((k) => (
                      <tr key={k.key} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-800">{k.label}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={survei.nilai[k.key] ?? ""}
                            onChange={(e) =>
                              setSurvei((s) => ({
                                ...s,
                                nilai: { ...s.nilai, [k.key]: e.target.value },
                              }))
                            }
                            className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-gray-400">—</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Metode</label>
                  <select
                    value={survei.metode}
                    onChange={(e) => setSurvei((s) => ({ ...s, metode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="wawancara">Wawancara</option>
                    <option value="observasi">Observasi</option>
                    <option value="campuran">Campuran</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Catatan</label>
                  <input
                    value={survei.catatan}
                    onChange={(e) => setSurvei((s) => ({ ...s, catatan: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Catatan lapangan (opsional)"
                  />
                </div>
              </div>
            </>
          )}

          {jt === "inspeksi" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Lokasi <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={inspeksi.lokasi}
                    onChange={(e) => setInspeksi((s) => ({ ...s, lokasi: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Pasar/Produsen/Sekolah…"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Tanggal <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={inspeksi.tanggal_inspeksi}
                    onChange={(e) => setInspeksi((s) => ({ ...s, tanggal_inspeksi: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Jenis Pangan</label>
                  <input
                    value={inspeksi.jenis_pangan}
                    onChange={(e) => setInspeksi((s) => ({ ...s, jenis_pangan: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Metode Inspeksi</label>
                  <select
                    value={inspeksi.metode_inspeksi}
                    onChange={(e) => setInspeksi((s) => ({ ...s, metode_inspeksi: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="visual">Visual</option>
                    <option value="organoleptik">Organoleptik</option>
                    <option value="uji_lab">Uji Lab</option>
                    <option value="dokumen">Dokumen</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  Temuan <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={inspeksi.temuan}
                  onChange={(e) => setInspeksi((s) => ({ ...s, temuan: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ringkasan temuan lapangan…"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Status Temuan</label>
                  <div className="flex gap-2">
                    {[
                      { id: "aman", label: "Aman" },
                      { id: "perlu_perbaikan", label: "Perlu Perbaikan" },
                      { id: "tidak_layak", label: "Tidak Layak" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setInspeksi((s) => ({ ...s, status_temuan: opt.id }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          inspeksi.status_temuan === opt.id
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Perlu uji lab?</label>
                  <select
                    value={inspeksi.perlu_uji_lab}
                    onChange={(e) => setInspeksi((s) => ({ ...s, perlu_uji_lab: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="tidak">Tidak</option>
                    <option value="ya">Ya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Rekomendasi</label>
                <textarea
                  rows={3}
                  value={inspeksi.rekomendasi}
                  onChange={(e) => setInspeksi((s) => ({ ...s, rekomendasi: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Rekomendasi tindak lanjut…"
                />
              </div>
            </>
          )}

          {jt === "sppg" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Periode Bulan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={sppg.periode_bulan}
                    onChange={(e) => setSppg((s) => ({ ...s, periode_bulan: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Periode Tahun <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={sppg.periode_tahun}
                    onChange={(e) => setSppg((s) => ({ ...s, periode_tahun: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Tanggal Distribusi <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={sppg.tanggal_distribusi}
                    onChange={(e) => setSppg((s) => ({ ...s, tanggal_distribusi: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Satuan <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={sppg.nama_satuan}
                    onChange={(e) => setSppg((s) => ({ ...s, nama_satuan: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Kabupaten/Kota</label>
                  <input
                    required
                    value={sppg.kabupaten_kota}
                    onChange={(e) => setSppg((s) => ({ ...s, kabupaten_kota: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    Jumlah terealisasi <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={sppg.jumlah_penerima_terealisasi}
                    onChange={(e) => setSppg((s) => ({ ...s, jumlah_penerima_terealisasi: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder={`≤ ${sppg.penerima_terdaftar}`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Status</label>
                  <select
                    value={sppg.status_distribusi}
                    onChange={(e) => setSppg((s) => ({ ...s, status_distribusi: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="terealisasi">Terealisasi penuh</option>
                    <option value="parsial">Parsial</option>
                    <option value="tidak_terealisasi">Tidak terealisasi</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left">Komoditas</th>
                      <th className="px-3 py-2 text-left">Volume</th>
                      <th className="px-3 py-2 text-left">Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sppg.komoditas.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-3 py-2">
                          <input
                            value={row.komoditas}
                            onChange={(e) =>
                              setSppg((s) => ({
                                ...s,
                                komoditas: s.komoditas.map((r, i) =>
                                  i === idx ? { ...r, komoditas: e.target.value } : r,
                                ),
                              }))
                            }
                            className="w-44 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={row.volume}
                            onChange={(e) =>
                              setSppg((s) => ({
                                ...s,
                                komoditas: s.komoditas.map((r, i) =>
                                  i === idx ? { ...r, volume: e.target.value } : r,
                                ),
                              }))
                            }
                            className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={row.satuan}
                            onChange={(e) =>
                              setSppg((s) => ({
                                ...s,
                                komoditas: s.komoditas.map((r, i) =>
                                  i === idx ? { ...r, satuan: e.target.value } : r,
                                ),
                              }))
                            }
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="text-xs text-gray-600 block mb-1">Catatan</label>
                <input
                  value={sppg.catatan}
                  onChange={(e) => setSppg((s) => ({ ...s, catatan: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Hambatan (jika parsial/tidak)…"
                />
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-2 items-center pt-1">
            <button
              type="button"
              disabled={submitting}
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-sm font-semibold rounded-lg transition"
            >
              💾 Simpan Draft
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
            >
              📤 Submit ke JF
            </button>
            {result && (
              <span className={`text-xs ${result.ok ? "text-emerald-600" : "text-red-600"}`}>
                {result.text}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

