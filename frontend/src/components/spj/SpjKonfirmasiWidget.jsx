/**
 * SpjKonfirmasiWidget.jsx
 *
 * Widget yang muncul di SEMUA dashboard pejabat (Sekretaris, Kabid, Kasubag,
 * KUPTD, Kasie) ketika ada draft SPJ atas nama mereka yang menunggu konfirmasi.
 *
 * Sesuai dokumen 41 — Kondisi B:
 * "Pejabat WAJIB memeriksa dan menyetujui secara digital sebelum SPJ diproses."
 * "Persetujuan digital dicatat permanen dalam audit trail — tidak dapat dihapus."
 */
import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import SpjStatusBadge from "./SpjStatusBadge";

function fmt(tgl) {
  if (!tgl) return "—";
  return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function fmtRp(val) {
  if (!val && val !== 0) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

// ── Satu item SPJ untuk dikonfirmasi ──────────────────────────────────────
function KonfirmasiItem({ item, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);
  const [sudahBaca, setSudahBaca] = useState(false);

  function onExpand() {
    setExpanded((v) => !v);
    if (!sudahBaca) setSudahBaca(true); // tandai sudah dibaca
  }

  async function doKonfirmasi() {
    if (!sudahBaca) {
      setMsg({ ok: false, text: "Buka dan baca isi SPJ terlebih dahulu sebelum menyetujui." });
      return;
    }
    setLoading("konfirmasi");
    setMsg(null);
    try {
      await api.post(`/spj/atas-nama-saya/${item.id}/konfirmasi`);
      setMsg({ ok: true, text: "SPJ berhasil dikonfirmasi. Tanggung jawab kini ada pada Anda. Audit trail dicatat." });
      setTimeout(onRefresh, 1500);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal konfirmasi." });
    } finally {
      setLoading(null);
    }
  }

  async function doTolak() {
    if (!catatan || catatan.trim().length < 10) {
      setMsg({ ok: false, text: "Isi catatan alasan penolakan minimal 10 karakter." });
      return;
    }
    setLoading("tolak");
    setMsg(null);
    try {
      await api.post(`/spj/atas-nama-saya/${item.id}/tolak`, { catatan: catatan.trim() });
      setMsg({ ok: true, text: "SPJ dikembalikan ke PPTK untuk diperbaiki." });
      setTimeout(onRefresh, 1500);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal menolak." });
    } finally {
      setLoading(null);
    }
  }

  const isPending = item.status === "menunggu_konfirmasi_pejabat";
  const deadlineStr = item.deadline_konfirmasi ? fmt(item.deadline_konfirmasi) : null;

  return (
    <div className={`border rounded-xl overflow-hidden ${isPending ? "border-yellow-300 bg-yellow-50/30" : "border-gray-100 bg-white"}`}>
      <button
        onClick={onExpand}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-white/50 transition"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SpjStatusBadge status={item.status} />
            {isPending && deadlineStr && (
              <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-semibold">
                Deadline: {deadlineStr}
              </span>
            )}
          </div>
          <p className="font-semibold text-sm text-gray-800 truncate">
            {item.nomor_spj || `SPJ #${item.id}`} — {item.jenis_belanja?.replace(/_/g, " ")}
          </p>
          <div className="flex gap-3 text-[11px] text-gray-500 mt-0.5 flex-wrap">
            <span>Dibuat oleh: <span className="font-medium">{item.pptk_nama || "PPTK"}</span></span>
            <span>{fmt(item.tanggal_kegiatan)}</span>
            <span className="font-semibold text-gray-700">{fmtRp(item.nominal)}</span>
          </div>
        </div>
        <span className="text-gray-400 text-sm shrink-0 mt-1">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-yellow-200 pt-3 space-y-3">
          {/* Info detail */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Jenis Belanja", item.jenis_belanja?.replace(/_/g, " ")],
              ["Kode Rekening", item.kode_rekening],
              ["Sub Kegiatan", item.sub_kegiatan_kode],
              ["Nominal", fmtRp(item.nominal)],
            ].map(([k, v]) => (
              <div key={k} className="bg-white rounded-lg border border-gray-100 px-2.5 py-1.5">
                <p className="text-[10px] text-gray-400 font-semibold">{k}</p>
                <p className="text-gray-800 font-medium">{v || "—"}</p>
              </div>
            ))}
          </div>

          {item.uraian_kegiatan && (
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 text-xs text-gray-700">
              <p className="text-[10px] text-gray-400 font-semibold mb-0.5">Uraian Kegiatan</p>
              {item.uraian_kegiatan}
            </div>
          )}

          {item.lampiran_url && (
            <a
              href={item.lampiran_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-cyan-600 underline hover:no-underline"
            >
              📎 Lihat Bukti Pengeluaran / Lampiran
            </a>
          )}

          {/* Peringatan akuntabilitas */}
          {isPending && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs text-amber-800">
              <p className="font-bold">⚠️ PERHATIAN — Akuntabilitas Pejabat</p>
              <p className="mt-0.5">
                Dengan menekan <strong>"Saya Setujui"</strong>, Anda menyatakan bahwa isi SPJ ini
                benar dan sesuai dengan pengeluaran nyata. <strong>Tanggung jawab atas kebenaran
                isi SPJ ini berpindah kepada Anda.</strong> Audit trail dicatat secara permanen.
              </p>
            </div>
          )}

          {/* Aksi */}
          {isPending && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan Penolakan (isi jika akan ditolak)
                </label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Alasan penolakan (min. 10 karakter)…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={doKonfirmasi}
                  disabled={!!loading || !sudahBaca}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition"
                  title={!sudahBaca ? "Buka detail terlebih dahulu" : ""}
                >
                  {loading === "konfirmasi" ? "Menyetujui…" : "✅ Saya Setujui — Tanggung Jawab Ada pada Saya"}
                </button>
                <button
                  onClick={doTolak}
                  disabled={!!loading}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-700 border border-red-200 text-sm font-semibold rounded-lg transition"
                >
                  {loading === "tolak" ? "Memproses…" : "↩️ Tolak"}
                </button>
              </div>
            </>
          )}

          {msg && (
            <p className={`text-xs font-semibold px-3 py-2 rounded-lg border ${msg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Widget utama ───────────────────────────────────────────────────────────
export default function SpjKonfirmasiWidget({ compact = false }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/spj/atas-nama-saya", { params: { limit: 20 } })
      .then((r) => setRows(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = rows.filter((r) => r.status === "menunggu_konfirmasi_pejabat");
  const others = rows.filter((r) => r.status !== "menunggu_konfirmasi_pejabat");

  if (loading) return null;
  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-yellow-300 shadow-sm overflow-hidden">
      <div className={`px-5 py-3 border-b ${pending.length > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">SPJ Atas Nama Anda</p>
            <h3 className="font-bold text-gray-800 text-sm">
              SPJ yang Disiapkan PPTK Atas Nama Anda
            </h3>
          </div>
          {pending.length > 0 && (
            <span className="shrink-0 text-xs font-bold bg-red-500 text-white rounded-full px-2.5 py-1 animate-pulse">
              {pending.length} perlu konfirmasi
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {pending.length > 0 && (
          <>
            <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⏰ {pending.length} SPJ menunggu konfirmasi Anda. Buka dan periksa setiap item, lalu setujui atau tolak.
            </p>
            {pending.map((item) => <KonfirmasiItem key={item.id} item={item} onRefresh={load} />)}
          </>
        )}

        {!compact && showAll && others.map((item) => <KonfirmasiItem key={item.id} item={item} onRefresh={load} />)}

        {!compact && others.length > 0 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs text-cyan-600 underline hover:no-underline"
          >
            {showAll ? "Sembunyikan riwayat" : `Lihat ${others.length} SPJ riwayat lainnya`}
          </button>
        )}
      </div>
    </div>
  );
}
