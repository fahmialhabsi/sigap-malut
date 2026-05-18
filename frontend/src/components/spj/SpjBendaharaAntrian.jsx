/**
 * SpjBendaharaAntrian.jsx
 *
 * Panel antrian verifikasi SPJ untuk Bendahara Pengeluaran di Sekretariat.
 * Menerima SPJ dari SEMUA unit (Sekretariat, Bidang, UPTD) karena
 * Bidang & UPTD tidak memiliki Bendahara sendiri.
 *
 * Sesuai: Permendagri 77/2020 + Dokumen 41.
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

function BendaharaItem({ item, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  async function doVerifikasi() {
    setLoading("ok");
    setMsg(null);
    try {
      await api.post(`/spj/bendahara/${item.id}/verifikasi-ok`, { catatan_bendahara: catatan || undefined });
      setMsg({ ok: true, text: "SPJ terverifikasi. Siap dikirim ke PPK-SKPD." });
      setTimeout(onRefresh, 1200);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal verifikasi." });
    } finally { setLoading(null); }
  }

  async function doKembalikan() {
    if (!catatan.trim()) { setMsg({ ok: false, text: "Wajib isi catatan alasan." }); return; }
    setLoading("kembalikan");
    setMsg(null);
    try {
      await api.post(`/spj/bendahara/${item.id}/kembalikan`, { catatan_bendahara: catatan.trim() });
      setMsg({ ok: true, text: "SPJ dikembalikan ke Pelaksana untuk diperbaiki." });
      setTimeout(onRefresh, 1200);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal." });
    } finally { setLoading(null); }
  }

  async function doKirimPpk() {
    setLoading("ppk");
    setMsg(null);
    try {
      await api.post(`/spj/bendahara/${item.id}/kirim-ppk`);
      setMsg({ ok: true, text: "SPJ dikirim ke PPK-SKPD untuk verifikasi final." });
      setTimeout(onRefresh, 1200);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal." });
    } finally { setLoading(null); }
  }

  const isPending = item.status === "diajukan_ke_bendahara" || item.status === "dikembalikan_bendahara";
  const isVerified = item.status === "terverifikasi_bendahara";

  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SpjStatusBadge status={item.status} />
            {item.jenis_kondisi === "delegasi" && (
              <span className="text-[10px] bg-violet-100 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 font-semibold">
                DELEGASI
              </span>
            )}
            {item.unit_kerja_asal && (
              <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2 py-0.5">
                {item.unit_kerja_asal}
              </span>
            )}
          </div>
          <p className="font-semibold text-sm text-gray-800 truncate">
            {item.nomor_spj || `SPJ #${item.id}`} — {item.jenis_belanja?.replace(/_/g, " ")}
          </p>
          <div className="flex gap-3 text-[11px] text-gray-500 mt-0.5 flex-wrap">
            <span>{fmt(item.tanggal_kegiatan)}</span>
            <span className="font-semibold text-gray-700">{fmtRp(item.nominal)}</span>
            {item.revisi_ke > 0 && <span className="text-orange-500">Revisi ke-{item.revisi_ke}</span>}
          </div>
        </div>
        <span className="text-gray-400 shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Kode Rekening", item.kode_rekening],
              ["Sub Kegiatan", item.sub_kegiatan_kode],
              ["Nominal", fmtRp(item.nominal)],
              ["Kondisi B sudah konfirmasi", item.konfirmasi_pejabat_at ? `✅ ${fmt(item.konfirmasi_pejabat_at)}` : (item.jenis_kondisi === "delegasi" ? "⚠️ Belum!" : "N/A (Mandiri)")],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg border border-gray-100 px-2.5 py-1.5">
                <p className="text-[10px] text-gray-400 font-semibold">{k}</p>
                <p className="text-gray-800 font-medium text-[11px]">{v || "—"}</p>
              </div>
            ))}
          </div>

          {item.uraian_kegiatan && (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg border border-gray-100 px-3 py-2">{item.uraian_kegiatan}</p>
          )}

          {item.lampiran_url && (
            <a href={item.lampiran_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-cyan-600 underline hover:no-underline">
              📎 Lihat Lampiran / Bukti Pengeluaran
            </a>
          )}

          {/* Validasi kondisi B: harus sudah dikonfirmasi pejabat */}
          {item.jenis_kondisi === "delegasi" && !item.konfirmasi_pejabat_at && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              ⛔ SPJ delegasi ini BELUM dikonfirmasi pejabat. Sesuai aturan sistem, SPJ ini tidak boleh diverifikasi sebelum pejabat mengkonfirmasi.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan Verifikasi (opsional / wajib jika kembalikan)</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan untuk Pelaksana…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {isPending && !(item.jenis_kondisi === "delegasi" && !item.konfirmasi_pejabat_at) && (
              <button onClick={doVerifikasi} disabled={!!loading}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition">
                {loading === "ok" ? "Memverifikasi…" : "✅ Verifikasi OK"}
              </button>
            )}
            {isPending && (
              <button onClick={doKembalikan} disabled={!!loading}
                className="px-4 py-2 bg-orange-50 hover:bg-orange-100 disabled:opacity-40 text-orange-700 border border-orange-200 text-sm font-semibold rounded-lg transition">
                {loading === "kembalikan" ? "Memproses…" : "↩️ Kembalikan"}
              </button>
            )}
            {isVerified && (
              <button onClick={doKirimPpk} disabled={!!loading}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition">
                {loading === "ppk" ? "Memproses…" : "📨 Kirim ke PPK-SKPD"}
              </button>
            )}
          </div>

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

export default function SpjBendaharaAntrian() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("masuk");

  const load = useCallback(() => {
    setLoading(true);
    const ep = tab === "masuk" ? "/spj/bendahara/masuk" : "/spj/bendahara/dikembalikan-ppk";
    api.get(ep, { params: { limit: 30 } })
      .then((r) => setRows(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">Bendahara Pengeluaran</p>
        <h3 className="font-bold text-gray-800">Antrian Verifikasi SPJ</h3>
        <p className="text-xs text-gray-500 mt-0.5">Menerima SPJ dari Sekretariat, Bidang Ketersediaan/Distribusi/Konsumsi, dan UPTD.</p>
      </div>

      <div className="px-5 pt-3 flex gap-4 border-b border-gray-100">
        {[
          { id: "masuk", label: "📥 SPJ Masuk" },
          { id: "dikembalikan-ppk", label: "↩️ Dikembalikan PPK" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-xs font-semibold pb-2 border-b-2 transition ${tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-3">
        {loading ? (
          <p className="text-xs text-gray-400 animate-pulse py-4 text-center">Memuat antrian…</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Antrian kosong.</p>
          </div>
        ) : (
          rows.map((item) => <BendaharaItem key={item.id} item={item} onRefresh={load} />)
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] text-slate-500 mt-2">
          <p className="font-semibold text-slate-600 mb-1">Catatan penting:</p>
          <p>SPJ Kondisi B (delegasi) yang belum dikonfirmasi pejabat <strong>tidak boleh diverifikasi</strong>. Sistem menampilkan peringatan di setiap item. Setelah verifikasi OK, kirim ke PPK-SKPD untuk pengesahan dan penerbitan SPM.</p>
        </div>
      </div>
    </div>
  );
}
