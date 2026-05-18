/**
 * AbsensiHarianPanel.jsx
 *
 * Panel absensi harian + rekap bulanan untuk Pelaksana Sekretariat.
 * Data absensi diinput LANGSUNG di dalam sistem SIGAP-MALUT.
 * Menggantikan rekap manual via Excel/Google Sheets.
 *
 * Fitur:
 * - Input status absensi hari ini (satu klik)
 * - Lihat rekap absensi bulan ini (tabel kalender)
 * - Hitung otomatis: hadir, sakit, ijin, cuti, alpha
 * - Data siap digunakan sebagai output_ringkas task rekap absen
 */
import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const STATUS_CONFIG = {
  hadir:      { label: "Hadir",       emoji: "✅", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  sakit:      { label: "Sakit",       emoji: "🤒", color: "bg-amber-100 text-amber-700 border-amber-200" },
  ijin:       { label: "Ijin",        emoji: "📋", color: "bg-blue-100 text-blue-700 border-blue-200" },
  cuti:       { label: "Cuti",        emoji: "🏖️", color: "bg-purple-100 text-purple-700 border-purple-200" },
  dinas_luar: { label: "Dinas Luar",  emoji: "🚗", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  alpha:      { label: "Alpha / TK",  emoji: "❌", color: "bg-red-100 text-red-700 border-red-200" },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatTanggal(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function getNamaBulan() {
  return new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

// Menghitung ringkasan rekap dari array rows
function hitungRekap(rows) {
  const rekap = { hadir: 0, sakit: 0, ijin: 0, cuti: 0, dinas_luar: 0, alpha: 0, total: 0 };
  rows.forEach((r) => {
    const s = r.status?.toLowerCase();
    if (rekap[s] !== undefined) rekap[s]++;
    rekap.total++;
  });
  return rekap;
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
export default function AbsensiHarianPanel({ onRekapReady }) {
  const [statusHariIni, setStatusHariIni] = useState(null); // data dari API
  const [rows, setRows] = useState([]);
  const [loadingHariIni, setLoadingHariIni] = useState(true);
  const [loadingBulan, setLoadingBulan] = useState(true);
  const [submitting, setSubmitting] = useState(null); // status yang sedang disubmit
  const [keterangan, setKeterangan] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tab, setTab] = useState("input"); // "input" | "rekap"

  const loadHariIni = useCallback(async () => {
    setLoadingHariIni(true);
    try {
      const res = await api.get("/api/pelaksana/absensi/hari-ini");
      setStatusHariIni(res.data?.data || null);
    } catch {
      setStatusHariIni(null);
    } finally {
      setLoadingHariIni(false);
    }
  }, []);

  const loadBulanIni = useCallback(async () => {
    setLoadingBulan(true);
    try {
      const res = await api.get("/api/pelaksana/absensi/bulan-ini");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setRows(data);
      // Callback ke parent dengan data rekap siap pakai
      const rekap = hitungRekap(data);
      onRekapReady?.({ rows: data, rekap });
    } catch {
      setRows([]);
    } finally {
      setLoadingBulan(false);
    }
  }, [onRekapReady]);

  useEffect(() => {
    loadHariIni();
    loadBulanIni();
  }, [loadHariIni, loadBulanIni]);

  async function submitAbsensi(status) {
    setSubmitting(status);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/api/pelaksana/absensi", {
        status,
        keterangan: keterangan.trim() || null,
      });
      setSuccess(`Absensi "${STATUS_CONFIG[status]?.label}" berhasil dicatat.`);
      setKeterangan("");
      await loadHariIni();
      await loadBulanIni();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menyimpan absensi. Coba lagi."
      );
    } finally {
      setSubmitting(null);
    }
  }

  const rekap = hitungRekap(rows);
  const today = todayStr();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-white">
        <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-0.5">
          SIGAP-MALUT · Input Dalam Sistem
        </p>
        <h3 className="font-bold text-gray-800 text-base">📅 Absensi Harian</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Rekam kehadiran langsung — data rekap otomatis tersedia untuk laporan.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 flex gap-4 border-b border-gray-100">
        {[
          { id: "input", label: "✏️ Input Hari Ini" },
          { id: "rekap", label: `📊 Rekap ${getNamaBulan()}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${
              tab === t.id
                ? "border-cyan-600 text-cyan-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "input" && (
          <div className="space-y-4">
            {/* Status hari ini */}
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-gray-700">Hari ini:</p>
              <span className="text-xs text-gray-500">{formatTanggal(today)}</span>
            </div>

            {loadingHariIni ? (
              <p className="text-xs text-gray-400 animate-pulse">Memuat status…</p>
            ) : statusHariIni ? (
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${STATUS_CONFIG[statusHariIni.status]?.color}`}>
                <span className="text-xl">{STATUS_CONFIG[statusHariIni.status]?.emoji}</span>
                <div>
                  <p className="text-sm font-bold">
                    Status: {STATUS_CONFIG[statusHariIni.status]?.label}
                  </p>
                  {statusHariIni.keterangan && (
                    <p className="text-xs opacity-80 mt-0.5">{statusHariIni.keterangan}</p>
                  )}
                  <p className="text-xs opacity-60 mt-0.5">
                    Sudah dicatat — klik tombol lain untuk mengubah
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                ⚠️ Absensi hari ini belum dicatat. Pilih status di bawah.
              </div>
            )}

            {/* Keterangan opsional */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Keterangan <span className="font-normal text-gray-400">(opsional)</span>
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Menghadiri rapat TPID, Sakit demam, dll."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Tombol status */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const isActive = statusHariIni?.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => submitAbsensi(status)}
                    disabled={!!submitting}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition
                      ${isActive
                        ? `${cfg.color} ring-2 ring-offset-1 ring-current`
                        : "bg-white border-gray-200 text-gray-600 hover:border-cyan-300 hover:text-cyan-700"
                      } disabled:opacity-40`}
                  >
                    {submitting === status ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <span>{cfg.emoji}</span>
                    )}
                    {cfg.label}
                    {isActive && <span className="ml-auto">✓</span>}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 font-semibold">
                ✓ {success}
              </div>
            )}
          </div>
        )}

        {tab === "rekap" && (
          <div className="space-y-4">
            {/* Ringkasan statistik */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                <div
                  key={status}
                  className={`rounded-xl border px-2 py-2.5 text-center ${cfg.color}`}
                >
                  <p className="text-xl leading-none">{cfg.emoji}</p>
                  <p className="text-[10px] font-semibold mt-1">{cfg.label}</p>
                  <p className="text-lg font-bold mt-0.5">{rekap[status] ?? 0}</p>
                </div>
              ))}
            </div>

            {/* Jumlah hari kerja */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm">
              <span className="font-semibold text-gray-700">Total hari tercatat:</span>{" "}
              <span className="text-cyan-700 font-bold">{rekap.total} hari</span>
              {rekap.alpha > 0 && (
                <span className="ml-3 text-red-600 font-semibold">⚠️ Alpha: {rekap.alpha} hari</span>
              )}
            </div>

            {/* Tabel detail */}
            {loadingBulan ? (
              <p className="text-xs text-gray-400 animate-pulse">Memuat rekap…</p>
            ) : rows.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada data absensi bulan ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Tanggal</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Status</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Keterangan</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const cfg = STATUS_CONFIG[row.status] || {};
                      return (
                        <tr key={row.id || row.tanggal} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                            {formatTanggal(row.tanggal)}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold text-[11px] ${cfg.color}`}>
                              {cfg.emoji} {cfg.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-500">{row.keterangan || "—"}</td>
                          <td className="px-3 py-2">
                            {row.verified_by ? (
                              <span className="text-emerald-600 font-semibold">✓ Verified</span>
                            ) : (
                              <span className="text-gray-400">Belum</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Info: dipakai untuk laporan */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 text-xs text-cyan-700">
              <p className="font-semibold">ℹ️ Data ini digunakan sebagai output laporan</p>
              <p className="mt-1">
                Saat mengajukan tugas "Rekap Absen" ke Kasubag, sistem akan otomatis
                menyertakan ringkasan ini — tidak perlu membuat file eksternal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
