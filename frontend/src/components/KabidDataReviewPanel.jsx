/**
 * KabidDataReviewPanel.jsx
 *
 * Panel review data untuk Kepala Bidang (Kabid).
 *
 * Sesuai pedoman (09-matriks-role-akses-modul, 48, 50, 52):
 * - DATA OPERASIONAL diinput oleh Pelaksana, diverifikasi JF
 * - Kabid MENYETUJUI (approved_kabid), bukan menginput data harian
 *
 * Alur dokumen teknis (dokumen 48):
 *   submitted (Pelaksana) → verified_jf (JF) → approved_kabid (Kabid) → closed
 *
 * Panel ini menampilkan:
 * 1. Ringkasan statistik data yang sudah masuk
 * 2. Daftar item menunggu persetujuan Kabid
 * 3. Tombol Setujui / Kembalikan per item
 * 4. Riwayat data yang sudah disetujui
 */
import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import ModulFormPanel from "./ModulFormPanel";

// ─── Badge status ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  submitted:    { label: "Diajukan",      color: "bg-amber-100 text-amber-700 border-amber-200" },
  verified_jf:  { label: "Terverifikasi JF", color: "bg-blue-100 text-blue-700 border-blue-200" },
  approved_kabid: { label: "Disetujui Kabid", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  returned:     { label: "Dikembalikan",  color: "bg-red-100 text-red-700 border-red-200" },
  draft:        { label: "Draft",         color: "bg-gray-100 text-gray-600 border-gray-200" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.draft;
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, sub, color = "blue" }) {
  const colors = {
    blue:    "bg-blue-50 border-blue-200 text-blue-700",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    red:     "bg-red-50 border-red-200 text-red-700",
    slate:   "bg-slate-50 border-slate-200 text-slate-600",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[color] || colors.slate}`}>
      <p className="text-2xl font-bold">{value ?? "—"}</p>
      <p className="text-xs font-semibold mt-0.5">{label}</p>
      {sub && <p className="text-[11px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Satu item data menunggu persetujuan ─────────────────────────────────────
function ReviewItem({ item, endpoint, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  async function doAction(action) {
    setLoading(action);
    setMsg(null);
    try {
      const url = `${endpoint}/${item.id}/${action}`;
      await api.post(url, action === "return" ? { catatan: catatan.trim() || "Perlu perbaikan" } : {});
      setMsg({ ok: true, text: action === "approve" ? "Disetujui." : "Dikembalikan." });
      setTimeout(() => { onRefresh?.(); }, 1200);
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "Gagal." });
    } finally {
      setLoading(null);
    }
  }

  const title = item.judul || item.title || item.nama || item.kode || `#${item.id}`;
  const submitter = item.submitted_by_name || item.pelaksana || item.created_by_name || "";
  const tgl = item.submitted_at || item.created_at || "";
  const tglStr = tgl ? new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <StatusBadge status={item.status} />
            {submitter && <span className="text-[11px] text-gray-500">dari: {submitter}</span>}
            {tglStr && <span className="text-[11px] text-gray-400">{tglStr}</span>}
          </div>
        </div>
        <span className="text-gray-400 shrink-0 text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {/* Detail ringkas */}
          {item.ringkasan && (
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">
              {item.ringkasan}
            </p>
          )}

          {/* Catatan JF (jika ada) */}
          {item.catatan_jf && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
              <span className="font-semibold">Catatan JF:</span> {item.catatan_jf}
            </div>
          )}

          {/* Catatan untuk kembalikan */}
          {item.status !== "approved_kabid" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catatan (untuk dikembalikan)
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Alasan pengembalian…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          )}

          {/* Tombol aksi */}
          {item.status !== "approved_kabid" && (
            <div className="flex gap-2">
              <button
                onClick={() => doAction("approve")}
                disabled={!!loading}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition"
              >
                {loading === "approve" ? "Memproses…" : "✅ Setujui"}
              </button>
              <button
                onClick={() => doAction("return")}
                disabled={!!loading}
                className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-700 border border-red-200 text-sm font-semibold rounded-lg transition"
              >
                {loading === "return" ? "Memproses…" : "↩️ Kembalikan"}
              </button>
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

// ─── Komponen utama ───────────────────────────────────────────────────────────
export default function KabidDataReviewPanel({
  title,
  subtitle,
  modulId,               // modul_id untuk label
  fetchEndpoint,         // GET endpoint untuk ambil data
  actionEndpoint,        // base endpoint untuk approve/return per item
  statsConfig = [],      // array { label, key, color } untuk statistik
  strategicModulId,      // ModulFormPanel ID untuk input strategis Kabid
  strategicTitle,        // Label form strategis
  emptyMessage = "Belum ada data yang perlu ditinjau.",
}) {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("review"); // "review" | "strategis"
  const [filter, setFilter] = useState("verified_jf"); // status filter

  const load = useCallback(() => {
    if (!fetchEndpoint) { setLoading(false); return; }
    setLoading(true);
    api.get(fetchEndpoint, { params: { limit: 30 } })
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setRows(data);

        // Hitung stats otomatis
        const s = {};
        data.forEach((r) => {
          s[r.status] = (s[r.status] || 0) + 1;
        });
        s.total = data.length;
        setStats(s);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [fetchEndpoint]);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) => !filter || r.status === filter);
  const pending = rows.filter((r) => r.status === "verified_jf").length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-0.5">
              {modulId ? `Modul ${modulId}` : "Data Bidang"} · Review Kabid
            </p>
            <h3 className="font-bold text-gray-800 text-base">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {pending > 0 && (
            <span className="shrink-0 text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1">
              {pending} menunggu
            </span>
          )}
        </div>
      </div>

      {/* Statistik */}
      {statsConfig.length > 0 && (
        <div className={`px-5 py-4 border-b border-gray-100 grid gap-3 ${statsConfig.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
          {statsConfig.map(({ label, key, color }) => (
            <StatTile key={key} label={label} value={stats[key] ?? 0} color={color} />
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 pt-3 flex gap-4 border-b border-gray-100">
        {[
          { id: "review", label: "📋 Review & Setujui" },
          ...(strategicModulId ? [{ id: "strategis", label: "📝 Input Strategis Kabid" }] : []),
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
        {tab === "review" ? (
          <div className="space-y-3">
            {/* Filter status */}
            <div className="flex gap-2 flex-wrap">
              {[
                { val: "", label: "Semua" },
                { val: "verified_jf", label: "Menunggu Persetujuan" },
                { val: "approved_kabid", label: "Sudah Disetujui" },
                { val: "returned", label: "Dikembalikan" },
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => setFilter(f.val)}
                  className={`text-xs px-3 py-1 rounded-full border font-semibold transition ${
                    filter === f.val
                      ? "bg-cyan-600 text-white border-cyan-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-cyan-300"
                  }`}
                >
                  {f.label}
                  {f.val === "verified_jf" && pending > 0 && (
                    <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 text-[10px]">
                      {pending}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-xs text-gray-400 animate-pulse py-4 text-center">Memuat data…</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">{emptyMessage}</p>
                <p className="text-xs text-gray-300 mt-1">
                  Data disubmit Pelaksana → diverifikasi JF → menunggu persetujuan Kabid.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((item) => (
                  <ReviewItem
                    key={item.id}
                    item={item}
                    endpoint={actionEndpoint || fetchEndpoint}
                    onRefresh={load}
                  />
                ))}
              </div>
            )}

            {/* Penjelasan alur */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] text-slate-500 mt-2">
              <p className="font-semibold text-slate-600 mb-1">Alur data sesuai pedoman:</p>
              <p>
                <strong>Pelaksana</strong> input & submit →
                <strong> JF</strong> verifikasi & analisis →
                <strong> Kabid</strong> review & setujui (di sini) →
                diteruskan ke Sekretaris / Kadis.
              </p>
            </div>
          </div>
        ) : (
          /* Tab Input Strategis — hanya form yang benar-benar menjadi kewenangan Kabid */
          strategicModulId ? (
            <div className="space-y-3">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 text-xs text-cyan-700 mb-4">
                <p className="font-semibold">ℹ️ Input Strategis Kabid</p>
                <p className="mt-0.5">
                  Form ini untuk dokumen perencanaan, kebijakan, dan laporan strategis yang menjadi
                  kewenangan Kabid — bukan data operasional harian (itu kewenangan Pelaksana & JF).
                </p>
              </div>
              <ModulFormPanel
                modulId={strategicModulId}
                title={strategicTitle || `Input Strategis — ${title}`}
                layout="two-column"
                showHistory
              />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
