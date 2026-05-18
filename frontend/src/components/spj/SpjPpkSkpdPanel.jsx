/**
 * SpjPpkSkpdPanel.jsx
 *
 * Panel PPK-SKPD untuk Sekretaris / JF Penata Usahaan Keuangan.
 * Tugas: verifikasi final SPJ dari Bendahara + terbitkan nomor SPM.
 *
 * Scope sistem: setelah PPK-SKPD menerbitkan nomor SPM, proses selesai
 * di SIGAP-MALUT. PA otorisasi SPM dan SP2D diproses di SIPD/SIMDA.
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

function PpkItem({ item, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [nomorSpm, setNomorSpm] = useState("");
  const [tanggalSpm, setTanggalSpm] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);
  const [overBudget, setOverBudget] = useState(null);
  const [dpaInfo, setDpaInfo] = useState(null);

  function onExpand() {
    setExpanded((v) => !v);
    if (!expanded && item.status === "diajukan_ke_ppk") {
      // Load DPA info saat expand
      api.get(`/spj/ppk/${item.id}`)
        .then((r) => {
          setDpaInfo(r.data?.data?.dpa || null);
          setOverBudget(r.data?.data?.over_budget || false);
        })
        .catch(() => {});
    }
  }

  async function doTerima() {
    setLoading("terima");
    setMsg(null);
    try {
      await api.post(`/spj/ppk/${item.id}/terima`, { catatan_ppk: catatan || undefined });
      setMsg({ ok: true, text: "SPJ terverifikasi PPK. Masukkan nomor SPM untuk menyelesaikan proses." });
      setTimeout(onRefresh, 1200);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal." });
    } finally { setLoading(null); }
  }

  async function doKembalikan() {
    if (!catatan.trim()) { setMsg({ ok: false, text: "Wajib isi catatan alasan." }); return; }
    setLoading("kembalikan");
    setMsg(null);
    try {
      await api.post(`/spj/ppk/${item.id}/kembalikan`, { catatan_ppk: catatan.trim() });
      setMsg({ ok: true, text: "SPJ dikembalikan ke Bendahara." });
      setTimeout(onRefresh, 1200);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal." });
    } finally { setLoading(null); }
  }

  async function doTerbitkanSpm() {
    if (!nomorSpm.trim()) { setMsg({ ok: false, text: "Nomor SPM wajib diisi." }); return; }
    setLoading("spm");
    setMsg(null);
    try {
      await api.post(`/spj/ppk/${item.id}/terbitkan-spm`, { nomor_spm: nomorSpm.trim(), tanggal_spm: tanggalSpm });
      setMsg({ ok: true, text: `SPM ${nomorSpm} berhasil diterbitkan. Proses selesai di SIGAP-MALUT. PA/KPA dapat menandatangani SPM dan memproses SP2D melalui SIPD/SIMDA.` });
      setTimeout(onRefresh, 1500);
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Gagal menerbitkan SPM." });
    } finally { setLoading(null); }
  }

  const isPending = item.status === "diajukan_ke_ppk";
  const isVerified = item.status === "terverifikasi_ppk";
  const isDone = item.status === "selesai_ppk";

  return (
    <div className={`border rounded-xl overflow-hidden ${isDone ? "border-emerald-200 bg-emerald-50/20" : "border-gray-100 bg-white"}`}>
      <button onClick={onExpand}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SpjStatusBadge status={item.status} />
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
            {item.nomor_spm && <span className="text-emerald-600 font-semibold">SPM: {item.nomor_spm}</span>}
          </div>
        </div>
        <span className="text-gray-400 shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {/* DPA info */}
          {dpaInfo && (
            <div className={`rounded-lg border px-3 py-2 text-xs ${overBudget ? "bg-red-50 border-red-300 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
              <p className="font-semibold mb-1">{overBudget ? "⚠️ MELEBIHI SISA ANGGARAN DPA!" : "✅ Anggaran DPA mencukupi"}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Pagu", fmtRp(dpaInfo.pagu_anggaran)],
                  ["Realisasi", fmtRp(dpaInfo.realisasi)],
                  ["Sisa", fmtRp(dpaInfo.sisa)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] opacity-70">{k}</p>
                    <p className="font-semibold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Kode Rekening", item.kode_rekening],
              ["Sub Kegiatan", item.sub_kegiatan_kode],
              ["Kondisi", item.jenis_kondisi === "delegasi" ? "B — Delegasi" : "A — Mandiri"],
              ["Konfirmasi Pejabat", item.konfirmasi_pejabat_at ? `✅ ${fmt(item.konfirmasi_pejabat_at)}` : (item.jenis_kondisi === "delegasi" ? "⚠️ Belum" : "N/A")],
              ["Verifikasi Bendahara", item.diverifikasi_bendahara_at ? `✅ ${fmt(item.diverifikasi_bendahara_at)}` : "—"],
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

          {/* Aksi PPK */}
          {isPending && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan PPK-SKPD</label>
                <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan hasil verifikasi…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
              <div className="flex gap-2">
                <button onClick={doTerima} disabled={!!loading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition">
                  {loading === "terima" ? "Memverifikasi…" : "✅ Verifikasi PPK OK"}
                </button>
                <button onClick={doKembalikan} disabled={!!loading}
                  className="px-4 py-2 bg-orange-50 hover:bg-orange-100 disabled:opacity-40 text-orange-700 border border-orange-200 text-sm font-semibold rounded-lg transition">
                  {loading === "kembalikan" ? "Memproses…" : "↩️ Kembalikan"}
                </button>
              </div>
            </>
          )}

          {/* Terbitkan SPM */}
          {isVerified && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-indigo-700">📄 Terbitkan SPM (Surat Perintah Membayar)</p>
              <p className="text-[11px] text-indigo-600">
                SPJ terverifikasi. Terbitkan nomor SPM sebagai bukti pengesahan PPK-SKPD.
                Setelah ini, PA/KPA menandatangani SPM fisik dan proses SP2D dilanjutkan di SIPD/SIMDA.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor SPM <span className="text-red-500">*</span></label>
                  <input type="text" value={nomorSpm} onChange={(e) => setNomorSpm(e.target.value)}
                    placeholder="Contoh: SPM/2026/IV/001"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal SPM</label>
                  <input type="date" value={tanggalSpm} onChange={(e) => setTanggalSpm(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              <button onClick={doTerbitkanSpm} disabled={!!loading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition">
                {loading === "spm" ? "Menerbitkan SPM…" : "🖋️ Terbitkan SPM"}
              </button>
            </div>
          )}

          {isDone && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-700">
              <p className="font-bold">✅ Proses Selesai di SIGAP-MALUT</p>
              <p className="mt-0.5">SPM <strong>{item.nomor_spm}</strong> diterbitkan pada {fmt(item.tanggal_spm)}. PA/KPA dapat menandatangani SPM fisik dan melanjutkan ke SIPD/SIMDA untuk SP2D.</p>
            </div>
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

export default function SpjPpkSkpdPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("antrian");

  const load = useCallback(() => {
    setLoading(true);
    api.get("/spj/ppk/antrian", { params: { limit: 30 } })
      .then((r) => setRows(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = rows.filter((r) => r.status === "diajukan_ke_ppk").length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">PPK-SKPD</p>
            <h3 className="font-bold text-gray-800">Verifikasi & Penerbitan SPM</h3>
            <p className="text-xs text-gray-500 mt-0.5">Verifikasi final SPJ dari Bendahara Pengeluaran + terbitkan nomor SPM.</p>
          </div>
          {pending > 0 && (
            <span className="shrink-0 text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-1">
              {pending} menunggu
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {loading ? (
          <p className="text-xs text-gray-400 animate-pulse py-4 text-center">Memuat antrian…</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Tidak ada SPJ dalam antrian PPK.</p>
          </div>
        ) : (
          rows.map((item) => <PpkItem key={item.id} item={item} onRefresh={load} />)
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] text-slate-500 mt-2">
          <p className="font-semibold text-slate-600 mb-1">Scope sistem SIGAP-MALUT:</p>
          <p>
            Proses di SIGAP-MALUT berakhir setelah PPK-SKPD menerbitkan nomor SPM (<code>selesai_ppk</code>).
            Selanjutnya: PA/KPA tandatangan SPM fisik → Kuasa BUD (BPKAD) terbitkan SP2D melalui SIPD/SIMDA.
          </p>
        </div>
      </div>
    </div>
  );
}
