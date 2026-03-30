// Input harga pasar harian — Pelaksana Bidang Distribusi (9 komoditas pokok)
import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../utils/api";

const WAJIB = [
  { key: "beras_medium", label: "Beras Medium", satuan: "kg" },
  { key: "beras_premium", label: "Beras Premium", satuan: "kg" },
  { key: "minyak", label: "Minyak Goreng", satuan: "liter" },
  { key: "gula", label: "Gula Pasir", satuan: "kg" },
  { key: "daging_ayam", label: "Daging Ayam", satuan: "kg" },
  { key: "telur", label: "Telur Ayam", satuan: "butir" },
  { key: "cabai", label: "Cabai Merah", satuan: "kg" },
  { key: "bawang", label: "Bawang Merah", satuan: "kg" },
  { key: "terigu", label: "Tepung Terigu", satuan: "kg" },
];

function deadlineCountdownWit() {
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(14, 0, 0, 0);
  if (now.getHours() >= 14) deadline.setDate(deadline.getDate() + 1);
  const ms = deadline - now;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return { text: `${h}j ${m}m`, urgent: ms < 30 * 60000 };
}

export default function FormInputHargaPasar() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [pasarNama, setPasarNama] = useState("Pasar Gamalama, Ternate");
  const [kabupaten, setKabupaten] = useState("Kota Ternate");
  const [sumber, setSumber] = useState("survei_langsung");
  const [harga, setHarga] = useState({});
  const [kemarin, setKemarin] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const draftTimer = useRef(null);

  const loadKemarin = useCallback(() => {
    api
      .get("/api/pelaksana/harga-pasar/kemarin")
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        const map = {};
        rows.forEach((r) => {
          if (r.komoditas_key) map[r.komoditas_key] = r.harga_eceran;
        });
        setKemarin(map);
      })
      .catch(() => setKemarin({}));
  }, []);

  useEffect(() => {
    loadKemarin();
  }, [loadKemarin, tanggal]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sigap_draft_harga_pasar");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.tanggal === tanggal) setHarga(d.harga || {});
      }
    } catch {
      /* ignore */
    }
  }, [tanggal]);

  useEffect(() => {
    draftTimer.current = setInterval(() => {
      try {
        localStorage.setItem(
          "sigap_draft_harga_pasar",
          JSON.stringify({ tanggal, harga, savedAt: Date.now() }),
        );
      } catch {
        /* ignore */
      }
    }, 30000);
    return () => clearInterval(draftTimer.current);
  }, [tanggal, harga]);

  const cd = deadlineCountdownWit();
  const filled = WAJIB.filter((w) => harga[w.key] != null && String(harga[w.key]).trim() !== "").length;

  const vsKemarin = (key) => {
    const v = Number(harga[key]);
    const k = Number(kemarin[key]);
    if (!v || !k) return null;
    const pct = ((v - k) / k) * 100;
    return { pct, warn: Math.abs(pct) > 15 };
  };

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();
    const baris = WAJIB.filter((w) => harga[w.key] != null && harga[w.key] !== "")
      .map((w) => ({
        komoditas_key: w.key,
        nama: w.label,
        harga_eceran: Number(harga[w.key]),
        satuan: w.satuan,
      }));
    if (baris.length === 0) return;
    setSubmitting(true);
    setResult(null);
    try {
      await api.post("/api/pelaksana/harga-pasar", {
        tanggal,
        pasar_nama: pasarNama,
        kabupaten_kota: kabupaten,
        sumber_data: sumber,
        baris,
        status: asDraft ? "draft" : "submitted_to_jf",
      });
      setResult({
        ok: true,
        text: asDraft ? "Draft tersimpan." : "Data dikirim ke JF untuk verifikasi.",
      });
      if (!asDraft) setHarga({});
    } catch {
      setResult({ ok: false, text: "Gagal menyimpan." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">📊 Input Harga Pasar Harian</h2>
        <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          Bidang Distribusi
        </span>
      </div>

      <div
        className={`text-sm mb-3 px-3 py-2 rounded-lg border ${cd.urgent ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-900"}`}
      >
        ⏰ Deadline input: <strong>14.00 WIT</strong> (sisa: {cd.text}) · Progress komoditas: {filled}/9
      </div>

      <form className="space-y-4" onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Tanggal</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Pasar</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={pasarNama}
              onChange={(e) => setPasarNama(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Kab/Kota</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={kabupaten}
              onChange={(e) => setKabupaten(e.target.value)}
            />
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <span className="font-medium">Metode:</span>{" "}
          <label className="mr-3">
            <input
              type="radio"
              checked={sumber === "survei_langsung"}
              onChange={() => setSumber("survei_langsung")}
            />{" "}
            Survei langsung
          </label>
          <label>
            <input
              type="radio"
              checked={sumber === "laporan_pedagang"}
              onChange={() => setSumber("laporan_pedagang")}
            />{" "}
            Laporan pedagang
          </label>
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Komoditas</th>
                <th className="px-3 py-2 text-left">Rp / satuan</th>
                <th className="px-3 py-2 text-left">vs kemarin</th>
              </tr>
            </thead>
            <tbody>
              {WAJIB.map((w) => {
                const cmp = vsKemarin(w.key);
                return (
                  <tr key={w.key} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {w.label}
                      <span className="text-gray-400 font-normal text-xs"> /{w.satuan}</span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                        value={harga[w.key] ?? ""}
                        onChange={(e) =>
                          setHarga((prev) => ({ ...prev, [w.key]: e.target.value }))
                        }
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {!cmp ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className={cmp.warn ? "text-red-600 font-semibold" : "text-gray-600"}>
                          {cmp.pct >= 0 ? "↗" : "↘"} {cmp.pct.toFixed(1)}%
                          {cmp.warn ? " ⚠️" : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setHarga((prev) => ({ ...prev, ...kemarin }))}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
          >
            Salin dari kemarin
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, true)}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
          >
            💾 Simpan draft lokal
          </button>
          <button
            type="submit"
            disabled={submitting || filled < 1}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
          >
            {submitting ? "Mengirim…" : "📤 Submit ke JF"}
          </button>
          {result && (
            <span className={`text-xs ${result.ok ? "text-green-600" : "text-red-500"}`}>
              {result.text}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Auto-save ringkas ke browser setiap 30 detik. Modus offline penuh dapat ditambahkan dengan IndexedDB + sync.
        </p>
      </form>
    </div>
  );
}
